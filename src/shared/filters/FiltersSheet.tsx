import { useEffect, useRef } from "react";
import { FiltersFields } from "./FiltersFields";
import { SavedSearchesSection } from "../favorites/SavedSearchesSection";
import type { FilterState } from "../../models/filters.model";
import type { SavedSearch } from "../../models/savedSearch.model";
import type { SearchMode } from "../../constants/search";

interface FiltersSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (updates: Partial<FilterState>) => void;
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  hasLocation: boolean;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
  resultsCount: number;
  onResetFilters: () => void;
  favorites: SavedSearch[];
  pinnedId: string | null;
  onApplySearch: (search: SavedSearch) => void;
  onRenameSearch: (id: string, name: string) => void;
  onRemoveSearch: (id: string) => void;
  onTogglePin: (id: string) => void;
  onSaveCurrent: () => void;
}

/**
 * `<dialog>` nativo en lugar de un div posicionado: aporta focus trap, fondo
 * inerte y Escape gratis, y al pintar en el top layer del navegador resuelve
 * bien el apilado frente a cualquier popover.
 */
export const FiltersSheet = ({
  open,
  onClose,
  filters,
  onChange,
  radiusKm,
  onRadiusChange,
  hasLocation,
  searchMode,
  onSearchModeChange,
  resultsCount,
  onResetFilters,
  favorites,
  pinnedId,
  onApplySearch,
  onRenameSearch,
  onRemoveSearch,
  onTogglePin,
  onSaveCurrent,
}: FiltersSheetProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="modal modal-bottom" onClose={onClose}>
      {/*
        `p-0` es imprescindible: el padding propio de `.modal-box` desplaza el
        anclaje de `sticky top-0` (que se resuelve contra el padding box), y el
        contenido asomaba por encima de la cabecera al hacer scroll.
      */}
      <div className="modal-box max-h-[85dvh] overflow-y-auto rounded-t-3xl p-0">
        <div className="sticky top-0 z-20 bg-base-100 border-b border-base-300 px-5 pt-3 pb-3">
          <div
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-base-300"
            aria-hidden
          />
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Filtros</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar filtros"
              className="btn btn-sm btn-circle btn-ghost min-h-11 w-11"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-5 py-5 space-y-6">
          <FiltersFields
            layout="stack"
            filters={filters}
            onChange={onChange}
            radiusKm={radiusKm}
            onRadiusChange={onRadiusChange}
            hasLocation={hasLocation}
            searchMode={searchMode}
            onSearchModeChange={onSearchModeChange}
          />

          <div className="border-t border-base-300" />

          <SavedSearchesSection
            favorites={favorites}
            pinnedId={pinnedId}
            onApply={(search) => {
              onApplySearch(search);
              onClose();
            }}
            onRename={onRenameSearch}
            onRemove={onRemoveSearch}
            onTogglePin={onTogglePin}
          />

          <button
            type="button"
            onClick={onSaveCurrent}
            className="btn btn-outline btn-sm w-full min-h-11"
          >
            + Guardar búsqueda actual
          </button>
        </div>

        {/* Los filtros se aplican en vivo; el pie solo cierra y muestra el recuento. */}
        <div className="sticky bottom-0 z-20 bg-base-100 border-t border-base-300 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="btn btn-ghost flex-1 min-h-12"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-neutral flex-1 min-h-12"
          >
            Ver {resultsCount} resultados
          </button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>Cerrar</button>
      </form>
    </dialog>
  );
};
