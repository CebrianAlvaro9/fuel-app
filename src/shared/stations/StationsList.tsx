import { useLayoutEffect, useMemo, useRef } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { StationCard } from "./StationItem";
import type {
  LandStationPrice,
  MaritimeStationPrice,
  StationsFromApi,
} from "../../models/stations.model";
import { useResponsiveColumns } from "../../hooks/useResponsiveColumns";

interface StationsListProps {
  loading: boolean;
  error: Error | null;
  stations: StationsFromApi | undefined;
  isMarine: boolean;
}

export const StationsList = ({
  loading,
  error,
  stations,
  isMarine,
}: StationsListProps) => {
  const columns = useResponsiveColumns();
  const listRef = useRef<HTMLDivElement | null>(null);
  const listOffsetRef = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rawStations = stations?.ListaEESSPrecio || [];

  const chunkedStations = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < rawStations.length; i += columns) {
      chunks.push(rawStations.slice(i, i + columns));
    }
    return chunks;
  }, [rawStations, columns]);

  useLayoutEffect(() => {
    listOffsetRef.current = listRef.current?.offsetTop ?? 0;
  }, [stations]);

  const virtualizer = useWindowVirtualizer({
    count: chunkedStations.length,
    estimateSize: () => 280,
    overscan: 3,
    // eslint-disable-next-line react-hooks/refs
    scrollMargin: listOffsetRef.current,
  });

  const getStationId = (
    station: LandStationPrice | MaritimeStationPrice,
  ): string => {
    return "IDPosteMaritimo" in station
      ? station.IDPosteMaritimo
      : station.IDEESS;
  };

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
        <div className="alert alert-error shadow-lg max-w-2xl mx-auto rounded-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
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
            <div className="text-xs">{error.message}</div>
          </div>
        </div>
      )}

      {stations && (
        <div className="fade-in pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pl-2">
            <h2 className="text-xl font-bold text-base-content flex items-center gap-3">
              <span
                className={`${isMarine ? "bg-info" : "bg-neutral"} w-1.5 h-6 rounded-full inline-block`}
              ></span>
              <span>{rawStations.length} Estaciones</span>
            </h2>
            <span className="text-xs font-medium text-base-content/60 sm:text-right">
              Actualizado: {stations.Fecha}
            </span>
          </div>
          <div ref={listRef} className="w-full">
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const rowStations = chunkedStations[virtualRow.index];

                return (
                  <div
                    key={virtualRow.index}
                    ref={virtualizer.measureElement}
                    data-index={virtualRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
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
        </div>
      )}
    </>
  );
};
