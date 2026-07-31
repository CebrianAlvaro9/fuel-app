import * as LeafletNamespace from "leaflet";
import "leaflet.markercluster";

/*
 * Punto único de entrada a Leaflet, y no un `import * as L` en cada fichero.
 *
 * `leaflet.markercluster` es un plugin UMD: no exporta nada, sino que añade
 * `markerClusterGroup` al objeto que le devuelve `require('leaflet')`. Con
 * `import * as L` obtenemos el *namespace* del módulo, que es un objeto
 * inmutable construido con los exports conocidos en tiempo de compilación, así
 * que las propiedades que el plugin añade después no aparecen ahí.
 *
 * En desarrollo no se notaba porque Vite pre-empaqueta Leaflet y el namespace
 * acaba siendo el propio objeto mutable; en el build de producción son objetos
 * distintos y `L.markerClusterGroup` quedaba `undefined`, lo que reventaba el
 * mapa y, sin barrera de errores, dejaba la app en blanco.
 *
 * Tomando `default` cuando existe se usa el mismo objeto que el plugin muta.
 */
const interop = LeafletNamespace as typeof LeafletNamespace & {
  default?: typeof LeafletNamespace;
};

export const L = interop.default ?? interop;

/** Falla pronto y con un mensaje legible si el plugin no llegó a engancharse. */
export const assertClusterPlugin = () => {
  if (typeof L.markerClusterGroup !== "function") {
    throw new Error(
      "leaflet.markercluster no se ha registrado sobre Leaflet: revisa el import en map/leaflet.ts",
    );
  }
};
