/**
 * Rebote de flanco final: agrupa llamadas seguidas y solo ejecuta la última,
 * pasado `delayMs` desde la última llamada.
 *
 * `cancel()` es obligatorio y no opcional a propósito: todo consumidor debe
 * llamarlo en su limpieza para que ningún temporizador pendiente dispare
 * contra un mapa (u otro recurso) ya destruido.
 */
export const debounce = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): ((...args: Args) => void) & { cancel: () => void } => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Args) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
};
