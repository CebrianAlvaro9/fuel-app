import { isSameSearch } from "../../helpers/searchSummary";
import type {
  SavedSearch,
  SearchSnapshot,
} from "../../models/savedSearch.model";

interface FavoriteChipsProps {
  favorites: SavedSearch[];
  pinnedId: string | null;
  current: SearchSnapshot;
  onApply: (search: SavedSearch) => void;
  onSaveCurrent: () => void;
}

/**
 * Los chips solo aplican búsquedas. Renombrar / fijar / borrar viven en la
 * sección "Mis búsquedas" del panel de filtros, donde hay sitio para targets
 * táctiles decentes.
 */
export const FavoriteChips = ({
  favorites,
  pinnedId,
  current,
  onApply,
  onSaveCurrent,
}: FavoriteChipsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto snap-x -mx-4 px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {favorites.map((favorite) => {
        const isActive = isSameSearch(favorite, current);

        return (
          <button
            key={favorite.id}
            type="button"
            onClick={() => onApply(favorite)}
            aria-pressed={isActive}
            className={`btn btn-sm rounded-full whitespace-nowrap snap-start shrink-0 ${
              isActive ? "btn-neutral" : "btn-ghost bg-base-200"
            }`}
          >
            {favorite.id === pinnedId && (
              <span aria-label="Fijada" title="Fijada">
                ★
              </span>
            )}
            {favorite.name}
          </button>
        );
      })}

      <button
        type="button"
        onClick={onSaveCurrent}
        className="btn btn-sm btn-outline rounded-full whitespace-nowrap snap-start shrink-0"
      >
        + Guardar
      </button>
    </div>
  );
};
