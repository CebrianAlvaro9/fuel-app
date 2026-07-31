import { MAX_RADIUS_KM, MIN_RADIUS_KM } from "../../constants/search";

interface RadiusFilterProps {
  radiusKm: number;
  onChange: (km: number) => void;
  hasLocation: boolean;
  onRequestLocation: () => void;
  layout: "row" | "stack";
}

export const RadiusFilter = ({
  radiusKm,
  onChange,
  hasLocation,
  onRequestLocation,
  layout,
}: RadiusFilterProps) => {
  const slider = (
    <input
      id="radius-filter"
      type="range"
      min={MIN_RADIUS_KM}
      max={MAX_RADIUS_KM}
      step={1}
      value={radiusKm}
      disabled={!hasLocation}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`range range-neutral ${layout === "stack" ? "range-md" : "range-xs"}`}
    />
  );

  // Escritorio: una sola línea, para no romper la altura de la barra.
  if (layout === "row") {
    return (
      <div
        className={`flex items-center gap-2 h-10 ${hasLocation ? "" : "opacity-45"}`}
        title={
          hasLocation
            ? `Radio de búsqueda: ${radiusKm} km`
            : "Activa tu ubicación para filtrar por radio"
        }
      >
        <label
          htmlFor="radius-filter"
          className="text-xs font-semibold uppercase tracking-wide text-base-content/60 whitespace-nowrap"
        >
          Radio
        </label>
        <div className="w-24">{slider}</div>
        <span className="text-xs font-bold tabular-nums whitespace-nowrap w-12">
          {radiusKm} km
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 w-full ${hasLocation ? "" : "opacity-60"}`}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="radius-filter"
          className="text-xs font-semibold uppercase tracking-wide text-base-content/60"
        >
          Radio
        </label>
        <span className="badge badge-neutral badge-sm font-bold tabular-nums">
          {radiusKm} km
        </span>
      </div>

      {slider}

      <div className="flex justify-between text-[10px] text-base-content/40 px-1">
        <span>{MIN_RADIUS_KM}</span>
        <span>{Math.floor(MAX_RADIUS_KM / 2)}</span>
        <span>{MAX_RADIUS_KM}</span>
      </div>

      {!hasLocation && (
        <button
          type="button"
          onClick={onRequestLocation}
          className="text-[11px] underline underline-offset-2 text-base-content/60 text-left leading-tight mt-0.5"
        >
          Activa tu ubicación para filtrar por radio
        </button>
      )}
    </div>
  );
};
