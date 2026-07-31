interface RefreshButtonProps {
  onRefresh: () => void;
  busy: boolean;
  updatedAt?: string;
}

/**
 * Rehace la búsqueda actual sin recargar la página.
 *
 * Instalada como PWA no hay barra de direcciones ni "tirar para refrescar", así
 * que sin esto la única forma de traer precios nuevos sería cerrar y volver a
 * abrir la app.
 */
export const RefreshButton = ({
  onRefresh,
  busy,
  updatedAt,
}: RefreshButtonProps) => (
  <div className="flex items-center gap-2 shrink-0 self-start">
    {updatedAt && (
      <span className="hidden sm:inline text-[0.7rem] text-base-content/50 whitespace-nowrap">
        {updatedAt}
      </span>
    )}
    <button
      type="button"
      onClick={onRefresh}
      disabled={busy}
      aria-label="Actualizar los precios"
      title="Actualizar los precios"
      /* h-12 y w-12 en móvil: iguala la altura del conmutador (48px), para que
         no parezca un cuadrado suelto al lado. */
      className="btn h-12 min-h-12 w-12 sm:w-auto px-0 sm:px-4 gap-2 border border-base-300 bg-base-100 hover:bg-base-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className={`size-4 ${busy ? "animate-spin" : ""}`}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
        />
      </svg>
      <span className="hidden sm:inline">
        {busy ? "Actualizando…" : "Actualizar"}
      </span>
    </button>
  </div>
);
