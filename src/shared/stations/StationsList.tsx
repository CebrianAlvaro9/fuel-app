import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { StationCard } from "./StationItem";
import { EmptyResults } from "./EmptyResults";
import type { StationsFromApi } from "../../models/stations.model";
import { getStationId } from "../../helpers/stationsModifiers";
import { useResponsiveColumns } from "../../hooks/useResponsiveColumns";

interface StationsListProps {
  loading: boolean;
  error: Error | null;
  stations: StationsFromApi | undefined;
  isMarine: boolean;
  hasLocation: boolean;
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  onResetFilters: () => void;
  sortedByPrice: boolean;
}

export const StationsList = ({
  loading,
  error,
  stations,
  isMarine,
  hasLocation,
  radiusKm,
  onRadiusChange,
  onResetFilters,
  sortedByPrice,
}: StationsListProps) => {
  /*
   * El React Compiler memoiza `virtualizer.getVirtualItems()` contra la
   * identidad del virtualizador, que es estable aunque su estado interno
   * cambie: el resultado se congelaba y la lista no reaccionaba al scroll.
   * `use no memo` es la vía de escape que documenta TanStack.
   */
  "use no memo";

  const columns = useResponsiveColumns();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [listOffset, setListOffset] = useState(0);

  const rawStations = useMemo(
    () => stations?.ListaEESSPrecio ?? [],
    [stations],
  );

  const chunkedStations = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < rawStations.length; i += columns) {
      chunks.push(rawStations.slice(i, i + columns));
    }
    return chunks;
  }, [rawStations, columns]);

  useLayoutEffect(() => {
    setListOffset(listRef.current?.offsetTop ?? 0);
  }, [stations]);

  const virtualizer = useWindowVirtualizer({
    count: chunkedStations.length,
    // Medido sobre datos reales: las tarjetas rondan 380-430px. Quedarse corto
    // impide que el virtualizador converja y las filas acaban solapándose.
    estimateSize: () => (columns === 1 ? 390 : 430),
    overscan: 3,
    scrollMargin: listOffset,
  });

  /*
   * Al rotar o redimensionar cambian los límites de los chunks, así que las
   * medidas cacheadas dejan de valer. El ref es imprescindible: `measure()`
   * descarta TODAS las medidas, y como su identidad cambia en cada render,
   * incluirlo en las dependencias lo dispararía continuamente y las tarjetas
   * se quedarían pintadas con el tamaño estimado (solapándose).
   */
  const { measure } = virtualizer;
  const prevColumnsRef = useRef(columns);
  useEffect(() => {
    if (prevColumnsRef.current === columns) return;
    prevColumnsRef.current = columns;
    measure();
  }, [columns, measure]);

  /*
   * `start` y `end` de cada item vienen desplazados por `scrollMargin`, pero
   * `getTotalSize()` no lo incluye: hay que normalizar los dos extremos contra
   * el mismo origen. Restarlo solo arriba dejaba un `paddingBottom` negativo,
   * la página se quedaba sin altura y nunca se pedían más filas.
   */
  const virtualItems = virtualizer.getVirtualItems();
  const { scrollMargin } = virtualizer.options;
  const firstStart =
    virtualItems.length > 0 ? virtualItems[0].start - scrollMargin : 0;
  const lastEnd =
    virtualItems.length > 0
      ? virtualItems[virtualItems.length - 1].end - scrollMargin
      : 0;

  const paddingTop = Math.max(0, firstStart);
  const paddingBottom = Math.max(0, virtualizer.getTotalSize() - lastEnd);

  const orderLabel = sortedByPrice
    ? "Ordenadas por precio"
    : hasLocation
      ? "Ordenadas por distancia"
      : null;

  return (
    <>
      {loading && (
        <div className="flex flex-col justify-center items-center py-20 gap-4 ">
          <span className="loading loading-lg text-black loading-dots"></span>
          <span className="text-lg font-medium text-base-content/70 animate-pulse">
            Obteniendo datos del Ministerio...
          </span>
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto rounded-xl border border-base-content/30 bg-base-100 px-4 py-3 flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">Error de conexión</h3>
            <div className="text-xs text-base-content/60">{error.message}</div>
          </div>
        </div>
      )}

      {stations && rawStations.length === 0 && (
        <EmptyResults
          hasLocation={hasLocation}
          radiusKm={radiusKm}
          onRadiusChange={onRadiusChange}
          onResetFilters={onResetFilters}
        />
      )}

      {stations && rawStations.length > 0 && (
        <div className="fade-in pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-6 pl-2">
            <h2 className="text-xl font-bold text-base-content flex items-center gap-3">
              <span
                className={`${isMarine ? "bg-base-content/40" : "bg-base-content"} w-1.5 h-6 rounded-full inline-block`}
              ></span>
              <span>{rawStations.length} Estaciones</span>
            </h2>
            <div className="flex flex-col sm:items-end text-xs font-medium text-base-content/60">
              <span>
                {hasLocation && `En ${radiusKm} km`}
                {hasLocation && orderLabel && " · "}
                {orderLabel}
              </span>
              <span>Actualizado: {stations.Fecha}</span>
            </div>
          </div>

          {/*
            Filas en flujo normal con espaciadores arriba y abajo, en lugar de
            posicionamiento absoluto: así no pueden solaparse aunque el tamaño
            estimado se quede corto. La medición solo afina la altura total
            (y por tanto la barra de scroll).
          */}
          <div
            ref={listRef}
            className="w-full"
            style={{ paddingTop, paddingBottom }}
          >
            {virtualItems.map((virtualRow) => {
              const rowStations = chunkedStations[virtualRow.index];

              return (
                <div
                  key={virtualRow.key}
                  ref={virtualizer.measureElement}
                  data-index={virtualRow.index}
                  style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  }}
                  className="grid gap-6 pb-6"
                >
                  {rowStations.map((station) => (
                    <StationCard
                      key={getStationId(station)}
                      station={station}
                      type={isMarine ? "marine" : "land"}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
