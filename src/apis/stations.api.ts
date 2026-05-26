import type { StationsFromApi } from "../models/stations.model";
import { safeAwait } from "../utils/async-wrapper";

const stationsCall = async (
  url: string,
  options?: { signal?: AbortSignal },
): Promise<StationsFromApi> => {
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0].message || "Error obteniendo gasolineras");
  }

  return json as StationsFromApi;
};

export const getLandStations = async (
  url: string,
  options?: { signal?: AbortSignal },
) => {
  return await safeAwait(stationsCall(url, options));
};
