import type { FilterState } from "../models/filters.model";
import type { SearchSnapshot } from "../models/savedSearch.model";

/** La etiqueta geográfica más específica que se haya elegido. */
const deepestGeoLabel = (snapshot: SearchSnapshot): string | undefined =>
  snapshot.labels.municipality ??
  snapshot.labels.province ??
  snapshot.labels.community;

export const buildSearchSummary = (snapshot: SearchSnapshot): string => {
  const parts: string[] = [];

  if (snapshot.filters.isMarine) parts.push("Marítimas");
  if (snapshot.labels.petrol) parts.push(snapshot.labels.petrol);

  const geo = deepestGeoLabel(snapshot);
  if (geo) parts.push(geo);

  if (snapshot.usesLocation) {
    parts.push("Mi ubicación", `${snapshot.radiusKm} km`);
  }

  if (snapshot.filters.date) parts.push(snapshot.filters.date);

  return parts.length > 0 ? parts.join(" · ") : "Todas las estaciones";
};

/**
 * La cascada geográfica cuenta como UN filtro: elegir un municipio implica
 * comunidad y provincia, y mostrar "3" para lo que el usuario vivió como una
 * sola elección resulta desconcertante.
 */
export const countActiveFilters = (
  filters: FilterState,
  hasLocation: boolean,
): number => {
  let count = 0;

  if (filters.community || filters.province || filters.municipality) count += 1;
  if (filters.petrol) count += 1;
  if (filters.date) count += 1;
  if (filters.isMarine) count += 1;
  if (hasLocation) count += 1;

  return count;
};

export const isSameSearch = (a: SearchSnapshot, b: SearchSnapshot): boolean =>
  a.usesLocation === b.usesLocation &&
  (!a.usesLocation || a.radiusKm === b.radiusKm) &&
  a.filters.community === b.filters.community &&
  a.filters.province === b.filters.province &&
  a.filters.municipality === b.filters.municipality &&
  a.filters.petrol === b.filters.petrol &&
  a.filters.isMarine === b.filters.isMarine &&
  a.filters.date === b.filters.date;
