/**
 * "Cómo llegar" promete ruta, no solo un pin: el modo `search` de Google Maps
 * deja caer un marcador, pero `dir` abre ya la navegación turn-by-turn.
 */
export const buildDirectionsUrl = (coords: { lat: number; lon: number }): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}&travelmode=driving`;
