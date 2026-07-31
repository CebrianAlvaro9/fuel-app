import type { GeolocationStatus } from "../../hooks/useGeolocation";

interface LocationFilterProps {
  status: GeolocationStatus;
  hasLocation: boolean;
  onToggle: () => void;
}

export const LocationFilter = ({
  status,
  hasLocation,
  onToggle,
}: LocationFilterProps) => {
  const isPending = status === "pending";

  const label = hasLocation
    ? "Desactivar tu ubicación"
    : isPending
      ? "Obteniendo tu ubicación…"
      : "Usar tu ubicación para ver las estaciones cercanas";

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={hasLocation}
      onClick={onToggle}
      className={`btn btn-circle min-h-11 w-11 ${
        hasLocation
          ? "bg-base-content text-base-100 border-base-content hover:bg-base-content"
          : "btn-ghost text-base-content/70 border border-base-300"
      }`}
    >
      {isPending ? (
        <span className="loading loading-spinner loading-sm" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={hasLocation ? 2 : 1.5}
          stroke="currentColor"
          className="size-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
      )}
    </button>
  );
};
