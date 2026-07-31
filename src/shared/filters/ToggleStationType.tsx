interface ToggleStationTypeProps {
  isMarine: boolean;
  onToggle: (isMarineValue: boolean) => void;
  /** Solo iconos: en la barra móvil no hay sitio para las etiquetas. */
  compact?: boolean;
}

export const ToggleStationType = ({
  isMarine,
  onToggle,
  compact = false,
}: ToggleStationTypeProps) => {
  const labelClass = compact ? "sr-only" : "";

  return (
    <div className="bg-base-200/60 p-1 rounded-2xl flex items-center gap-1 border border-base-content/5 shrink-0">
      <button
        type="button"
        onClick={() => onToggle(false)}
        aria-pressed={!isMarine}
        aria-label="Estaciones terrestres"
        className={`${compact ? "px-3.5" : "px-3"} h-10 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
          !isMarine
            ? "bg-base-100 text-neutral shadow-sm"
            : "text-base-content/50 hover:text-base-content"
        }`}
      >
        {/* Icono de Surtidor de Gasolina */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <line x1="3" y1="22" x2="15" y2="22" />
          <line x1="4" y1="9" x2="14" y2="9" />
          <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
          <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
        </svg>
        <span className={labelClass}>Terrestres</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(true)}
        aria-pressed={isMarine}
        aria-label="Estaciones marítimas"
        className={`${compact ? "px-3.5" : "px-3"} h-10 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
          isMarine
            ? "bg-base-100 text-base-content shadow-sm"
            : "text-base-content/50 hover:text-base-content"
        }`}
      >
        {/* Icono de Barco Velero */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M22 18H2a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z" />
          <path d="M21 14 10 2 3 14h18Z" />
          <path d="M10 2v16" />
        </svg>
        <span className={labelClass}>Marítimas</span>
      </button>
    </div>
  );
};
