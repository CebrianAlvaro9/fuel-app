/** La API del Ministerio usa `dd-mm-yyyy`; `<input type="date">` usa `yyyy-mm-dd`. */

export const formatApiDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${date.getFullYear()}`;
};

export const parseApiDate = (value: string): Date | undefined => {
  if (!value) return undefined;

  const [day, month, year] = value.split("-").map(Number);
  if (!day || !month || !year) return undefined;

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const apiDateToInputValue = (value: string): string => {
  const date = parseApiDate(value);
  if (!date) return "";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

/** Hoy en el formato que espera `<input type="date">`, para usarlo como `max`. */
export const todayInputValue = (): string => apiDateToInputValue(formatApiDate(new Date()));

export const inputValueToApiDate = (value: string): string => {
  if (!value) return "";

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";

  return `${day}-${month}-${year}`;
};
