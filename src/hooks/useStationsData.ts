import { useMemo } from "react";
import type { FilterState } from "../models/filters.model";
import type { Coords } from "../models/ubi.model";
import { useStationsQuery } from "./useStationsQuery";
import {
  filterByRadius,
  mapAndSortByDistance,
  sortByPrice,
} from "../helpers/stationsModifiers";

/**
 * `location` y `radiusKm` se quedan deliberadamente fuera de la clave de la
 * consulta (ver `useStationsQuery`): el endpoint solo depende de `filters`,
 * así que incluirlos provocaría un refetch de ~11.000 estaciones en cada
 * tick del slider.
 */
export const useStationsData = (
  filters: FilterState,
  location: Coords | null,
  radiusKm: number,
) => {
  const { data, isLoading, isFetching, error, refetch } =
    useStationsQuery(filters);

  // O(n log n): solo cuando cambian los datos o la posición del usuario.
  const withDistance = useMemo(
    () =>
      data && location
        ? mapAndSortByDistance(data.ListaEESSPrecio, location)
        : data?.ListaEESSPrecio,
    [data, location],
  );

  // O(n): se recalcula en cada tick del slider, sobre un array ya ordenado.
  const stations = useMemo(() => {
    if (!data || !withDistance) return undefined;

    let list = withDistance;
    if (location) list = filterByRadius(list, radiusKm);
    // `PrecioProducto` solo existe si hay un producto en la URL, así que sin
    // combustible seleccionado no hay nada por lo que ordenar.
    if (filters.petrol) list = sortByPrice(list);

    return { ...data, ListaEESSPrecio: list };
  }, [data, withDistance, location, radiusKm, filters.petrol]);

  // `isFetching` y no `isLoading`: al refrescar ya hay datos en pantalla, así
  // que `isLoading` es false y no serviría para animar el botón.
  return { stations, isLoading, isFetching, error, refetch };
};
