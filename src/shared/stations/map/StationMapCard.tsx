import { getAvailableFuels, isMaritimeStation } from "../../../helpers/stationFuel";
import { getStationCoords } from "../../../helpers/stationsModifiers";
import { buildDirectionsUrl } from "../../../helpers/mapsLinks";
import type { AnyStation, MaritimeStationPrice } from "../../../models/stations.model";

interface StationMapCardProps {
  station: AnyStation;
  petrolLabel?: string;
  onClose: () => void;
}

/**
 * Ficha compacta, no `StationCard`: esa tarjeta mide 380-430px y taparía casi
 * todo un mapa de 70dvh.
 */
export const StationMapCard = ({
  station,
  petrolLabel,
  onClose,
}: StationMapCardProps) => {
  const marine = isMaritimeStation(station);
  const marineStation = station as MaritimeStationPrice;
  const coords = getStationCoords(station);
  const distance = station.distanciaUsuarioKm;

  const selectedPrice = station.PrecioProducto;
  const availableFuels = getAvailableFuels(station).filter(
    (fuel) => fuel.name !== "Precio",
  );

  const mapsUrl = coords ? buildDirectionsUrl(coords) : null;

  return (
    <div
      role="dialog"
      aria-label={`Detalle de ${station["Rótulo"]}`}
      /* Móvil: hoja a lo ancho abajo. Escritorio: panel flotante acotado, que a
         todo lo ancho tapaba media pantalla sin necesidad. */
      className="absolute z-10 overflow-y-auto bg-base-100 shadow-lg p-4
                 inset-x-0 bottom-0 max-h-[65%] rounded-t-2xl border-t border-base-300
                 md:inset-x-auto md:left-4 md:bottom-4 md:w-80 md:max-h-[calc(100%-5rem)]
                 md:rounded-2xl md:border md:border-base-300"
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="min-w-0">
          <h3 className="font-bold text-base-content text-base truncate">
            {station["Rótulo"]}
          </h3>
          {/* Sin coma manual entre los dos: `Dirección` ya viene con su
              propia puntuación desde la API (ver `StationItem.tsx`). */}
          <p className="text-xs text-base-content/60 leading-tight truncate">
            <span>{station["Dirección"]}</span>{" "}
            <span className="font-semibold text-base-content/80">
              {station["Localidad"]}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {Number.isFinite(distance) && (
            <span className="badge badge-neutral badge-sm font-bold">
              {distance} km
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="btn btn-ghost btn-xs btn-circle"
          >
            ✕
          </button>
        </div>
      </div>

      {selectedPrice && (
        <div className="flex items-baseline justify-between bg-base-content text-base-100 rounded-xl px-3 py-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wide opacity-70">
            {petrolLabel ?? "Precio"}
          </span>
          <span className="text-xl font-black tabular-nums">
            {selectedPrice} €
          </span>
        </div>
      )}

      {marine && marineStation["Puerto"] && (
        <p className="text-xs font-semibold text-base-content/70 mb-2">
          Puerto: {marineStation["Puerto"]}
        </p>
      )}

      {/* Tira con scroll propio: aquí sí es aceptable, a diferencia de la
          tarjeta de la lista, porque no vive dentro de un scroll de ventana. */}
      {availableFuels.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 -mx-1 px-1">
          {availableFuels.map((fuel) => (
            <div
              key={fuel.name}
              className="shrink-0 bg-base-200/60 rounded-lg px-2 py-1.5 text-xs"
            >
              <span className="font-bold text-base-content/70 uppercase tracking-wide mr-1 whitespace-nowrap">
                {fuel.name}
              </span>
              <span className="font-black whitespace-nowrap">{fuel.price} €</span>
            </div>
          ))}
        </div>
      )}

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline w-full min-h-11"
        >
          Cómo llegar
        </a>
      )}
    </div>
  );
};
