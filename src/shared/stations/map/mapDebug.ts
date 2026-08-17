/**
 * Instrumentación de solo desarrollo para poder sacar los números que pide
 * la "Verificación" del plan (construcción del índice, recálculo de
 * encuadre, reutilización de marcadores) desde la consola del navegador.
 *
 * `import.meta.env.DEV` hace que Vite elimine estas ramas en el build de
 * producción: no es una instrumentación permanente ni cambia el
 * comportamiento del mapa, solo expone contadores en `window` mientras se
 * desarrolla.
 */
export interface MapDebugChurn {
  added: number;
  removed: number;
  kept: number;
}

export interface MapDebugState {
  indexBuildMs: number[];
  viewportTimings: number[];
  churn: MapDebugChurn[];
  /** Asa al mapa para poder panear y hacer zoom desde la consola al medir. */
  map?: unknown;
}

declare global {
  interface Window {
    __mapDebug?: MapDebugState;
  }
}

const ensure = (): MapDebugState => {
  if (!window.__mapDebug) {
    window.__mapDebug = { indexBuildMs: [], viewportTimings: [], churn: [] };
  }
  return window.__mapDebug;
};

export const recordMap = (map: unknown): void => {
  ensure().map = map;
};

export const recordIndexBuild = (ms: number): void => {
  ensure().indexBuildMs.push(ms);
};

export const recordViewportTiming = (ms: number): void => {
  ensure().viewportTimings.push(ms);
};

export const recordChurn = (churn: MapDebugChurn): void => {
  ensure().churn.push(churn);
};
