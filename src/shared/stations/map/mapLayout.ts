/**
 * Compartida entre el `fallback` de `Suspense` y el mapa real: si divergieran,
 * cargar el chunk diferido daría un salto de layout.
 */
const BASE =
  "relative isolate h-[70dvh] min-h-[420px] md:min-h-[480px] rounded-2xl overflow-hidden border border-base-300";

/**
 * Alto del contenedor del mapa, compartido entre el `fallback` de `Suspense` y
 * el mapa real: si divergieran, cargar el chunk diferido daría un salto.
 *
 * En escritorio se saca de la ventana en vez de fijarlo en píxeles, y crece
 * **exactamente** lo que encoge la barra al plegar los favoritos (2.75rem). Que
 * la suma se mantenga constante es lo que evita el bucle: si el plegado
 * acortara el documento, el navegador recortaría el scroll por debajo del
 * umbral, se desplegaría solo y volvería a empezar.
 */
export const mapContainerClasses = (favoritesCollapsed: boolean): string =>
  `${BASE} ${
    favoritesCollapsed
      ? "md:h-[calc(100dvh-11.25rem)]"
      : "md:h-[calc(100dvh-14rem)]"
  }`;
