import { useState } from "react";
import { useFiltersData } from "../../hooks/useFiltersData";
import type { FilterState } from "../../models/filters.model";
import { SelectFilter } from "./SelectFilter";
import { ToggleStationType } from "./ToggleStationType";
import { LocationFilter } from "./LocationFilter";
import { DatePicker } from "./DatePicker";
import type { Coords } from "../../models/ubi.model";

interface FiltersProps {
  filters: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  setLocation: (location: Coords | null) => void;
}

export const Filters = ({ filters, onChange, setLocation }: FiltersProps) => {
  const { options, loaders } = useFiltersData({
    communityId: filters.community,
    provinceId: filters.province,
  });
  const [date, setDate] = useState<Date | undefined>();

  const handleCommunityChange = (value: string) => {
    onChange({
      community: value,
      province: "",
      municipality: "",
    });
  };
  const handleProvinceChange = (value: string) => {
    onChange({
      province: value,
      municipality: "",
    });
  };

  const handleToggleMarine = (isMarineValue: boolean) => {
    onChange({
      isMarine: isMarineValue,
      community: "",
      province: "",
      municipality: "",
      petrol: "",
      date: "",
    });
    setDate(undefined);
  };

  return (
    <div className="sticky top-6 z-50 px-4 mb-12">
      <div className="relative max-w-5xl mx-auto bg-base-100/80 backdrop-blur-xl shadow-xl shadow-base-content/5 border border-base-300/50 rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start pl-2">
          <ToggleStationType
            isMarine={filters.isMarine}
            onToggle={handleToggleMarine}
          />

          <label
            htmlFor="mobile-menu-toggle"
            className="btn btn-ghost btn-sm btn-circle text-base-content/70 md:hidden cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </label>
        </div>

        <input
          type="checkbox"
          id="mobile-menu-toggle"
          className="peer hidden"
        />

        <div
          className="
              hidden peer-checked:flex md:!flex
              flex-col md:flex-row flex-wrap items-center justify-center gap-3
              w-full md:w-auto absolute md:relative top-[110%] md:top-auto
              left-0 right-0 p-5 md:p-0 bg-base-100 md:bg-transparent
              shadow-2xl md:shadow-none rounded-2xl md:rounded-none
              border border-base-300 md:border-none z-50
            "
        >
          <LocationFilter setLocation={setLocation} />

          <SelectFilter
            placeholder="Comunidad Autónoma"
            value={filters.community}
            onChange={handleCommunityChange}
            isLoading={loaders.isLoadingCommunities}
            options={options.communities}
          />

          <SelectFilter
            placeholder="Provincia"
            value={filters.province}
            onChange={handleProvinceChange}
            isLoading={loaders.isLoadingProvinces}
            disabled={!filters.community}
            options={options.provinces}
          />

          <SelectFilter
            placeholder="Municipio"
            value={filters.municipality}
            onChange={(val) => onChange({ municipality: val })}
            isLoading={loaders.isLoadingMunicipalities}
            disabled={!filters.province}
            options={options.municipalities}
          />

          <SelectFilter
            placeholder="Combustible"
            value={filters.petrol}
            onChange={(val) => onChange({ petrol: val })}
            isLoading={loaders.isLoadingPetrols}
            options={options.petrols}
          />
          <DatePicker date={date} setDate={setDate} onChange={onChange} />
        </div>
      </div>
    </div>
  );
};
