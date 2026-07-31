export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  disabled?: boolean;
  isLoading?: boolean;
  placeholder: string;
  /** Clases de tamaño/ancho; el panel móvil las necesita más grandes. */
  className?: string;
}

export const SelectFilter = ({
  value,
  onChange,
  options = [],
  disabled = false,
  isLoading = false,
  placeholder,
  className = "select-sm w-full md:w-auto",
}: SelectFilterProps) => {
  return (
    <select
      aria-label={placeholder}
      className={`select select-bordered rounded-xl focus:bg-base-100 disabled:opacity-50 transition-all cursor-pointer ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
    >
      <option value="">
        {isLoading ? "Cargando..." : placeholder}
      </option>
      {Array.isArray(options) &&
        options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
    </select>
  );
};
