import { DayPicker } from "react-day-picker";

export interface DatePickerProps {
  onChange: (value: { date: string }) => void;
  date: Date | undefined;
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
}

export const DatePicker = ({ onChange, date, setDate }: DatePickerProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (value: Date | undefined) => {
    setDate(value);
    if (value) {
      const formattedDate = formatDate(value);
      onChange({ date: formattedDate });
    } else {
      onChange({ date: "" });
    }
  };
  return (
    <div>
      <button
        popoverTarget="rdp-popover"
        className="input  w-full h-auto md:w-auto p-1 focus:bg-base-100 disabled:opacity-50 transition-all cursor-pointer  text-sm rounded-xl flex items-center justify-center gap-2"
        style={{ anchorName: "--rdp" } as React.CSSProperties}
      >
        {date ? formatDate(date) : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
        </svg>
}
      </button>
      <div
        popover="auto"
        id="rdp-popover"
        className="dropdown"
        style={{ positionAnchor: "--rdp" } as React.CSSProperties}
      >
        <DayPicker
          className="react-day-picker"
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          disabled={{ after: new Date(today.getTime() - 1) }}
        />
      </div>
    </div>
  );
};
