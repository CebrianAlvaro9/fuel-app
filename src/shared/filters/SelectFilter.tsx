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
}

export const SelectFilter = ({
  value,
  onChange,
  options = [],
  disabled = false,
  isLoading = false,
  placeholder,
}: SelectFilterProps) => {
  return (
    <select
      className="select select-bordered select-sm rounded-xl w-full md:w-auto focus:bg-base-100 disabled:opacity-50 transition-all cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
    >
      <option value="" disabled>
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
