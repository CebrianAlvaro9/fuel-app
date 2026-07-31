import { useEffect, useState } from "react";

/**
 * Fuente única de verdad del número de columnas.
 *
 * `StationsList` maqueta la rejilla con este valor en vez de con clases
 * `md:grid-cols-*`: si el virtualizador trocea de N en N mientras CSS maqueta
 * de M en M, las filas se solapan.
 */
const BREAKPOINTS = [
  { query: "(min-width: 1280px)", columns: 3 },
  { query: "(min-width: 768px)", columns: 2 },
] as const;

const resolveColumns = (): number =>
  BREAKPOINTS.find((b) => window.matchMedia(b.query).matches)?.columns ?? 1;

export const useResponsiveColumns = (): number => {
  // Inicializador lazy: sin él, el escritorio monta con 1 columna y trocea
  // 11.000 estaciones en 11.000 filas antes de corregirse en el primer efecto.
  const [columns, setColumns] = useState(resolveColumns);

  useEffect(() => {
    const mediaQueries = BREAKPOINTS.map((b) => window.matchMedia(b.query));
    const update = () => setColumns(resolveColumns());

    mediaQueries.forEach((mql) => mql.addEventListener("change", update));
    return () =>
      mediaQueries.forEach((mql) => mql.removeEventListener("change", update));
  }, []);

  return columns;
};
