import { useState } from "react";
import { getAvailableFuels } from "../../helpers/stationFuel";
import { getStationCoords } from "../../helpers/stationsModifiers";
import { buildDirectionsUrl } from "../../helpers/mapsLinks";
import type { AnyStation, MaritimeStationPrice } from "../../models/stations.model";

interface StationCardProps {
  station: AnyStation;
  type: "land" | "marine";
}

const VISIBLE_FUELS = 3;

export const StationCard = ({ station, type }: StationCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const isLand = type === "land";
  const marineStation = station as MaritimeStationPrice;
  const coords = getStationCoords(station);
  const distance = station.distanciaUsuarioKm;

  // El precio del combustible filtrado se destaca; el resto va en la lista.
  const selectedPrice = station.PrecioProducto;
  const availableFuels = getAvailableFuels(station).filter(
    (fuel) => fuel.name !== "Precio",
  );

  const visibleFuels = expanded
    ? availableFuels
    : availableFuels.slice(0, VISIBLE_FUELS);
  const hiddenCount = availableFuels.length - visibleFuels.length;

  const mapsUrl = coords ? buildDirectionsUrl(coords) : null;

  return (
    <div
      className={`card shadow-sm border rounded-2xl transition-all duration-300 group hover:shadow-lg hover:border-base-content/30 active:scale-[0.99] ${
        isLand ? "bg-base-100 border-base-300" : "bg-base-100 border-base-content/25"
      }`}
    >
      <div className="card-body p-5 gap-0">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="card-title text-lg font-bold text-base-content">
            {station["Rótulo"]}
          </h3>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {Number.isFinite(distance) && (
              <span className="badge badge-neutral badge-sm font-bold">
                {distance} km
              </span>
            )}
            <div
              className="badge badge-outline badge-sm text-xs font-semibold uppercase tracking-wider h-auto rounded-md text-base-content/60"
            >
              <span className="text-xs">{station["Provincia"]}</span>
            </div>
          </div>
        </div>

        {selectedPrice && (
          <div className="flex items-baseline justify-between bg-base-content text-base-100 rounded-xl px-3 py-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide opacity-70">
              Precio
            </span>
            <span className="text-2xl font-black tabular-nums">
              {selectedPrice} €
            </span>
          </div>
        )}

        <div className="flex items-start gap-3 mt-1 text-base-content/70 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 mt-0.5 shrink-0"
            aria-hidden="true"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <p className="leading-tight">
            <span className="line-clamp-2">{station["Dirección"]}</span>
            <span className="font-semibold text-base-content/90">
              {station["Localidad"]}
            </span>
          </p>
        </div>

        {!isLand && marineStation["Puerto"] && (
          <div className="flex items-start gap-3 mt-2 text-base-content/70 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 shrink-0"
              aria-hidden="true"
            >
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="22" x2="12" y2="8" />
              <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
            </svg>
            <p className="leading-tight font-semibold">
              Puerto: {marineStation["Puerto"]}
            </p>
          </div>
        )}

        <div className="divider my-3 opacity-50"></div>

        {/* Sin scroll anidado: dentro de una lista virtualizada con scroll de
            ventana, una región scrollable es una trampa táctil. */}
        <div className="space-y-2">
          {visibleFuels.length > 0 ? (
            visibleFuels.map((fuel) => (
              <div
                key={fuel.name}
                className="flex justify-between items-center gap-2 bg-base-200/40 p-2 rounded-xl text-sm"
              >
                <span className="text-xs font-bold text-base-content/70 uppercase tracking-wide">
                  {fuel.name}
                </span>
                <span className="font-black text-base whitespace-nowrap">
                  {fuel.price} €
                </span>
              </div>
            ))
          ) : (
            !selectedPrice && (
              <div className="text-center text-xs font-medium text-base-content/40 py-2">
                Sin precios disponibles
              </div>
            )
          )}

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="btn btn-ghost btn-xs w-full"
            >
              Ver los {hiddenCount} restantes
            </button>
          )}

          {expanded && availableFuels.length > VISIBLE_FUELS && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="btn btn-ghost btn-xs w-full"
            >
              Ver menos
            </button>
          )}
        </div>

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline w-full min-h-11 mt-4"
          >
            Cómo llegar
          </a>
        )}
      </div>
    </div>
  );
};
