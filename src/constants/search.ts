import type { FilterState } from "../models/filters.model";

export const MIN_RADIUS_KM = 1;
export const MAX_RADIUS_KM = 50;
export const DEFAULT_RADIUS_KM = 10;

/** Las más baratas del encuadre visible que se pintan a la vez. */
export const MAP_VIEWPORT_MARKERS = 100;
/** Rebote del recálculo de encuadre en `moveend`/`zoomend`. */
export const MAP_VIEWPORT_DEBOUNCE_MS = 150;
/** Rebote del guardado de cámara (centro + zoom) en localStorage. */
export const MAP_VIEW_SAVE_DEBOUNCE_MS = 500;

/*
 * La API sirve una única lista de 31 productos para los dos tipos de estación,
 * pero la mayoría no existen en cada uno. Verificado contra la API:
 * en marítimas solo estos 5 devuelven resultados (94, 95, 74, 9 y 1
 * estaciones); el resto da 0 y dejaría al usuario ante una lista vacía sin
 * ninguna explicación.
 */
export const MARINE_PRODUCT_IDS = new Set(["1", "4", "6", "11", "27"]);

/*
 * Productos sin ninguna estación terrestre: fuelóleos (9, 10), combustibles de
 * aviación (12, 13, 14), metanol (29), amoniaco (30) y el gasóleo marítimo (11).
 */
export const LAND_EXCLUDED_PRODUCT_IDS = new Set([
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "29",
  "30",
]);

export const DEFAULT_FILTERS: FilterState = {
  community: "",
  province: "",
  municipality: "",
  petrol: "",
  isMarine: false,
  date: "",
};

/** Terrestres y marítimas conservan cada una sus propios filtros. */
export const DEFAULT_MARINE_FILTERS: FilterState = {
  ...DEFAULT_FILTERS,
  isMarine: true,
};

/**
 * Buscar por cercanía y buscar por zona administrativa son excluyentes: con la
 * ubicación puesta, elegir comunidad/provincia/municipio no aporta nada.
 */
export type SearchMode = "nearby" | "zone";
