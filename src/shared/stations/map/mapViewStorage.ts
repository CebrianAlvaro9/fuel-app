export const MAP_VIEW_KEY = "fuel-app:map-view:v1";

export interface MapView {
  lat: number;
  lon: number;
  zoom: number;
}

/**
 * Funciones de módulo, no `useLocalStorage`: ese hook guarda en estado de
 * React, así que cada paneo provocaría un render de todo el mapa. Lectura
 * síncrona fuera del ciclo de React y escritura imperativa desde el listener
 * de Leaflet, como ya hace `favoritesStorage.ts`. Cero renders por paneo.
 */
export const readMapView = (): MapView | null => {
  try {
    const raw = window.localStorage.getItem(MAP_VIEW_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<MapView>;
    const { lat, lon, zoom } = parsed;

    // Validación dura: una entrada corrupta reventaría dentro de `setView` y
    // solo la recogería la barrera de errores.
    const valid =
      typeof lat === "number" &&
      Number.isFinite(lat) &&
      lat >= -90 &&
      lat <= 90 &&
      typeof lon === "number" &&
      Number.isFinite(lon) &&
      lon >= -180 &&
      lon <= 180 &&
      typeof zoom === "number" &&
      Number.isFinite(zoom) &&
      zoom >= 0 &&
      zoom <= 24;

    return valid ? { lat: lat!, lon: lon!, zoom: zoom! } : null;
  } catch {
    return null;
  }
};

export const writeMapView = (view: MapView): void => {
  try {
    window.localStorage.setItem(MAP_VIEW_KEY, JSON.stringify(view));
  } catch {
    // Cuota agotada o Safari en privado: se pierde la cámara guardada, sin más.
  }
};
