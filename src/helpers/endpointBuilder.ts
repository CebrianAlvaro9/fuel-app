import type { FilterState } from "../models/filters.model";

const API ="https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/";
export const buildStationsEndpoint = (filters: FilterState): string => {
  const { isMarine, community, province, municipality, petrol, date } = filters;

  let resource = isMarine ? "PostesMaritimos" : "EstacionesTerrestres";
  if (!isMarine && date) {
    resource = "EstacionesTerrestresHist";
  }
  const endpoint = `${API}${resource}`;
  let geoKey: string | null = null;
  let geoId: string | null = null;

  if (municipality) {
    geoKey = "Municipio";
    geoId = municipality;
  } else if (province) {
    geoKey = "Provincia";
    geoId = province;
  } else if (community) {
    geoKey = "CCAA";
    geoId = community;
  }

  const segments: string[] = [endpoint];

  if (geoKey) {
    const filterName = petrol ? `Filtro${geoKey}Producto` : `Filtro${geoKey}`;
    segments.push(filterName);

    if (!isMarine && date) segments.push(date);

    segments.push(geoId!);
    if (petrol) segments.push(petrol);
  } else if (petrol) {
    segments.push("FiltroProducto");
    if (!isMarine && date) segments.push(date);
    segments.push(petrol);
  } else {
    if (!isMarine && date) segments.push(date);
  }
  return segments.join("/");
};
