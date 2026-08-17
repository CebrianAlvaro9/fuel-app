import { lazy, Suspense } from "react";
import { StationsList } from "./StationsList";
import { StationsViewToggle } from "./StationsViewToggle";
import { RefreshButton } from "./RefreshButton";
import { MapErrorBoundary } from "./MapErrorBoundary";
import { mapContainerClasses } from "./map/mapLayout";
import type { StationsFromApi } from "../../models/stations.model";
import type { Coords } from "../../models/ubi.model";
import type { FilterState } from "../../models/filters.model";

// A nivel de módulo, nunca dentro del componente: un `lazy()` por render
// recrea el tipo y remonta el mapa en cada render.
const StationsMap = lazy(() =>
  import("./map/StationsMap").then((m) => ({ default: m.StationsMap })),
);

export type StationsView = "list" | "map";

interface StationsSectionProps {
  loading: boolean;
  error: Error | null;
  stations: StationsFromApi | undefined;
  isMarine: boolean;
  filters: FilterState;
  /** Único combustible que habilita el mapa: ya no depende de la ubicación. */
  canShowMap: boolean;
  location: Coords | null;
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  onResetFilters: () => void;
  sortedByPrice: boolean;
  petrolLabel?: string;
  /* `App` ya resuelve si la vista activa puede ser "map" (según
     `canShowMap`), así que aquí `view` llega siempre lista para pintar. */
  view: StationsView;
  onViewChange: (view: StationsView) => void;
  favoritesCollapsed: boolean;
  onRefresh: () => void;
  isFetching: boolean;
}

/**
 * `StationsList` lleva `"use no memo"` (ver ese fichero): meterle el mapa
 * dentro dejaría sin memoizar también el mapa. Este padre mantiene la
 * directiva acotada a la lista virtualizada.
 */
export const StationsSection = ({
  loading,
  error,
  stations,
  isMarine,
  filters,
  canShowMap,
  location,
  radiusKm,
  onRadiusChange,
  onResetFilters,
  sortedByPrice,
  petrolLabel,
  view,
  onViewChange,
  favoritesCollapsed,
  onRefresh,
  isFetching,
}: StationsSectionProps) => {
  const hasLocation = Boolean(location);

  return (
    <>
      {/* El conmutador se pinta siempre que no esté cargando, también con la
          lista vacía: con navegación libre por el mapa es justo cuando más
          sirve. El botón de actualizar igual: si una búsqueda vino vacía o
          falló, es justo cuando hace falta reintentar. */}
      {!loading && (
        /* `items-start`: la pista bajo el conmutador hace el bloque de dos
           líneas, y centrar dejaba el botón descolgado respecto a las pestañas. */
        <div className="flex items-start justify-between gap-3">
          <StationsViewToggle
            view={view}
            onChange={onViewChange}
            hasFuel={canShowMap}
          />

          <RefreshButton
            onRefresh={onRefresh}
            busy={isFetching}
            updatedAt={stations?.Fecha}
          />
        </div>
      )}

      {view === "map" ? (
        // El `fallback` comparte con el mapa real la constante de altura
        // (`mapContainerClasses`), así que cargar el chunk diferido no da
        // salto de layout.
        <MapErrorBoundary onBackToList={() => onViewChange("list")}>
          <Suspense
            fallback={<div className={mapContainerClasses(favoritesCollapsed)} />}
          >
            <StationsMap
              filters={filters}
              location={location}
              radiusKm={radiusKm}
              petrolLabel={petrolLabel}
              favoritesCollapsed={favoritesCollapsed}
            />
          </Suspense>
        </MapErrorBoundary>
      ) : (
        <StationsList
          loading={loading}
          error={error}
          stations={stations}
          isMarine={isMarine}
          hasLocation={hasLocation}
          radiusKm={radiusKm}
          onRadiusChange={onRadiusChange}
          onResetFilters={onResetFilters}
          sortedByPrice={sortedByPrice}
        />
      )}
    </>
  );
};
