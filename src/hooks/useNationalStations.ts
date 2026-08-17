import { useEffect, useMemo } from "react";
import type { FilterState } from "../models/filters.model";
import { useStationsQuery } from "./useStationsQuery";
import { buildStationIndex } from "../shared/stations/map/stationIndex";
import type { StationIndex } from "../shared/stations/map/stationIndex";
import { recordIndexBuild } from "../shared/stations/map/mapDebug";

interface UseNationalStations {
  index: StationIndex | null;
  isLoading: boolean;
  updatedAt: string | undefined;
}

/**
 * El mapa necesita España entera aunque la lista esté filtrada por zona.
 * `nationalFilters` vacía `community`/`province`/`municipality`; cuando la
 * lista ya es nacional, la `queryKey` coincide con la del mapa → acierto de
 * caché, cero peticiones extra.
 */
export const useNationalStations = (
  filters: FilterState,
): UseNationalStations => {
  const nationalFilters = useMemo<FilterState>(
    () => ({ ...filters, community: "", province: "", municipality: "" }),
    [filters],
  );

  const { data, isLoading } = useStationsQuery(nationalFilters, {
    // Sin combustible no hay `PrecioProducto` que pintar en el mapa.
    enabled: Boolean(filters.petrol),
    // Un fallo cae en el `MapErrorBoundary` existente, que ya ofrece
    // "Volver a la lista".
    throwOnError: true,
  });

  // Recorrido único por dataset: cada gasolinera pasa por
  // `getStationCoords`/`parseToNumber` una sola vez, aunque el mapa panee
  // después.
  const index = useMemo(() => {
    if (!data) return null;
    return buildStationIndex(data.ListaEESSPrecio);
  }, [data]);

  // Instrumentación de solo desarrollo, en un efecto y no en el `useMemo` de
  // arriba: `performance.now()` es una función impura, y el React Compiler
  // exige que el render (y los `useMemo`, que corren durante el render) sean
  // puros. Recalcula el índice una vez más solo para medir — coste asumible,
  // porque `import.meta.env.DEV` hace que Vite elimine esta rama entera del
  // build de producción.
  useEffect(() => {
    if (!import.meta.env.DEV || !data) return;
    const start = performance.now();
    buildStationIndex(data.ListaEESSPrecio);
    recordIndexBuild(performance.now() - start);
  }, [data]);

  return { index, isLoading, updatedAt: data?.Fecha };
};
