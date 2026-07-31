import { MAX_RADIUS_KM } from "../../constants/search";

interface EmptyResultsProps {
  hasLocation: boolean;
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  onResetFilters: () => void;
}

export const EmptyResults = ({
  hasLocation,
  radiusKm,
  onRadiusChange,
  onResetFilters,
}: EmptyResultsProps) => {
  const canWiden = hasLocation && radiusKm < MAX_RADIUS_KM;
  const doubled = Math.min(radiusKm * 2, MAX_RADIUS_KM);

  return (
    <div className="flex flex-col items-center text-center gap-4 py-16 px-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.25}
        stroke="currentColor"
        className="size-14 text-base-content/25"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>

      <div className="space-y-1">
        <h3 className="text-lg font-bold">
          {canWiden
            ? `No hay estaciones en ${radiusKm} km`
            : "No hay resultados con estos filtros"}
        </h3>
        <p className="text-sm text-base-content/60 max-w-xs">
          {canWiden
            ? "Prueba a ampliar el radio de búsqueda."
            : "Prueba a quitar algún filtro para ver más estaciones."}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {canWiden ? (
          <>
            {doubled < MAX_RADIUS_KM && (
              <button
                type="button"
                className="btn btn-neutral btn-sm min-h-11"
                onClick={() => onRadiusChange(doubled)}
              >
                Ampliar a {doubled} km
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline btn-sm min-h-11"
              onClick={() => onRadiusChange(MAX_RADIUS_KM)}
            >
              Ampliar a {MAX_RADIUS_KM} km
            </button>
          </>
        ) : (
          <button
            type="button"
            className="btn btn-outline btn-sm min-h-11"
            onClick={onResetFilters}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};
