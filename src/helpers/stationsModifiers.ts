import type { LandStationPrice, MaritimeStationPrice, StationExtra } from "../models/stations.model";
import type { Coords } from "../models/ubi.model";

type Station = (MaritimeStationPrice | LandStationPrice | (MaritimeStationPrice & StationExtra) | (LandStationPrice & StationExtra))[];

export const parseToNumber = (coordStr: string): number => {
  if (!coordStr) return 0;
  return parseFloat(coordStr.replace(",", "."));
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


export const mapAndSortByDistance = (stations: Station, location: Coords) => {
  const mappedStations = stations.map((station) => {
    const stationLat = parseToNumber(station.Latitud);
    const stationLon = parseToNumber(station["Longitud (WGS84)"]);

    const distanceKm = getHaversineDistance(
      location.latitude,
      location.longitude,
      stationLat,
      stationLon,
    );

    return {
      ...station,
      LatitudParsed: stationLat,
      LongitudParsed: stationLon,
      distanciaUsuarioKm: Number(distanceKm.toFixed(2)),
    };
  });

  return mappedStations.sort((a, b) => {
    if (a.distanciaUsuarioKm === null || a.distanciaUsuarioKm === undefined) return 1;
    if (b.distanciaUsuarioKm === null || b.distanciaUsuarioKm === undefined) return -1;
    return a.distanciaUsuarioKm - b.distanciaUsuarioKm;
  });
};


export const sortByPrice = (stations: Station) => {
  return stations.sort((a, b) => {
    if (a.PrecioProducto === undefined) return 1;
    if (b.PrecioProducto === undefined) return -1;
    return parseToNumber(a.PrecioProducto) - parseToNumber(b.PrecioProducto);
  });
};
