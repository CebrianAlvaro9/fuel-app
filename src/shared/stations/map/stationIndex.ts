import type { AnyStation } from "../../../models/stations.model";
import {
  getStationCoords,
  getStationId,
  parseToNumber,
} from "../../../helpers/stationsModifiers";

export interface StationPoint {
  id: string;
  lat: number;
  lon: number;
  price: number;
  priceLabel: string;
  name: string;
  /** Referencia, no copia: `station` guarda el objeto tal cual viene de la API. */
  station: AnyStation;
}

export interface BBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface StationIndex {
  points: StationPoint[];
  byId: Map<string, StationPoint>;
  bounds: BBox | null;
}

export interface ViewportSelection {
  visible: StationPoint[];
  total: number;
}

/**
 * Único recorrido por el dataset nacional: llama a `getStationCoords` y
 * `parseToNumber` una sola vez por gasolinera, descarta coordenadas
 * inválidas y precios ≤ 0, acumula los límites geográficos de paso y ordena
 * por precio. A partir de aquí, panear nunca vuelve a tocar una cadena de
 * texto.
 */
export const buildStationIndex = (stations: AnyStation[]): StationIndex => {
  const points: StationPoint[] = [];
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;

  for (const station of stations) {
    // `parseToNumber("")` devuelve 0 a propósito, así que un `PrecioProducto`
    // vacío ordenaría el primero y saldría como "la más barata" con 0 €.
    if (!station.PrecioProducto) continue;
    const price = parseToNumber(station.PrecioProducto);
    if (price <= 0) continue;

    const coords = getStationCoords(station);
    if (!coords) continue;

    if (coords.lon < west) west = coords.lon;
    if (coords.lon > east) east = coords.lon;
    if (coords.lat < south) south = coords.lat;
    if (coords.lat > north) north = coords.lat;

    points.push({
      id: getStationId(station),
      lat: coords.lat,
      lon: coords.lon,
      price,
      priceLabel: station.PrecioProducto,
      name: station["Rótulo"],
      station,
    });
  }

  // Nacional NO llega ordenado por precio (ver `useStationsData`): ese orden
  // solo se aplica a la lista derivada, nunca al `data` crudo de React
  // Query. El mapa lee la misma entrada de caché, así que tiene que ordenar
  // aquí explícitamente.
  points.sort((a, b) => a.price - b.price);

  const byId = new Map<string, StationPoint>();
  for (const point of points) byId.set(point.id, point);

  const bounds: BBox | null =
    points.length > 0 ? { west, south, east, north } : null;

  return { points, byId, bounds };
};

/**
 * Recorre el índice —ya ordenado por precio— y se queda con los primeros
 * `limit` que caen dentro del encuadre: como está ordenado, esos primeros N
 * son los N más baratos visibles, sin volver a ordenar en cada paneo.
 *
 * Recorre el índice completo aunque `visible` ya esté lleno: el rótulo
 * "N más baratas de M en esta zona" necesita el total M, y cortar antes de
 * tiempo ahorraría ~0,1 ms a cambio de perder ese dato.
 *
 * `for` indexado sin asignaciones más allá del array resultado, para no
 * volver el bucle megamórfico.
 */
export const selectViewport = (
  index: StationIndex,
  bbox: BBox,
  limit: number,
): ViewportSelection => {
  const visible: StationPoint[] = [];
  let total = 0;

  const points = index.points;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (
      point.lon >= bbox.west &&
      point.lon <= bbox.east &&
      point.lat >= bbox.south &&
      point.lat <= bbox.north
    ) {
      total++;
      if (visible.length < limit) visible.push(point);
    }
  }

  return { visible, total };
};
