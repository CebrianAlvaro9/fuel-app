import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import {
  createSearchId,
  EMPTY_STORE,
  FAVORITES_KEY,
} from "../helpers/favoritesStorage";
import type {
  FavoritesStore,
  SavedSearch,
  SearchSnapshot,
} from "../models/savedSearch.model";

export interface UseFavorites {
  favorites: SavedSearch[];
  pinnedId: string | null;
  save: (name: string, snapshot: SearchSnapshot) => void;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  togglePin: (id: string) => void;
}

export const useFavorites = (): UseFavorites => {
  const [store, setStore] = useLocalStorage<FavoritesStore>(
    FAVORITES_KEY,
    EMPTY_STORE,
  );

  const save = useCallback(
    (name: string, snapshot: SearchSnapshot) => {
      const entry: SavedSearch = {
        ...snapshot,
        id: createSearchId(),
        name: name.trim(),
        createdAt: Date.now(),
      };

      setStore((prev) => ({ ...prev, items: [...prev.items, entry] }));
    },
    [setStore],
  );

  const rename = useCallback(
    (id: string, name: string) => {
      setStore((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, name: name.trim() } : item,
        ),
      }));
    },
    [setStore],
  );

  const remove = useCallback(
    (id: string) => {
      setStore((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
        pinnedId: prev.pinnedId === id ? null : prev.pinnedId,
      }));
    },
    [setStore],
  );

  // Solo puede haber una fijada: fijar otra desfija la anterior.
  const togglePin = useCallback(
    (id: string) => {
      setStore((prev) => ({
        ...prev,
        pinnedId: prev.pinnedId === id ? null : id,
      }));
    },
    [setStore],
  );

  return {
    favorites: store.items,
    pinnedId: store.pinnedId,
    save,
    rename,
    remove,
    togglePin,
  };
};
