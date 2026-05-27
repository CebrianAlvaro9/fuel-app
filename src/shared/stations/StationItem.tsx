import { getAvailableFuels } from "../../helpers/stationFuel";
import type { LandStationPrice, MaritimeStationPrice } from "../../models/stations.model";

interface StationCardProps {
  station: LandStationPrice | MaritimeStationPrice;
  type: 'land' | 'marine';
}

export const StationCard = ({ station, type }: StationCardProps) => {
  const isLand = type === 'land';
  const marineStation = station as MaritimeStationPrice;
  const availableFuels = getAvailableFuels(station);

  return (
    <div
      className={`card shadow-sm mb-6 border rounded-3xl hover:shadow-xl hover:border-primary/30 transition-all duration-300 group ${
        isLand
          ? 'bg-base-100 border-base-200'
          : 'bg-base-100 border-info/30'
      }`}
    >
      <div className="card-body p-6">

        <div className="flex justify-between items-start mb-2">
          <h3 className="card-title text-lg font-bold text-base-content group-hover:text-primary transition-colors">
            {station['Rótulo']}
          </h3>
          <div className={`badge badge-outline badge-sm text-xs  font-semibold uppercase tracking-wider h-auto rounded-md ${
            isLand ? 'text-neutral-500' : 'badge-info'
            }`}>
            <span className="text-xs">{station['Provincia']}</span>
          </div>
        </div>

        <div className="flex items-start gap-3 mt-2 text-base-content/70 text-sm h-12">
          <span className="text-lg mt-0.5"><svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 mt-0.5 shrink-0"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg></span>
          <p className="leading-tight">
            {station['Dirección']} <br />
            <span className="font-semibold text-base-content/90">
              {station['Localidad']}
            </span>
          </p>
        </div>

        {/* Info específica de estaciones marítimas */}
        {!isLand && marineStation['Puerto'] && (
          <div className="flex items-start gap-3 mt-2 text-base-content/70 text-sm">
            <span className="text-lg"><svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 shrink-0"
            >
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="22" x2="12" y2="8" />
              <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
            </svg></span>
            <p className="leading-tight font-semibold">
              Puerto: {marineStation['Puerto']}
            </p>
          </div>
        )}

        <div className="divider my-3 opacity-50"></div>

        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                    {availableFuels.length > 0 ? (
                      availableFuels.map((fuel) => (
                        <div key={fuel.name} className="flex justify-between items-center bg-base-200/40 p-2 rounded-xl text-sm">
                          <span className="text-xs font-bold text-base-content/70 uppercase tracking-wide">
                            {fuel.name}
                          </span>
                          <span className="font-black text-black text-base">
                            {fuel.price} €
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs font-medium text-base-content/40 py-2">
                        Sin precios disponibles
                      </div>
                    )}
                  </div>

      </div>
    </div>
  )
}
