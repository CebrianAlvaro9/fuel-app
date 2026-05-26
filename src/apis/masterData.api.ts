import type { Community, Municipality, Province, Petrol } from "../models/masterData.model";

const API_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/';

const fetchWrapper = async <T>(endpoint: string, options?: { signal?: AbortSignal }): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal: options?.signal,
  });

  if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

  const json = await response.json();
  if (json?.errors?.length) throw new Error(json.errors[0].message || "Error en el servicio");

  return json as T;
};

export const getAutonomousCommunities = async (options?: { signal?: AbortSignal }) => {
  return fetchWrapper<Community[]>("Listados/ComunidadesAutonomas/", options);
};

export const getProvincesByCommunity = async (idCommunity: string, options?: { signal?: AbortSignal }) => {
  return fetchWrapper<Province[]>(`Listados/ProvinciasPorComunidad/${idCommunity}`, options);
};

// Dejo los municipios por si los necesitas, aunque no están en el UI actual
export const getMunicipalitiesByProvince = async (idProvince: string, options?: { signal?: AbortSignal }) => {
  return fetchWrapper<Municipality[]>(`Listados/MunicipiosPorProvincia/${idProvince}`, options);
};

export const getPetrols = async (options?: { signal?: AbortSignal }) => {
  return fetchWrapper<Petrol[]>(`Listados/ProductosPetroliferos/`, options);
};
