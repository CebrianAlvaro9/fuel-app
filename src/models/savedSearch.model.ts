import type { FilterState } from "./filters.model";

/**
 * Etiquetas legibles resueltas en el momento de guardar.
 *
 * `FilterState` solo guarda IDs, y las listas maestras únicamente contienen las
 * provincias/municipios de la selección actual. Congelarlas aquí evita tener
 * que hacer fetches extra para pintar el nombre de una búsqueda de otra zona.
 */
export interface SearchLabels {
  community?: string;
  province?: string;
  municipality?: string;
  petrol?: string;
}

export interface SearchSnapshot {
  filters: FilterState;
  radiusKm: number;
  usesLocation: boolean;
  labels: SearchLabels;
}

export interface SavedSearch extends SearchSnapshot {
  id: string;
  name: string;
  createdAt: number;
}

export interface FavoritesStore {
  version: 1;
  items: SavedSearch[];
  pinnedId: string | null;
}
