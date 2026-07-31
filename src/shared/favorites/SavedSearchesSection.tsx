import { useState } from "react";
import { buildSearchSummary } from "../../helpers/searchSummary";
import type { SavedSearch } from "../../models/savedSearch.model";

interface SavedSearchesSectionProps {
  favorites: SavedSearch[];
  pinnedId: string | null;
  onApply: (search: SavedSearch) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onTogglePin: (id: string) => void;
}

/**
 * Gestión de búsquedas guardadas: filas a ancho completo con acciones
 * cómodas de tocar, en lugar de menús diminutos dentro de los chips.
 */
export const SavedSearchesSection = ({
  favorites,
  pinnedId,
  onApply,
  onRename,
  onRemove,
  onTogglePin,
}: SavedSearchesSectionProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const startEditing = (search: SavedSearch) => {
    setEditingId(search.id);
    setDraftName(search.name);
  };

  const commitEditing = () => {
    if (editingId && draftName.trim()) onRename(editingId, draftName);
    setEditingId(null);
  };

  if (favorites.length === 0) {
    return (
      <section className="space-y-2">
        <h4 className="text-sm font-bold uppercase tracking-wide text-base-content/60">
          Mis búsquedas
        </h4>
        <p className="text-sm text-base-content/50">
          Guarda una búsqueda para tenerla a un toque. Si la fijas con ★, se
          aplicará sola al abrir la app.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <h4 className="text-sm font-bold uppercase tracking-wide text-base-content/60">
        Mis búsquedas
      </h4>

      <ul className="space-y-2">
        {favorites.map((search) => {
          const isPinned = search.id === pinnedId;
          const isEditing = editingId === search.id;

          return (
            <li
              key={search.id}
              className="flex items-center gap-1 rounded-2xl bg-base-200/60 p-2"
            >
              <button
                type="button"
                onClick={() => onTogglePin(search.id)}
                aria-pressed={isPinned}
                aria-label={
                  isPinned
                    ? `Dejar de fijar ${search.name}`
                    : `Fijar ${search.name} al abrir`
                }
                title={isPinned ? "Fijada al abrir" : "Fijar al abrir"}
                className={`btn btn-ghost btn-sm btn-circle min-h-11 w-11 text-lg ${
                  isPinned ? "text-base-content" : "text-base-content/25"
                }`}
              >
                ★
              </button>

              {isEditing ? (
                <input
                  autoFocus
                  type="text"
                  value={draftName}
                  aria-label="Nuevo nombre"
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={commitEditing}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEditing();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="input input-sm input-bordered flex-1 min-w-0"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onApply(search)}
                  className="flex-1 min-w-0 text-left px-1 py-1"
                >
                  <span className="block truncate font-semibold text-sm">
                    {search.name}
                  </span>
                  <span className="block truncate text-xs text-base-content/50">
                    {buildSearchSummary(search)}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => startEditing(search)}
                aria-label={`Renombrar ${search.name}`}
                className="btn btn-ghost btn-sm btn-circle min-h-11 w-11"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => onRemove(search.id)}
                aria-label={`Borrar ${search.name}`}
                className="btn btn-ghost btn-sm btn-circle min-h-11 w-11 text-base-content/50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
