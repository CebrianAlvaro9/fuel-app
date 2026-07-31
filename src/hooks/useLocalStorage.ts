import { useCallback, useState } from "react";

const resolveInitial = <T,>(initial: T | (() => T)): T =>
  typeof initial === "function" ? (initial as () => T)() : initial;

/**
 * Estado persistido en localStorage.
 *
 * La escritura ocurre dentro del setter y no en un `useEffect`: un efecto se
 * dispararía también al montar y machacaría lo guardado con el valor de
 * respaldo si el parseo hubiera fallado alguna vez.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T | (() => T),
): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return resolveInitial(initial);
      return JSON.parse(raw) as T;
    } catch {
      return resolveInitial(initial);
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStored((prev) => {
        const next =
          typeof value === "function" ? (value as (p: T) => T)(prev) : value;

        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Cuota agotada o Safari en privado: el estado en memoria sigue bien.
        }

        return next;
      });
    },
    [key],
  );

  return [stored, setValue];
}
