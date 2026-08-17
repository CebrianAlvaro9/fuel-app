import { useEffect, useState, type RefObject } from "react";
import type * as LeafletTypes from "leaflet";
import { debounce } from "../../../helpers/debounce";
import { selectViewport } from "./stationIndex";
import type { BBox, StationIndex, ViewportSelection } from "./stationIndex";
import { recordViewportTiming } from "./mapDebug";
import {
  MAP_VIEWPORT_DEBOUNCE_MS,
  MAP_VIEWPORT_MARKERS,
} from "../../../constants/search";

const EMPTY_SELECTION: ViewportSelection = { visible: [], total: 0 };

/**
 * `getBounds()` no normaliza la longitud: al rodear el mundo `getWest()`
 * puede valer 340 en vez de -20. Se desplaza el recuadro una sola vez por
 * barrido, en vez de normalizar los 11.000 puntos del índice.
 */
const toBBox = (bounds: LeafletTypes.LatLngBounds): BBox => {
  let west = bounds.getWest();
  let east = bounds.getEast();

  if (east > 180) {
    west -= 360;
    east -= 360;
  }

  return { west, south: bounds.getSouth(), east, north: bounds.getNorth() };
};

/**
 * Encuadre: en `moveend`/`zoomend`, con rebote, lee `map.getBounds()` y
 * recorre el índice —ya ordenado por precio— quedándose con las primeras
 * `MAP_VIEWPORT_MARKERS` que caen dentro. No hay ningún `sort` por paneo.
 *
 * Recibe el `RefObject`, no `mapRef.current`: leer un ref durante el render
 * (para pasar su valor como argumento) está prohibido con el React Compiler
 * activado. El `.current` solo se lee dentro del efecto.
 */
export const useMapViewport = (
  mapRef: RefObject<LeafletTypes.Map | null>,
  mapReady: boolean,
  index: StationIndex | null,
): ViewportSelection => {
  const [selection, setSelection] = useState<ViewportSelection>(
    EMPTY_SELECTION,
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const recompute = () => {
      if (!index) {
        setSelection(EMPTY_SELECTION);
        return;
      }

      const start = import.meta.env.DEV ? performance.now() : 0;
      const bbox = toBBox(map.getBounds());
      const next = selectViewport(index, bbox, MAP_VIEWPORT_MARKERS);
      if (import.meta.env.DEV) recordViewportTiming(performance.now() - start);

      setSelection(next);
    };

    const debouncedRecompute = debounce(recompute, MAP_VIEWPORT_DEBOUNCE_MS);

    recompute();
    map.on("moveend", debouncedRecompute);
    map.on("zoomend", debouncedRecompute);

    return () => {
      debouncedRecompute.cancel();
      map.off("moveend", debouncedRecompute);
      map.off("zoomend", debouncedRecompute);
    };
  }, [mapRef, mapReady, index]);

  return selection;
};
