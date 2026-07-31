import { LocationFilter } from "./LocationFilter";
import { ToggleStationType } from "./ToggleStationType";
import type { GeolocationStatus } from "../../hooks/useGeolocation";

interface MobileTopBarProps {
  isMarine: boolean;
  onToggleMarine: (isMarine: boolean) => void;
  locationStatus: GeolocationStatus;
  hasLocation: boolean;
  onToggleLocation: () => void;
  activeFilters: number;
  onOpenFilters: () => void;
}

export const MobileTopBar = ({
  isMarine,
  onToggleMarine,
  locationStatus,
  hasLocation,
  onToggleLocation,
  activeFilters,
  onOpenFilters,
}: MobileTopBarProps) => {
  return (
    <div className="flex items-center gap-2">
      <ToggleStationType
        compact
        isMarine={isMarine}
        onToggle={onToggleMarine}
      />

      <LocationFilter
        status={locationStatus}
        hasLocation={hasLocation}
        onToggle={onToggleLocation}
      />

      <div className="flex-1" />

      <div className="indicator">
        {activeFilters > 0 && (
          <span className="indicator-item badge badge-neutral badge-sm font-bold">
            {activeFilters}
          </span>
        )}
        <button
          type="button"
          onClick={onOpenFilters}
          aria-label={`Filtros${activeFilters > 0 ? ` (${activeFilters} activos)` : ""}`}
          title="Filtros"
          className="btn btn-ghost btn-circle min-h-11 w-11 border border-base-300"
        >
          {/* Controles deslizantes: el icono habitual de "filtros" en móvil. */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="size-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
