import { useState } from "react";
import type { FilterState } from "../../models/filters.model";
import type { SavedSearch, SearchSnapshot } from "../../models/savedSearch.model";
import type { GeolocationStatus } from "../../hooks/useGeolocation";
import type { SearchMode } from "../../constants/search";
import { countActiveFilters } from "../../helpers/searchSummary";
import { LocationFilter } from "./LocationFilter";
import { ToggleStationType } from "./ToggleStationType";
import { FiltersFields } from "./FiltersFields";
import { MobileTopBar } from "./MobileTopBar";
import { FiltersSheet } from "./FiltersSheet";
import { FavoriteChips } from "../favorites/FavoriteChips";

interface FiltersProps {
  filters: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  onToggleMarine: (isMarine: boolean) => void;
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  locationStatus: GeolocationStatus;
  locationError: string | null;
  hasLocation: boolean;
  onToggleLocation: () => void;
  resultsCount: number;
  onResetFilters: () => void;
  currentSnapshot: SearchSnapshot;
  favorites: SavedSearch[];
  pinnedId: string | null;
  onApplySearch: (search: SavedSearch) => void;
  onRenameSearch: (id: string, name: string) => void;
  onRemoveSearch: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSaveCurrent: () => void;
  /** Pliega la fila de favoritos en escritorio para dejar sitio al mapa. */
  favoritesCollapsed: boolean;
}

export const Filters = ({
  filters,
  onChange,
  onToggleMarine,
  radiusKm,
  onRadiusChange,
  searchMode,
  onSearchModeChange,
  locationStatus,
  locationError,
  hasLocation,
  onToggleLocation,
  resultsCount,
  onResetFilters,
  currentSnapshot,
  favorites,
  pinnedId,
  onApplySearch,
  onRenameSearch,
  onRemoveSearch,
  onTogglePin,
  onSaveCurrent,
  favoritesCollapsed,
}: FiltersProps) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeFilters = countActiveFilters(filters, searchMode === "nearby");

  const fieldsProps = {
    filters,
    onChange,
    radiusKm,
    onRadiusChange,
    hasLocation,
    searchMode,
    onSearchModeChange,
  };

  return (
    <>
      {/* Móvil: barra compacta pegada arriba + bottom sheet */}
      <div className="md:hidden sticky top-0 z-40 bg-base-100/90 backdrop-blur-xl border-b border-base-300/50 px-4 pt-[calc(0.5rem+env(safe-area-inset-top))] pb-2 mb-4">
        <MobileTopBar
          isMarine={filters.isMarine}
          onToggleMarine={onToggleMarine}
          locationStatus={locationStatus}
          hasLocation={hasLocation}
          onToggleLocation={onToggleLocation}
          activeFilters={activeFilters}
          onOpenFilters={() => setSheetOpen(true)}
        />

        <div className="mt-2">
          <FavoriteChips
            favorites={favorites}
            pinnedId={pinnedId}
            current={currentSnapshot}
            onApply={onApplySearch}
            onSaveCurrent={onSaveCurrent}
          />
        </div>
      </div>

      <FiltersSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        resultsCount={resultsCount}
        onResetFilters={onResetFilters}
        favorites={favorites}
        pinnedId={pinnedId}
        onApplySearch={onApplySearch}
        onRenameSearch={onRenameSearch}
        onRemoveSearch={onRemoveSearch}
        onTogglePin={onTogglePin}
        onSaveCurrent={onSaveCurrent}
        {...fieldsProps}
      />

      {/* Escritorio */}
      <div className="hidden md:block sticky top-4 z-50 px-4 mb-10">
        <div className="max-w-6xl mx-auto bg-base-100/90 backdrop-blur-xl shadow-lg shadow-base-content/5 border border-base-300 rounded-2xl divide-y divide-base-300">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex items-center gap-2 shrink-0">
              <LocationFilter
                status={locationStatus}
                hasLocation={hasLocation}
                onToggle={onToggleLocation}
              />
              <ToggleStationType
                isMarine={filters.isMarine}
                onToggle={onToggleMarine}
              />
            </div>

            <div className="h-6 w-px bg-base-300 shrink-0" aria-hidden />

            <FiltersFields layout="row" {...fieldsProps} />
          </div>

          {/* `grid-rows-[0fr/1fr]` permite animar el plegado sin fijar una
              altura a mano; `invisible` lo saca del foco al estar plegado. */}
          <div
            className={`grid transition-all duration-200 ease-out ${
              favoritesCollapsed
                ? "grid-rows-[0fr] opacity-0 invisible border-transparent"
                : "grid-rows-[1fr] opacity-100"
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 py-2">
                <FavoriteChips
                  favorites={favorites}
                  pinnedId={pinnedId}
                  current={currentSnapshot}
                  onApply={onApplySearch}
                  onSaveCurrent={onSaveCurrent}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {locationError && (
        <div className="px-4 mb-4">
          <div
            role="status"
            className="max-w-6xl mx-auto rounded-xl border border-base-300 bg-base-100 px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5 shrink-0 text-base-content/60"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            <span className="text-base-content/80">{locationError}</span>
          </div>
        </div>
      )}
    </>
  );
};
