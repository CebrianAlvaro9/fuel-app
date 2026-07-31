import type {
  AnyStation,
  LandStationPrice,
  MaritimeStationPrice,
} from "../models/stations.model";
import type { Coords } from "../models/ubi.model";

export const parseToNumber = (coordStr: string): number => {
  if (!coordStr) return 0;
  return parseFloat(coordStr.replace(",", "."));
};

/**
 * Coordenadas usables de una estación, o null si faltan.
 *
 * `parseToNumber("")` devuelve 0 (comportamiento intencionado para precios),
 * así que una estación sin coordenadas caería en (0, 0) — el golfo de Guinea.
 * Aquí se detecta ese caso en vez de calcular una distancia de 4.400 km.
 */
export const getStationCoords = (
  station: LandStationPrice | MaritimeStationPrice,
): { lat: number; lon: number } | null => {
  const lat = parseToNumber(station.Latitud);
  const lon = parseToNumber(station["Longitud (WGS84)"]);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat === 0 && lon === 0) return null;

  return { lat, lon };
};

export const getStationId = (
  station: LandStationPrice | MaritimeStationPrice,
): string => {
  return "IDPosteMaritimo" in station ? station.IDPosteMaritimo : station.IDEESS;
};

export const getHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Añade la distancia al usuario y ordena de más cerca a más lejos.
 * Las estaciones sin coordenadas válidas reciben distancia `Infinity`, así que
 * ordenan al final y fallan automáticamente cualquier filtro de radio.
 */
export const mapAndSortByDistance = (
  stations: AnyStation[],
  location: Coords,
): AnyStation[] => {
  const mappedStations = stations.map((station) => {
    const coords = getStationCoords(station);

    if (!coords) {
      return { ...station, distanciaUsuarioKm: Number.POSITIVE_INFINITY };
    }

    const distanceKm = getHaversineDistance(
      location.latitude,
      location.longitude,
      coords.lat,
      coords.lon,
    );

    return {
      ...station,
      LatitudParsed: coords.lat,
      LongitudParsed: coords.lon,
      distanciaUsuarioKm: Number(distanceKm.toFixed(2)),
    };
  });

  return mappedStations.sort(
    (a, b) => a.distanciaUsuarioKm - b.distanciaUsuarioKm,
  );
};

export const filterByRadius = (
  stations: AnyStation[],
  radiusKm: number,
): AnyStation[] =>
  stations.filter((s) => (s.distanciaUsuarioKm ?? Infinity) <= radiusKm);

/**
 * No mutante a propósito: el array de entrada puede venir directamente de la
 * caché de React Query, y `Array.prototype.sort` ordena in situ.
 */
export const sortByPrice = (stations: AnyStation[]): AnyStation[] => {
  return [...stations].sort((a, b) => {
    if (a.PrecioProducto === undefined) return 1;
    if (b.PrecioProducto === undefined) return -1;
    return parseToNumber(a.PrecioProducto) - parseToNumber(b.PrecioProducto);
  });
};
