import { useMemo } from "react";
import { useFiltersData } from "../../hooks/useFiltersData";
import type { FilterState } from "../../models/filters.model";
import { SelectFilter } from "./SelectFilter";
import { DatePicker } from "./DatePicker";
import { RadiusFilter } from "./RadiusFilter";
import { SearchModeToggle } from "./SearchModeToggle";
import {
  apiDateToInputValue,
  inputValueToApiDate,
  todayInputValue,
} from "../../helpers/dateFormat";
import {
  LAND_EXCLUDED_PRODUCT_IDS,
  MARINE_PRODUCT_IDS,
  type SearchMode,
} from "../../constants/search";

export type FiltersLayout = "row" | "stack";

interface FiltersFieldsProps {
  layout: FiltersLayout;
  filters: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  hasLocation: boolean;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
}

export const FiltersFields = ({
  layout,
  filters,
  onChange,
  radiusKm,
  onRadiusChange,
  hasLocation,
  searchMode,
  onSearchModeChange,
}: FiltersFieldsProps) => {
  const { options, loaders } = useFiltersData({
    communityId: filters.community,
    provinceId: filters.province,
  });

  const isStack = layout === "stack";
  const selectClass = isStack
    ? "select-md w-full"
    : "select-sm h-10 w-full sm:w-auto";
  const isNearby = searchMode === "nearby";

  /*
   * La API devuelve la misma lista de productos para los dos tipos de estación,
   * pero la mayoría no existe en cada uno. Sin este filtro, elegir p. ej.
   * "Gasolina 98 E5" en marítimas devuelve una lista vacía sin explicación.
   */
  const petrolOptions = useMemo(() => {
    if (!options.petrols) return options.petrols;

    return options.petrols.filter((option) =>
      filters.isMarine
        ? MARINE_PRODUCT_IDS.has(option.value)
        : !LAND_EXCLUDED_PRODUCT_IDS.has(option.value),
    );
  }, [options.petrols, filters.isMarine]);

  const handleCommunityChange = (value: string) => {
    onChange({ community: value, province: "", municipality: "" });
  };

  const handleProvinceChange = (value: string) => {
    onChange({ province: value, municipality: "" });
  };

  // Radio o zona, nunca los dos: son criterios de búsqueda excluyentes.
  const scopeFields = isNearby ? (
    <RadiusFilter
      layout={layout}
      radiusKm={radiusKm}
      onChange={onRadiusChange}
      hasLocation={hasLocation}
      onRequestLocation={() => onSearchModeChange("nearby")}
    />
  ) : (
    <>
      <SelectFilter
        className={selectClass}
        placeholder="Comunidad Autónoma"
        value={filters.community}
        onChange={handleCommunityChange}
        isLoading={loaders.isLoadingCommunities}
        options={options.communities}
      />

      <SelectFilter
        className={selectClass}
        placeholder="Provincia"
        value={filters.province}
        onChange={handleProvinceChange}
        isLoading={loaders.isLoadingProvinces}
        disabled={!filters.community}
        options={options.provinces}
      />

      <SelectFilter
        className={selectClass}
        placeholder="Municipio"
        value={filters.municipality}
        onChange={(val) => onChange({ municipality: val })}
        isLoading={loaders.isLoadingMunicipalities}
        disabled={!filters.province}
        options={options.municipalities}
      />
    </>
  );

  const dateField = filters.isMarine ? null : isStack ? (
    /*
     * En móvil se usa el selector nativo: mejor UX en pantalla pequeña, y
     * evita que el `popover` de react-day-picker (que pinta en el top layer
     * del navegador) se escape por encima del bottom sheet.
     */
    <label className="flex flex-col gap-1 w-full">
      <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">
        Fecha
      </span>
      <input
        type="date"
        max={todayInputValue()}
        value={apiDateToInputValue(filters.date)}
        onChange={(e) => onChange({ date: inputValueToApiDate(e.target.value) })}
        className="input input-md w-full"
      />
    </label>
  ) : (
    <DatePicker value={filters.date} onChange={onChange} />
  );

  if (isStack) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <SelectFilter
          className={selectClass}
          placeholder="Combustible"
          value={filters.petrol}
          onChange={(val) => onChange({ petrol: val })}
          isLoading={loaders.isLoadingPetrols}
          options={petrolOptions}
        />

        <div className="flex flex-col gap-3 rounded-2xl border border-base-300 p-3">
          <SearchModeToggle mode={searchMode} onChange={onSearchModeChange} />
          {scopeFields}
        </div>

        {dateField}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      <SelectFilter
        className={selectClass}
        placeholder="Combustible"
        value={filters.petrol}
        onChange={(val) => onChange({ petrol: val })}
        isLoading={loaders.isLoadingPetrols}
        options={petrolOptions}
      />

      {dateField}

      <div className="h-6 w-px bg-base-300 mx-1" aria-hidden />

      <div className="w-44 shrink-0">
        <SearchModeToggle mode={searchMode} onChange={onSearchModeChange} />
      </div>

      {scopeFields}
    </div>
  );
};
