import { useEffect, useMemo, useRef, useState } from "react";
import * as L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
// Solo la hoja base (animaciones y patas de la araña). `MarkerCluster.Default.css`
// trae las burbujas verdes y amarillas, que romperían el monocromo.
import "leaflet.markercluster/dist/MarkerCluster.css";
import "./stationsMap.css";
import type { StationsFromApi } from "../../../models/stations.model";
import type { Coords } from "../../../models/ubi.model";
import {
  getStationCoords,
  getStationId,
  parseToNumber,
} from "../../../helpers/stationsModifiers";
import {
  MAP_MARKERS_INITIAL,
  MAP_MARKERS_MAX,
  MAP_MARKERS_STEP,
} from "../../../constants/search";
import {
  createClusterIcon,
  createPriceMarker,
  createUserMarker,
} from "./priceMarker";
import { StationMapCard } from "./StationMapCard";
import { mapContainerClasses } from "./mapLayout";

// La URL de teselas y la atribución viven aquí, no en las constantes
// compartidas, para que se queden dentro del chunk diferido.
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

interface StationsMapProps {
  stations: StationsFromApi;
  location: Coords;
  radiusKm: number;
  petrolLabel?: string;
  favoritesCollapsed: boolean;
}

export const StationsMap = ({
  stations,
  location,
  radiusKm,
  petrolLabel,
  favoritesCollapsed,
}: StationsMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterLayerRef = useRef<L.MarkerClusterGroup | null>(null);
  // La más barata vive fuera del grupo: es la respuesta que se viene a buscar,
  // así que nunca debe quedar escondida dentro de una burbuja.
  const bestLayerRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [visibleCount, setVisibleCount] = useState(MAP_MARKERS_INITIAL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Snapshot para la vista inicial: `L.map(el)` sin `setView` dejaría el mapa
  // sin cargar (`_loaded` a false), y Leaflet difiere el `onAdd` de cualquier
  // capa añadida antes de tener vista — el círculo se queda sin `_map` y
  // `getBounds()` revienta en el efecto 5. Un ref evita listar `location`
  // como dependencia de un efecto que solo debe crear el mapa una vez.
  const initialLocationRef = useRef(location);

  // 1. Crear el mapa, deps []. La limpieza debe llamar a `map.remove()`: en
  // StrictMode React monta → desmonta → monta, y sin eso el segundo `L.map`
  // lanza "Map container is already initialized".
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el).setView(
      [initialLocationRef.current.latitude, initialLocationRef.current.longitude],
      13,
    );
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
    }).addTo(map);
    const bestLayer = L.layerGroup().addTo(map);

    // Limpiar la selección al tocar el fondo del mapa.
    map.on("click", () => setSelectedId(null));

    mapRef.current = map;
    clusterLayerRef.current = clusterLayer;
    bestLayerRef.current = bestLayer;

    return () => {
      map.remove();
      mapRef.current = null;
      clusterLayerRef.current = null;
      bestLayerRef.current = null;
      circleRef.current = null;
      userMarkerRef.current = null;
    };
  }, []);

  // 2. `invalidateSize` con ResizeObserver, deps []. Leaflet cachea el tamaño
  // al construirse; con altura en dvh y barra pegajosa el contenedor puede
  // asentarse un frame tarde y salen franjas grises y clics desalineados. El
  // observer cubre el montaje, la rotación y el resize de escritorio de una
  // vez. Nada de `setTimeout(0)`.
  useEffect(() => {
    const el = containerRef.current;
    const map = mapRef.current;
    if (!el || !map) return;

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // 3. Marcador de usuario y círculo de radio, deps [location, radiusKm].
  // Crear-o-actualizar, nunca recrear.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const latlng: L.LatLngExpression = [location.latitude, location.longitude];

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
  }, [location, radiusKm]);

  // Filtro defensivo: `sortByPrice` solo protege contra `undefined`, y
  // `parseToNumber("")` devuelve 0 a propósito, así que un `PrecioProducto`
  // vacío ordenaría el primero y saldría como "la más barata" con 0 €.
  const priced = useMemo(
    () =>
      stations.ListaEESSPrecio.filter(
        (s) => s.PrecioProducto && parseToNumber(s.PrecioProducto) > 0,
      ),
    [stations],
  );

  // 4. Marcadores, deps [priced, visibleCount]. `clearLayers()` y reconstruir;
  // con 50 marcadores diferenciar es prematuro.
  useEffect(() => {
    const cluster = clusterLayerRef.current;
    const bestLayer = bestLayerRef.current;
    if (!cluster || !bestLayer) return;

    cluster.clearLayers();
    bestLayer.clearLayers();

    const visible = priced.slice(0, Math.min(visibleCount, priced.length));
    const batch: L.Marker[] = [];
    let bestAssigned = false;

    visible.forEach((station) => {
      // Siempre desde `getStationCoords`, nunca desde `LatitudParsed`/
      // `LongitudParsed`: esos campos solo se rellenan en la rama de éxito de
      // `mapAndSortByDistance`, y `getStationCoords` ya filtra el caso (0,0).
      const coords = getStationCoords(station);
      if (!coords) return;

      const isBest = !bestAssigned;
      bestAssigned = true;

      const marker = createPriceMarker([coords.lat, coords.lon], {
        // `priced` ya garantiza que `PrecioProducto` es una cadena no vacía.
        price: station.PrecioProducto!,
        name: station["Rótulo"],
        isBest,
        priceValue: parseToNumber(station.PrecioProducto!),
      });
      marker.on("click", () => setSelectedId(getStationId(station)));

      if (isBest) bestLayer.addLayer(marker);
      else batch.push(marker);
    });

    // `addLayers` en lote: el plugin reconstruye su índice una sola vez en vez
    // de una por marcador.
    cluster.addLayers(batch);
  }, [priced, visibleCount]);

  // 5. `fitBounds` al círculo, deps [location, radiusKm]. Al círculo y no al
  // conjunto de marcadores, para que la vista siempre responda "en qué área
  // estoy buscando". Deliberadamente sin `stations`/`priced`: reencuadrar en
  // cada cambio de datos le arrancaría la vista de las manos a quien haya
  // paneado.
  useEffect(() => {
    const map = mapRef.current;
    const circle = circleRef.current;
    if (!map || !circle) return;

    map.fitBounds(circle.getBounds());
  }, [location, radiusKm]);

  // Escape cierra la ficha, igual que tocar el fondo del mapa.
  useEffect(() => {
    if (!selectedId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  // Selección por id, no por objeto: un refetch o un cambio de radio no dejan
  // pinchada una ficha obsoleta, simplemente se cierra.
  const selectedStation = useMemo(
    () => priced.find((s) => getStationId(s) === selectedId) ?? null,
    [priced, selectedId],
  );

  const visibleShown = Math.min(visibleCount, priced.length);
  const canShowMore =
    visibleShown < priced.length && visibleShown < MAP_MARKERS_MAX;

  return (
    <div className={mapContainerClasses(favoritesCollapsed)}>
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {priced.length > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-base-100/90 backdrop-blur px-3 py-2 rounded-xl border border-base-300 text-xs font-semibold text-base-content shadow-sm text-right">
          {petrolLabel && (
            <div className="text-[0.65rem] font-bold uppercase tracking-wide text-base-content/60">
              {petrolLabel}
            </div>
          )}
          <div>
            Mostrando las {visibleShown} más baratas de {priced.length}
          </div>
          {canShowMore && (
            <button
              type="button"
              className="btn btn-xs btn-neutral mt-1"
              onClick={() =>
                setVisibleCount((count) =>
                  Math.min(count + MAP_MARKERS_STEP, MAP_MARKERS_MAX, priced.length),
                )
              }
            >
              Ver más
            </button>
          )}
        </div>
      )}

      {selectedStation && (
        <StationMapCard
          station={selectedStation}
          petrolLabel={petrolLabel}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};
