import { getAvailableFuels } from "../../helpers/stationFuel";
import type { LandStationPrice, MaritimeStationPrice } from "../../models/stations.model";

interface StationCardProps {
  station: LandStationPrice | MaritimeStationPrice;
  type: 'land' | 'marine';
}

export const StationCard = ({ station, type }: StationCardProps) => {
  const isLand = type === 'land';
  //const landStation = station as LandStationPrice;
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
          <div className={`badge badge-outline badge-sm text-xs font-semibold uppercase tracking-wider rounded-md ${
            isLand ? 'badge-primary' : 'badge-info'
          }`}>
            {station['Provincia']}
          </div>
        </div>

        <div className="flex items-start gap-3 mt-2 text-base-content/70 text-sm h-12">
          <span className="text-lg mt-0.5">📍</span>
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
            <span className="text-lg">⚓</span>
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
