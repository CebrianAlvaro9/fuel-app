interface ToggleStationTypeProps {
  isMarine: boolean;
  onToggle: (isMarineValue: boolean) => void;
}

export const ToggleStationType = ({
  isMarine,
  onToggle,
}: ToggleStationTypeProps) => {
  return (
    <div className="bg-base-200/60 p-1 rounded-2xl flex items-center gap-1 border border-base-content/5">
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
          !isMarine
            ? "bg-base-100 text-primary shadow-sm"
            : "text-base-content/50 hover:text-base-content"
        }`}
      >
        <span>⛽</span> Terrestres
      </button>
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
          isMarine
            ? "bg-base-100 text-secondary shadow-sm"
            : "text-base-content/50 hover:text-base-content"
        }`}
      >
        <span>⛵</span> Marítimas
      </button>
    </div>
  );
};
