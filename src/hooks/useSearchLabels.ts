import { useMemo } from "react";
import { useFiltersData } from "./useFiltersData";
import type { FilterState } from "../models/filters.model";
import type { SearchLabels } from "../models/savedSearch.model";

type Option = { value: string; label: string };

const labelOf = (options: Option[] | undefined, value: string) =>
  value ? options?.find((o) => o.value === value)?.label : undefined;

/**
 * Resuelve las etiquetas legibles de los filtros actuales para congelarlas al
 * guardar una búsqueda. Reutiliza las mismas query keys que `useFiltersData`,
 * así que React Query deduplica y no genera ninguna petición extra.
 */
export const useSearchLabels = (filters: FilterState): SearchLabels => {
  const { options } = useFiltersData({
    communityId: filters.community,
    provinceId: filters.province,
  });

  return useMemo(
    () => ({
      community: labelOf(options.communities, filters.community),
      province: labelOf(options.provinces, filters.province),
      municipality: labelOf(options.municipalities, filters.municipality),
      petrol: labelOf(options.petrols, filters.petrol),
    }),
    [
      options.communities,
      options.provinces,
      options.municipalities,
      options.petrols,
      filters.community,
      filters.province,
      filters.municipality,
      filters.petrol,
    ],
  );
};
