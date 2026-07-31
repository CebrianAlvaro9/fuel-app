import type * as LeafletTypes from "leaflet";
import { L } from "./leaflet";

interface PriceMarkerOptions {
  price: string;
  name: string;
  isBest: boolean;
  /** Numérico, para que el grupo pueda calcular el mínimo de sus hijos. */
  priceValue: number;
}

/**
 * Leaflet permite ampliar las opciones de un marcador, y es donde se cuelga el
 * precio: así el icono del grupo puede leer el de cada hijo sin mantener un
 * mapa aparte que habría que sincronizar al reconstruir los marcadores.
 */
export interface StationMarkerOptions extends LeafletTypes.MarkerOptions {
  priceValue: number;
}

/**
 * Construido con DOM, no interpolando cadenas: `station["Rótulo"]` viene de
 * la API, y `DivIcon.createIcon` acepta un `Element` y lo añade tal cual en
 * vez de asignarlo a `innerHTML`. Con `textContent` la inyección es
 * estructuralmente imposible, sin tener que acordarse de escapar nada.
 */
export const createPriceMarker = (
  coords: LeafletTypes.LatLngExpression,
  { price, name, isBest, priceValue }: PriceMarkerOptions,
): LeafletTypes.Marker => {
  const container = document.createElement("div");
  container.className = isBest ? "fuel-marker fuel-marker--best" : "fuel-marker";

  const priceEl = document.createElement("span");
  priceEl.className = "fuel-marker__price";
  priceEl.textContent = `${price} €`;

  const nameEl = document.createElement("span");
  nameEl.className = "fuel-marker__name";
  nameEl.textContent = name;

  container.append(priceEl, nameEl);

  const icon = L.divIcon({
    html: container,
    // El valor por defecto es "leaflet-div-icon", que pinta un recuadro
    // blanco con borde alrededor de cada etiqueta.
    className: "",
    // Sin esto Leaflet no puede centrar el icono y las etiquetas se despegan
    // de su gasolinera en algunos niveles de zoom.
    iconSize: [86, 46],
    iconAnchor: [43, 46],
  });

  // Leaflet ordena por latitud: sin esto una etiqueta puede quedar enterrada
  // bajo otra que esté geográficamente más al norte.
  return L.marker(coords, {
    icon,
    zIndexOffset: 1000,
    priceValue,
  } as StationMarkerOptions);
};

/**
 * Icono de un grupo de gasolineras. Muestra el **precio más bajo** que contiene
 * y no solo cuántas hay: agrupar sirve para que el mapa se lea, pero perder de
 * vista el precio dejaría el mapa sin lo único que se viene a mirar.
 */
export const createClusterIcon = (cluster: {
  getAllChildMarkers: () => LeafletTypes.Marker[];
  getChildCount: () => number;
}): LeafletTypes.DivIcon => {
  const prices = cluster
    .getAllChildMarkers()
    .map((marker) => (marker.options as StationMarkerOptions).priceValue)
    .filter((value) => Number.isFinite(value));

  const container = document.createElement("div");
  container.className = "fuel-cluster";

  const priceEl = document.createElement("span");
  priceEl.className = "fuel-cluster__price";
  priceEl.textContent =
    prices.length > 0
      ? `${Math.min(...prices).toFixed(3).replace(".", ",")} €`
      : "—";

  const countEl = document.createElement("span");
  countEl.className = "fuel-cluster__count";
  countEl.textContent = `${cluster.getChildCount()} gasolineras`;

  container.append(priceEl, countEl);

  return L.divIcon({
    html: container,
    className: "",
    iconSize: [78, 44],
    iconAnchor: [39, 44],
  });
};

/** Marcador de la posición del usuario: un punto sólido, sin etiqueta. */
export const createUserMarker = (coords: LeafletTypes.LatLngExpression): LeafletTypes.Marker => {
  const icon = L.divIcon({
    className: "user-marker",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return L.marker(coords, { icon, keyboard: false, zIndexOffset: 500 });
};
