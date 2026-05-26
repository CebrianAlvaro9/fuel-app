import type { LandStationPrice, MaritimeStationPrice } from "../models/stations.model";


export interface FuelDisplay {
  name: string;
  price: string;
}

// Type Guard estricto para diferenciar si la estación es marítima o terrestre
export const isMaritimeStation = (
  station: LandStationPrice | MaritimeStationPrice
): station is MaritimeStationPrice => {
  return "IDPosteMaritimo" in station;
};

/**
 * Filtra y extrae los combustibles disponibles de una estación con precios válidos.
 */
export const getAvailableFuels = (
  station: LandStationPrice | MaritimeStationPrice
): FuelDisplay[] => {
  const fuels: FuelDisplay[] = [];

  // 1. Mapear precios comunes de la interfaz Base
  const baseFuelMap: Record<string, string> = {
    "PrecioProducto":"Precio",
    "Precio Gasolina 95 E5": "Gasolina 95 E5",
    "Precio Gasolina 95 E10": "Gasolina 95 E10",
    "Precio Gasoleo B": "Gasóleo B (Agrícola)",
    "Precio Diésel Renovable": "Diésel Renovable",
    "Precio Gasolina Renovable": "Gasolina Renovable",
  };

  Object.entries(baseFuelMap).forEach(([apiKey, displayName]) => {
    const price = station[apiKey as keyof typeof station];
    if (typeof price === "string" && price.trim() !== "") {
      fuels.push({ name: displayName, price });
    }
  });

  // 2. Extraer precios específicos según el tipo de estación
  if (isMaritimeStation(station)) {
    const maritimeFuelMap: Record<keyof MaritimeStationPrice, string> = {
      "Precio Gasóleo para uso marítimo": "Gasóleo Marítimo",
      "Precio Gasoleo A habitual": "Gasóleo A Habitual",
      "Precio Adblue": "AdBlue Nav",
    } as any;

    Object.entries(maritimeFuelMap).forEach(([key, displayName]) => {
      const price = station[key as keyof MaritimeStationPrice];
      if (typeof price === "string" && price.trim() !== "") {
        fuels.push({ name: displayName, price });
      }
    });
  } else {
    // Es una estación terrestre
    const landFuelMap: Record<keyof LandStationPrice, string> = {
      "Precio Gasoleo A": "Gasóleo A",
      "Precio Gasoleo Premium": "Gasóleo Premium",
      "Precio Gasolina 98 E5": "Gasolina 98 E5",
      "Precio Gasolina 95 E5 Premium": "Gasolina 95 E5 Prem.",
      "Precio Gas Natural Comprimido": "GNC",
      "Precio Gas Natural Licuado": "GNL",
      "Precio Gases licuados del petróleo": "GLP",
      "Precio AdBlue": "AdBlue",
    } as any;

    Object.entries(landFuelMap).forEach(([key, displayName]) => {
      const price = station[key as keyof LandStationPrice];
      if (typeof price === "string" && price.trim() !== "") {
        fuels.push({ name: displayName, price });
      }
    });
  }

  return fuels;
};
