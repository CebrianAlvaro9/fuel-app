import { useQuery } from "@tanstack/react-query";
import type { FilterState } from "../models/filters.model";
import { getLandStations } from "../apis/stations.api";
import type { StationsFromApi } from "../models/stations.model";
import { buildStationsEndpoint } from "../helpers/endpointBuilder";

export const useStationsData = (filters: FilterState) => {
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
  });

  return { stations, isLoading, error };
};
