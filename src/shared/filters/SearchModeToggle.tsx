import type { SearchMode } from "../../constants/search";

interface SearchModeToggleProps {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

const OPTIONS: { value: SearchMode; label: string }[] = [
  { value: "nearby", label: "Cerca de mí" },
  { value: "zone", label: "Por zona" },
];

/**
 * Alterna entre los dos criterios de búsqueda. Son excluyentes a propósito:
 * cada uno muestra sus propios campos (radio o comunidad/provincia/municipio).
 */
export const SearchModeToggle = ({ mode, onChange }: SearchModeToggleProps) => (
  <div
    role="tablist"
    aria-label="Criterio de búsqueda"
    className="bg-base-200 p-1 rounded-xl flex items-center gap-1 border border-base-300 w-full"
  >
    {OPTIONS.map((option) => {
      const isActive = mode === option.value;

      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onChange(option.value)}
          className={`flex-1 h-10 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
);
