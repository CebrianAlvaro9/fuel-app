import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { FilterState } from "../models/filters.model";
import { getLandStations } from "../apis/stations.api";
import type { StationsFromApi } from "../models/stations.model";
import { buildStationsEndpoint } from "../helpers/endpointBuilder";

type StationsQueryOptions = Pick<
  UseQueryOptions<StationsFromApi, Error>,
  "enabled" | "throwOnError"
>;

/**
 * Consulta cruda de estaciones, extraída de `useStationsData` para que la
 * lista y el mapa compartan la misma entrada de caché: misma `queryKey`
 * (sin cambiar de forma) ⇒ mismo resultado de `useQuery`.
 *
 * `gcTime` a 30 min (el doble del `staleTime`) para que alternar Lista↔Mapa
 * no tire la entrada nacional con el defecto de 5 min. El `AbortSignal` que
 * ya acepta `getLandStations` se pasa tal cual: `safeAwait` relanza
 * `AbortError` en vez de envolverlo, así que React Query lo ve como
 * cancelación real y un cambio rápido de filtro aborta la descarga de 11k
 * en vuelo.
 */
export const useStationsQuery = (
  filters: FilterState,
  options?: StationsQueryOptions,
) => {
  const endpoint = buildStationsEndpoint(filters);

  return useQuery({
    queryKey: ["stations", filters],
    queryFn: async ({ signal }) => {
      const [data, err] = await getLandStations(endpoint, { signal });
      if (err) throw new Error(err.message);
      return data as StationsFromApi;
    },
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    ...options,
  });
};
