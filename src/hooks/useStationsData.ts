import { useQuery } from "@tanstack/react-query";
import type { FilterState } from "../models/filters.model";
import { getLandStations } from "../apis/stations.api";
import type { StationsFromApi } from "../models/stations.model";
import { buildStationsEndpoint } from "../helpers/endpointBuilder";
import type { Coords } from "../models/ubi.model";
import {
  mapAndSortByDistance,
  sortByPrice,
} from "../helpers/stationsModifiers";
// Importamos los helpers que crearemos a continuación

export const useStationsData = (
  filters: FilterState,
  location: Coords | null,
) => {
  const endpoint = buildStationsEndpoint(filters);

  const {
    data: stations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stations", filters],
    queryFn: async () => {
      const [data, err] = await getLandStations(endpoint);
      if (err) throw new Error(err.message);
      return data as StationsFromApi;
    },
    select: (data) => {
      let processedStations = [...data.ListaEESSPrecio];

      if (location) {
        processedStations = mapAndSortByDistance(
          processedStations,
          location,
        )
      }

      if (filters.petrol) {
        if(location) processedStations = processedStations.slice(0, 50);
        processedStations = sortByPrice(processedStations);
      }

      return { ...data, ListaEESSPrecio: processedStations };
    },
  });

  return { stations, isLoading, error };
};
