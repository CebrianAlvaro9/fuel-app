import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Filters } from "./shared/filters/FiltersNavBar";
import { StationsList } from "./shared/stations/StationsList";
import { SaveSearchModal } from "./shared/favorites/SaveSearchModal";

import type { FilterState } from "./models/filters.model";
import type { SavedSearch, SearchSnapshot } from "./models/savedSearch.model";

import { useStationsData } from "./hooks/useStationsData";
import { useGeolocation } from "./hooks/useGeolocation";
import { useFavorites } from "./hooks/useFavorites";
import { useSearchLabels } from "./hooks/useSearchLabels";
import {
  getPinnedSearch,
  readFavoritesStore,
} from "./helpers/favoritesStorage";
import {
  DEFAULT_FILTERS,
  DEFAULT_MARINE_FILTERS,
  DEFAULT_RADIUS_KM,
  type SearchMode,
} from "./constants/search";

function App() {
  /*
   * La búsqueda fijada se lee de forma síncrona en el inicializador lazy para
   * que la primera `queryKey` de React Query ya sea la correcta. Aplicarla en
   * un `useEffect` provocaría una petición nacional y otra con los filtros
   * buenos.
   */
  const [bootstrap] = useState(() => getPinnedSearch(readFavoritesStore()));

  const [isMarine, setIsMarine] = useState(
    () => bootstrap?.filters.isMarine ?? false,
  );

  /*
   * Cada tipo de estación conserva sus propios filtros: cambiar a marítimas
   * empieza de cero, y al volver a terrestres siguen los que había puestos.
   */
  const [landFilters, setLandFilters] = useState<FilterState>(() =>
    bootstrap && !bootstrap.filters.isMarine
      ? bootstrap.filters
      : DEFAULT_FILTERS,
  );
  const [marineFilters, setMarineFilters] = useState<FilterState>(() =>
    bootstrap?.filters.isMarine ? bootstrap.filters : DEFAULT_MARINE_FILTERS,
  );

  const [radiusKm, setRadiusKm] = useState(
    () => bootstrap?.radiusKm ?? DEFAULT_RADIUS_KM,
  );
  const [searchMode, setSearchMode] = useState<SearchMode>(() =>
    bootstrap?.usesLocation ? "nearby" : "zone",
  );
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  const {
    location,
    status: locationStatus,
    errorMessage: locationError,
    request: requestLocation,
    clear: clearLocation,
  } = useGeolocation();

  const favorites = useFavorites();

  const filters = isMarine ? marineFilters : landFilters;
  const setFilters = isMarine ? setMarineFilters : setLandFilters;
  const labels = useSearchLabels(filters);

  /*
   * La ubicación sí se pide en un efecto: es asíncrona, pero no afecta al
   * endpoint (`buildStationsEndpoint` no la lee y no está en `queryKey`), así
   * que solo recalcula el memo cliente. El ref evita que el doble render de
   * StrictMode dispare dos prompts.
   */
  const didBootstrapLocation = useRef(false);
  useEffect(() => {
    if (didBootstrapLocation.current) return;
    didBootstrapLocation.current = true;
    if (bootstrap?.usesLocation) requestLocation();
  }, [bootstrap, requestLocation]);

  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      setFilters((prev) => ({ ...prev, ...updates }));
    },
    [setFilters],
  );

  /** Limpia solo los filtros del tipo activo, sin cambiar de tipo. */
  const resetFilters = useCallback(() => {
    setFilters(isMarine ? DEFAULT_MARINE_FILTERS : DEFAULT_FILTERS);
    setRadiusKm(DEFAULT_RADIUS_KM);
  }, [isMarine, setFilters]);

  const changeSearchMode = useCallback(
    (mode: SearchMode) => {
      setSearchMode(mode);

      if (mode === "nearby") {
        // La zona administrativa deja de aplicar al buscar por cercanía.
        setFilters((prev) => ({
          ...prev,
          community: "",
          province: "",
          municipality: "",
        }));
        requestLocation();
      } else {
        clearLocation();
      }
    },
    [setFilters, requestLocation, clearLocation],
  );

  const toggleLocation = useCallback(() => {
    changeSearchMode(searchMode === "nearby" ? "zone" : "nearby");
  }, [searchMode, changeSearchMode]);

  const applySearch = useCallback(
    (search: SavedSearch) => {
      setIsMarine(search.filters.isMarine);
      if (search.filters.isMarine) setMarineFilters(search.filters);
      else setLandFilters(search.filters);

      setRadiusKm(search.radiusKm);
      setSearchMode(search.usesLocation ? "nearby" : "zone");
      if (search.usesLocation) requestLocation();
      else clearLocation();
    },
    [requestLocation, clearLocation],
  );

  const currentSnapshot: SearchSnapshot = useMemo(
    () => ({
      filters,
      radiusKm,
      usesLocation: searchMode === "nearby",
      labels,
    }),
    [filters, radiusKm, searchMode, labels],
  );

  const { stations, isLoading, error } = useStationsData(
    filters,
    location,
    radiusKm,
  );

  const resultsCount = stations?.ListaEESSPrecio.length ?? 0;

  return (
    <div className="min-h-screen bg-base-200 pb-12 font-sans">
      <Filters
        filters={filters}
        onChange={updateFilters}
        onToggleMarine={setIsMarine}
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        searchMode={searchMode}
        onSearchModeChange={changeSearchMode}
        locationStatus={locationStatus}
        locationError={locationError}
        hasLocation={Boolean(location)}
        onToggleLocation={toggleLocation}
        resultsCount={resultsCount}
        onResetFilters={resetFilters}
        currentSnapshot={currentSnapshot}
        favorites={favorites.favorites}
        pinnedId={favorites.pinnedId}
        onApplySearch={applySearch}
        onRenameSearch={favorites.rename}
        onRemoveSearch={favorites.remove}
        onTogglePin={favorites.togglePin}
        onSaveCurrent={() => setSaveModalOpen(true)}
      />

      <main className="container mx-auto px-4 max-w-6xl space-y-8">
        <StationsList
          loading={isLoading}
          error={error}
          stations={stations}
          isMarine={filters.isMarine}
          hasLocation={Boolean(location)}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          onResetFilters={resetFilters}
          sortedByPrice={Boolean(filters.petrol)}
        />
      </main>

      <SaveSearchModal
        open={saveModalOpen}
        snapshot={currentSnapshot}
        onSave={(name) => favorites.save(name, currentSnapshot)}
        onClose={() => setSaveModalOpen(false)}
      />
    </div>
  );
}

export default App;
