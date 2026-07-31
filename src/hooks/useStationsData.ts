import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FilterState } from "../models/filters.model";
import { getLandStations } from "../apis/stations.api";
import type { StationsFromApi } from "../models/stations.model";
import { buildStationsEndpoint } from "../helpers/endpointBuilder";
import type { Coords } from "../models/ubi.model";
import {
  filterByRadius,
  mapAndSortByDistance,
  sortByPrice,
} from "../helpers/stationsModifiers";

/**
 * `location` y `radiusKm` se quedan deliberadamente fuera de `queryKey`: el
 * endpoint solo depende de `filters`, así que incluirlos provocaría un refetch
 * de ~11.000 estaciones en cada tick del slider.
 */
export const useStationsData = (
  filters: FilterState,
  location: Coords | null,
  radiusKm: number,
) => {
  const endpoint = buildStationsEndpoint(filters);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["stations", filters],
    queryFn: async () => {
      const [data, err] = await getLandStations(endpoint);
      if (err) throw new Error(err.message);
      return data as StationsFromApi;
    },
    staleTime: 1000 * 60 * 15,
  });

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
