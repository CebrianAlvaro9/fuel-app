import * as L from "leaflet";

interface PriceMarkerOptions {
  price: string;
  name: string;
  isBest: boolean;
}

/**
 * Construido con DOM, no interpolando cadenas: `station["Rótulo"]` viene de
 * la API, y `DivIcon.createIcon` acepta un `Element` y lo añade tal cual en
 * vez de asignarlo a `innerHTML`. Con `textContent` la inyección es
 * estructuralmente imposible, sin tener que acordarse de escapar nada.
 */
export const createPriceMarker = (
  coords: L.LatLngExpression,
  { price, name, isBest }: PriceMarkerOptions,
): L.Marker => {
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
  return L.marker(coords, { icon, zIndexOffset: 1000 });
};

/** Marcador de la posición del usuario: un punto sólido, sin etiqueta. */
export const createUserMarker = (coords: L.LatLngExpression): L.Marker => {
  const icon = L.divIcon({
    className: "user-marker",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  return L.marker(coords, { icon, keyboard: false, zIndexOffset: 500 });
};
