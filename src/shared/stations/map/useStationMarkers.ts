import { useEffect, useRef, type RefObject } from "react";
import type * as LeafletTypes from "leaflet";
import { createPriceIcon, createPriceMarker } from "./priceMarker";
import type { StationPoint } from "./stationIndex";
import { recordChurn } from "./mapDebug";

interface MarkerEntry {
  marker: LeafletTypes.Marker;
  isBest: boolean;
}

interface UseStationMarkersArgs {
  clusterLayerRef: RefObject<LeafletTypes.MarkerClusterGroup | null>;
  bestLayerRef: RefObject<LeafletTypes.LayerGroup | null>;
  mapReady: boolean;
  visible: StationPoint[];
  onSelect: (id: string) => void;
}

/**
 * Reconciliación con un `Map<id, Marker>`: se añade solo lo que entra y se
 * quita solo lo que sale, en vez del `clearLayers()` + reconstrucción
 * completa de antes. La más barata cambia de icono con `setIcon` en vez de
 * recrear el marcador.
 *
 * Recibe los `RefObject` de las capas, no su `.current`: leer un ref durante
 * el render está prohibido con el React Compiler activado, así que el
 * `.current` solo se lee dentro del efecto.
 */
export const useStationMarkers = ({
  clusterLayerRef,
  bestLayerRef,
  mapReady,
  visible,
  onSelect,
}: UseStationMarkersArgs) => {
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  const onSelectRef = useRef(onSelect);

  // `onSelect` se sincroniza al ref desde un efecto (nunca durante el
  // render, que el React Compiler prohíbe) para que un cambio de identidad
  // del callback no dispare por sí solo una reconciliación.
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // StrictMode, el más peligroso: tras el `map.remove()` del efecto de
  // creación del mapa, `markersRef` sobrevive al remontaje por diseño y
  // sigue lleno. Sin vaciarlo aquí, la reconciliación cree que todo está
  // puesto y el mapa sale vacío solo en desarrollo.
  useEffect(() => {
    const markers = markersRef.current;
    return () => {
      markers.clear();
    };
  }, [mapReady]);

  useEffect(() => {
    const clusterLayer = clusterLayerRef.current;
    const bestLayer = bestLayerRef.current;
    if (!clusterLayer || !bestLayer || !mapReady) return;

    const markers = markersRef.current;
    const nextIds = new Set(visible.map((point) => point.id));
    // `visible` ya viene ordenado por precio (ver `selectViewport`), así que
    // el primero es la más barata visible.
    const bestId = visible[0]?.id ?? null;

    let added = 0;
    let removed = 0;
    let kept = 0;

    // Bajas: lo que ya no está visible.
    const removedFromCluster: LeafletTypes.Marker[] = [];
    for (const [id, entry] of markers) {
      if (nextIds.has(id)) continue;

      if (entry.isBest) bestLayer.removeLayer(entry.marker);
      else removedFromCluster.push(entry.marker);

      markers.delete(id);
      removed++;
    }
    if (removedFromCluster.length > 0) {
      clusterLayer.removeLayers(removedFromCluster);
    }

    const addedToCluster: LeafletTypes.Marker[] = [];

    for (const point of visible) {
      const isBest = point.id === bestId;
      const existing = markers.get(point.id);

      if (existing) {
        kept++;
        if (existing.isBest !== isBest) {
          // Cambia quién es la más barata: mismo marcador, solo se
          // intercambia el icono y la capa, sin recrear el objeto.
          existing.marker.setIcon(
            createPriceIcon({
              price: point.priceLabel,
              name: point.name,
              isBest,
            }),
          );
          if (isBest) {
            clusterLayer.removeLayers([existing.marker]);
            bestLayer.addLayer(existing.marker);
          } else {
            bestLayer.removeLayer(existing.marker);
            addedToCluster.push(existing.marker);
          }
          existing.isBest = isBest;
        }
        continue;
      }

      // Alta: marcador nuevo.
      const marker = createPriceMarker([point.lat, point.lon], {
        price: point.priceLabel,
        name: point.name,
        isBest,
        priceValue: point.price,
      });
      marker.on("click", () => onSelectRef.current(point.id));

      if (isBest) bestLayer.addLayer(marker);
      else addedToCluster.push(marker);

      markers.set(point.id, { marker, isBest });
      added++;
    }

    // `addLayers`/`removeLayers` en lote: el plugin reconstruye su índice
    // una sola vez en vez de una por marcador.
    if (addedToCluster.length > 0) clusterLayer.addLayers(addedToCluster);

    if (import.meta.env.DEV) recordChurn({ added, removed, kept });
  }, [clusterLayerRef, bestLayerRef, mapReady, visible]);
};
