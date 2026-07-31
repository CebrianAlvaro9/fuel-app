import type { FavoritesStore, SavedSearch } from "../models/savedSearch.model";

export const FAVORITES_KEY = "fuel-app:favorites:v1";

export const EMPTY_STORE: FavoritesStore = {
  version: 1,
  items: [],
  pinnedId: null,
};

/**
 * Funciones de módulo, no hooks: `App` las llama desde el inicializador lazy de
 * `useState`, antes de que ningún hook haya corrido, para que la primera
 * `queryKey` de React Query ya sea la de la búsqueda fijada (una sola petición).
 */
export const readFavoritesStore = (): FavoritesStore => {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (!raw) return EMPTY_STORE;

    const parsed = JSON.parse(raw) as Partial<FavoritesStore>;
    if (parsed?.version !== 1 || !Array.isArray(parsed.items)) {
      return EMPTY_STORE;
    }

    return {
      version: 1,
      items: parsed.items,
      pinnedId: typeof parsed.pinnedId === "string" ? parsed.pinnedId : null,
    };
  } catch {
    return EMPTY_STORE;
  }
};

export const getPinnedSearch = (store: FavoritesStore): SavedSearch | null =>
  store.items.find((item) => item.id === store.pinnedId) ?? null;

export const createSearchId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
