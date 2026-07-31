type StationsView = "list" | "map";

interface StationsViewToggleProps {
  view: StationsView;
  onChange: (view: StationsView) => void;
  hasLocation: boolean;
  hasFuel: boolean;
}

const OPTIONS: { value: StationsView; label: string }[] = [
  { value: "list", label: "Lista" },
  { value: "map", label: "Mapa" },
];

/**
 * Deshabilitado con pista, no oculto: ocultarlo haría el mapa indescubrible
 * justo para quien no cumple la condición.
 */
export const StationsViewToggle = ({
  view,
  onChange,
  hasLocation,
  hasFuel,
}: StationsViewToggleProps) => {
  const mapDisabled = !hasLocation || !hasFuel;
  const hint = !hasLocation
    ? "Activa tu ubicación para ver el mapa"
    : !hasFuel
      ? "Elige un combustible para ver los precios en el mapa"
      : null;

  return (
    <div className="mb-4">
      <div
        role="tablist"
        aria-label="Vista de resultados"
        className="bg-base-200 p-1 rounded-xl flex items-center gap-1 border border-base-300 w-full sm:w-64"
      >
        {OPTIONS.map((option) => {
          const isActive = view === option.value;
          const isDisabled = option.value === "map" && mapDisabled;

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={isDisabled}
              title={isDisabled && hint ? hint : undefined}
              onClick={() => onChange(option.value)}
              className={`flex-1 h-10 text-xs font-bold rounded-lg transition-all ${
                isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
              } ${
                isActive
                  ? "bg-base-100 text-base-content shadow-sm"
                  : "text-base-content/50 hover:text-base-content"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Los botones deshabilitados no disparan hover, así que el `title`
          solo no basta (y en móvil no existe). */}
      {mapDisabled && hint && (
        <p className="text-xs text-base-content/50 mt-1 pl-1">{hint}</p>
      )}
    </div>
  );
};
