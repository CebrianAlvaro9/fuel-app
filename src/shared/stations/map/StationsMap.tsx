import { useEffect, useRef, useState } from "react";
import type * as LeafletTypes from "leaflet";
import { assertClusterPlugin, L } from "./leaflet";
import "leaflet/dist/leaflet.css";
// Solo la hoja base (animaciones y patas de la araña). `MarkerCluster.Default.css`
// trae las burbujas verdes y amarillas, que romperían el monocromo.
import "leaflet.markercluster/dist/MarkerCluster.css";
import "./stationsMap.css";
import type { FilterState } from "../../../models/filters.model";
import type { Coords } from "../../../models/ubi.model";
import { createClusterIcon, createUserMarker } from "./priceMarker";
import { StationMapCard } from "./StationMapCard";
import { mapContainerClasses } from "./mapLayout";
import { useNationalStations } from "../../../hooks/useNationalStations";
import { useMapViewport } from "./useMapViewport";
import { useStationMarkers } from "./useStationMarkers";
import { readMapView, writeMapView } from "./mapViewStorage";
import { debounce } from "../../../helpers/debounce";
import { MAP_VIEW_SAVE_DEBOUNCE_MS } from "../../../constants/search";
import { recordMap } from "./mapDebug";

// La URL de teselas y la atribución viven aquí, no en las constantes
// compartidas, para que se queden dentro del chunk diferido.
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Igual que las de arriba: específicas del mapa, se quedan en el chunk
// diferido en vez de irse a las constantes compartidas.
const SPAIN_CENTER: LeafletTypes.LatLngTuple = [40.2, -3.7];
const SPAIN_DEFAULT_ZOOM = 6;
const MIN_ZOOM = 5;
// Península + Baleares + Canarias, con holgura para no pegar el mapa al borde.
const SPAIN_MAX_BOUNDS: LeafletTypes.LatLngBoundsExpression = [
  [24, -20],
  [44.5, 5],
];

interface StationsMapProps {
  filters: FilterState;
  location: Coords | null;
  radiusKm: number;
  petrolLabel?: string;
  favoritesCollapsed: boolean;
}

export const StationsMap = ({
  filters,
  location,
  radiusKm,
  petrolLabel,
  favoritesCollapsed,
}: StationsMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletTypes.Map | null>(null);
  const clusterLayerRef = useRef<LeafletTypes.MarkerClusterGroup | null>(null);
  // La más barata vive fuera del grupo: es la respuesta que se viene a
  // buscar, así que nunca debe quedar escondida dentro de una burbuja.
  const bestLayerRef = useRef<LeafletTypes.LayerGroup | null>(null);
  const circleRef = useRef<LeafletTypes.Circle | null>(null);
  const userMarkerRef = useRef<LeafletTypes.Marker | null>(null);
  // Arranca en `true` cuando ya había una vista guardada, para que el
  // encuadre inicial a los límites del índice no le pelee la vista a quien
  // ya había paneado.
  const didAutoFrameRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Primitivas, no el objeto `location`: su identidad cambia en cada
  // refresco de la búsqueda por cercanía.
  const lat = location?.latitude;
  const lon = location?.longitude;

  const { index, updatedAt } = useNationalStations(filters);

  // 1. Crear el mapa, deps []. La limpieza debe llamar a `map.remove()`: en
  // StrictMode React monta → desmonta → monta, y sin eso el segundo `L.map`
  // lanza "Map container is already initialized".
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    assertClusterPlugin();

    const map = L.map(el, {
      minZoom: MIN_ZOOM,
      maxBounds: SPAIN_MAX_BOUNDS,
      maxBoundsViscosity: 1,
    });

    // Siempre un `setView` síncrono: la vista guardada si existe, si no
    // España. Esto no es negociable — `_loaded` debe ser `true` antes de
    // añadir capas o llamar a `getBounds()`, y `setView` es lo único que lo
    // pone a `true`.
    const savedView = readMapView();
    if (savedView) {
      map.setView([savedView.lat, savedView.lon], savedView.zoom);
    } else {
      map.setView(SPAIN_CENTER, SPAIN_DEFAULT_ZOOM);
    }
    didAutoFrameRef.current = Boolean(savedView);

    L.tileLayer(TILE_URL, {
      maxZoom: 19,
      attribution: TILE_ATTRIBUTION,
    }).addTo(map);
    const clusterLayer = L.markerClusterGroup({
      iconCreateFunction: createClusterIcon,
      // El polígono de cobertura al pasar el ratón es azul y no aporta nada
      // aquí; las patas de la araña se fuerzan al color del tema.
      showCoverageOnHover: false,
      spiderLegPolylineOptions: { weight: 1.2, color: "#18181b", opacity: 0.6 },
      maxClusterRadius: 46,
      // Con hasta 100 marcadores por barrido, sin esto `addLayers` puede
      // congelar la página un instante en dispositivos lentos.
      chunkedLoading: true,
    }).addTo(map);
    const bestLayer = L.layerGroup().addTo(map);

    // Limpiar la selección al tocar el fondo del mapa.
    map.on("click", () => setSelectedId(null));

    mapRef.current = map;
    clusterLayerRef.current = clusterLayer;
    bestLayerRef.current = bestLayer;
    if (import.meta.env.DEV) recordMap(map);
    setMapReady(true);

    return () => {
      // Volcado síncrono de la cámara antes de destruir el mapa: React limpia
      // los efectos en el mismo orden en que se declararon (no al revés), así
      // que la limpieza del efecto 7 —declarado después— se ejecutaría
      // *después* de este `map.remove()` y `getCenter()` reventaría contra un
      // mapa ya destruido. Este es el único punto donde el mapa sigue vivo en
      // el momento de desmontar, así que el volcado final vive aquí.
      const center = map.getCenter();
      writeMapView({ lat: center.lat, lon: center.lng, zoom: map.getZoom() });

      map.remove();
      mapRef.current = null;
      clusterLayerRef.current = null;
      bestLayerRef.current = null;
      circleRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  // 2. `invalidateSize` con ResizeObserver, coalescido con
  // `requestAnimationFrame` (no con temporizador: al montar, debe caer en el
  // frame siguiente o se ven franjas grises) y con `{ pan: false }`:
  // `favoritesCollapsed` cambia la altura al hacer scroll, y un
  // `invalidateSize` que panea emitiría `moveend`, provocando un recálculo
  // de encuadre y una escritura de cámara espurios en cada scroll.
  useEffect(() => {
    const el = containerRef.current;
    const map = mapRef.current;
    if (!el || !map) return;

    /*
     * Pasada inmediata y síncrona, además del observer: si el primer disparo
     * del `ResizeObserver` cae con la pestaña en segundo plano, el
     * `requestAnimationFrame` no se ejecuta y Leaflet se queda con el tamaño
     * que cacheó al construirse. Si ese tamaño era cero, `getBounds()`
     * devuelve un recuadro degenerado (`west === east`), el filtro por
     * encuadre no encuentra nada y el mapa se queda vacío para siempre,
     * porque el contenedor no vuelve a cambiar de tamaño y el observer no
     * dispara otra vez.
     */
    map.invalidateSize({ pan: false });

    let rafId: number | null = null;
    const observer = new ResizeObserver(() => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        map.invalidateSize({ pan: false });
      });
    });
    observer.observe(el);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // 3. Marcador de usuario y círculo de radio, deps [mapReady, lat, lon,
  // radiusKm]. Crear-o-actualizar, nunca recrear. Sin ubicación, retira
  // ambas capas y sale: el círculo ya no manda sobre la cámara.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    if (lat === undefined || lon === undefined) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
        circleRef.current = null;
      }
      return;
    }

    const latlng: LeafletTypes.LatLngExpression = [lat, lon];

    if (!userMarkerRef.current) {
      userMarkerRef.current = createUserMarker(latlng).addTo(map);
    } else {
      userMarkerRef.current.setLatLng(latlng);
    }

    const radiusMeters = radiusKm * 1000;
    if (!circleRef.current) {
      // interactive: false, o se traga los clics de los marcadores cercanos
      // al centro.
      circleRef.current = L.circle(latlng, {
        radius: radiusMeters,
        interactive: false,
        className: "search-radius-circle",
      }).addTo(map);
    } else {
      circleRef.current.setLatLng(latlng);
      circleRef.current.setRadius(radiusMeters);
    }
  }, [mapReady, lat, lon, radiusKm]);

  /*
   * 3b. Encuadrar al radio cuando cambia la ubicación o el radio.
   *
   * Activar la ubicación (o mover el radio) ya es decir "llévame ahí", y el
   * mapa debe enseñar lo mismo que la lista, que está filtrada por ese radio.
   * Se compara contra el último trío encuadrado en vez de depender solo de las
   * dependencias del efecto: `requestLocation()` se vuelve a llamar en cada
   * refresco y devuelve coordenadas iguales, y refrescar no debería mover la
   * cámara. Y como solo reacciona a cambios reales, panear libremente después
   * no se ve interrumpido: la vista se queda donde la dejes hasta que vuelvas
   * a tocar ubicación o radio.
   */
  const lastFramedRef = useRef<string | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    const circle = circleRef.current;
    if (!map || !mapReady || !circle || lat === undefined || lon === undefined) {
      return;
    }

    const clave = `${lat},${lon},${radiusKm}`;
    if (lastFramedRef.current === clave) return;
    lastFramedRef.current = clave;

    // Evita que el encuadre inicial sobre los datos (efecto 6) pise a éste.
    didAutoFrameRef.current = true;
    map.fitBounds(circle.getBounds(), { padding: [24, 24] });
  }, [mapReady, lat, lon, radiusKm]);

  // 4. Encuadre: recalcula la selección visible en `moveend`/`zoomend`. Se le
  // pasa el `RefObject`, no `mapRef.current`: leerlo aquí, en el cuerpo del
  // render, está prohibido con el React Compiler activado.
  const selection = useMapViewport(mapRef, mapReady, index);

  // 5. Marcadores: reconcilia el `Map<id, Marker>` contra la selección.
  useStationMarkers({
    clusterLayerRef,
    bestLayerRef,
    mapReady,
    visible: selection.visible,
    onSelect: setSelectedId,
  });

  // 6. Encuadre inicial, solo la primera vez. `didAutoFrameRef` arranca en
  // `true` si ya había vista guardada, así nada pelea contra ella. Si no,
  // `fitBounds` a los límites del índice; eso emite `moveend`, que recalcula
  // y guarda. Se autocorrige sin segunda pasada.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !index?.bounds || didAutoFrameRef.current) return;

    didAutoFrameRef.current = true;
    const { west, south, east, north } = index.bounds;
    map.fitBounds([
      [south, west],
      [north, east],
    ]);
  }, [mapReady, index]);

  // 7. Persistir cámara con rebote en `moveend`/`zoomend`. El volcado final
  // (para no perder el último paneo antes de volver a Lista) vive en la
  // limpieza del efecto 1 y no en la de este: React limpia los efectos en el
  // mismo orden en que se declararon, así que la limpieza de este efecto
  // llegaría *después* del `map.remove()` del efecto 1, y `getCenter()`
  // reventaría contra un mapa ya destruido.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const persist = () => {
      const center = map.getCenter();
      writeMapView({ lat: center.lat, lon: center.lng, zoom: map.getZoom() });
    };

    const debouncedPersist = debounce(persist, MAP_VIEW_SAVE_DEBOUNCE_MS);

    map.on("moveend", debouncedPersist);
    map.on("zoomend", debouncedPersist);

    return () => {
      debouncedPersist.cancel();
      map.off("moveend", debouncedPersist);
      map.off("zoomend", debouncedPersist);
    };
  }, [mapReady]);

  // 8. Escape cierra la ficha, igual que tocar el fondo del mapa.
  useEffect(() => {
    if (!selectedId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  // Recentrar ya no es automático (pelearía con la cámara recordada): es una
  // acción explícita del usuario sobre el círculo de radio.
  const recenterToLocation = () => {
    const map = mapRef.current;
    const circle = circleRef.current;
    if (!map || !circle) return;
    map.fitBounds(circle.getBounds());
  };

  // Selección por id, no por objeto: O(1) en vez de un `.find()` sobre 11k
  // por cada toque.
  const selectedPoint = selectedId ? (index?.byId.get(selectedId) ?? null) : null;

  return (
    <div className={mapContainerClasses(favoritesCollapsed)}>
      <div ref={containerRef} className="absolute inset-0 z-0" />

      <div className="absolute top-3 right-3 z-10 bg-base-100/90 backdrop-blur px-3 py-2 rounded-xl border border-base-300 text-xs font-semibold text-base-content shadow-sm text-right">
        {petrolLabel && (
          <div className="text-[0.65rem] font-bold uppercase tracking-wide text-base-content/60">
            {petrolLabel}
          </div>
        )}
        {!index ? (
          <div>Cargando estaciones…</div>
        ) : selection.total === 0 ? (
          <>
            <div>No hay gasolineras en esta zona</div>
            <div className="text-[0.65rem] font-normal text-base-content/60">
              Aleja el mapa o muévelo a otra ciudad
            </div>
          </>
        ) : selection.visible.length === selection.total ? (
          <div>Mostrando las {selection.total} de esta zona</div>
        ) : (
          <div>
            {selection.visible.length} más baratas de {selection.total} en
            esta zona
          </div>
        )}
        {updatedAt && (
          <div className="text-[0.65rem] font-normal text-base-content/50 mt-0.5">
            Actualizado: {updatedAt}
          </div>
        )}
      </div>

      {location && (
        <button
          type="button"
          onClick={recenterToLocation}
          aria-label="Centrar en mi ubicación"
          title="Mi ubicación"
          className="absolute bottom-3 right-3 z-10 btn btn-circle btn-neutral shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="size-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
        </button>
      )}

      {selectedPoint && (
        <StationMapCard
          station={selectedPoint.station}
          petrolLabel={petrolLabel}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};
