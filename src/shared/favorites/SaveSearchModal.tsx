import { useEffect, useRef } from "react";
import { buildSearchSummary } from "../../helpers/searchSummary";
import type { SearchSnapshot } from "../../models/savedSearch.model";

interface SaveSearchModalProps {
  open: boolean;
  snapshot: SearchSnapshot;
  onSave: (name: string) => void;
  onClose: () => void;
}

export const SaveSearchModal = ({
  open,
  snapshot,
  onSave,
  onClose,
}: SaveSearchModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const summary = buildSearchSummary(snapshot);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = new FormData(event.currentTarget).get("name");
    onSave((typeof value === "string" ? value.trim() : "") || summary);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-bottom sm:modal-middle"
      onClose={onClose}
    >
      <div className="modal-box">
        <h3 className="font-bold text-lg">Guardar búsqueda</h3>
        <p className="text-sm text-base-content/60 mt-1">{summary}</p>

        {/* `key` remonta el formulario al abrir, para que `defaultValue`
            vuelva a tomar el resumen actual sin pisar lo que se escriba. */}
        <form
          key={String(open)}
          onSubmit={handleSubmit}
          className="mt-4 space-y-4"
        >
          <input
            autoFocus
            type="text"
            name="name"
            defaultValue={summary}
            placeholder="Nombre de la búsqueda"
            aria-label="Nombre de la búsqueda"
            className="input input-bordered w-full"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1 min-h-11"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-neutral flex-1 min-h-11">
              Guardar
            </button>
          </div>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>Cerrar</button>
      </form>
    </dialog>
  );
};
