import { StationCard } from "./StationItem";
import type {
  LandStationPrice,
  MaritimeStationPrice,
} from "../../models/stations.model";

interface ApiResponse {
  Fecha: string;
  ListaEESSPrecio: (LandStationPrice | MaritimeStationPrice)[];
  Nota: string;
  ResultadoConsulta: string;
}

type props = {
  loading: boolean;
  error: Error | null;
  stations: ApiResponse | undefined;
  isMarine: boolean;
};

export const StationsList = ({ loading, error, stations, isMarine }: props) => {
  return (
    <>
      {/* Estados de Carga y Error */}
      {loading && (
        <div className="flex flex-col justify-center items-center py-20 gap-4">
          <span className="loading loading-bars loading-lg text-primary"></span>
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
        <div className="fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pl-2">
            <h2 className="text-xl font-bold text-base-content flex items-center gap-3">
              <span
                className={`${isMarine ? "bg-info" : "bg-primary"} w-1.5 h-6 rounded-full inline-block`}
              ></span>
              <span>{stations.ListaEESSPrecio?.length || 0} Estaciones</span>
            </h2>

            <span className="text-xs font-medium text-base-content/60 sm:text-right">
              Actualizado: {stations.Fecha}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {stations.ListaEESSPrecio?.slice(0, 10).map((station, index) => (
              <StationCard
                key={
                  isMarine
                    ? (station as MaritimeStationPrice).IDPosteMaritimo
                    : (station as LandStationPrice).IDEESS || index
                }
                station={station}
                type={isMarine ? "marine" : "land"}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
