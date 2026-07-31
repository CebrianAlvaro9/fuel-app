import { lazy, Suspense } from "react";
import { StationsList } from "./StationsList";
import { StationsViewToggle } from "./StationsViewToggle";
import { RefreshButton } from "./RefreshButton";
import { mapContainerClasses } from "./map/mapLayout";
import type { StationsFromApi } from "../../models/stations.model";
import type { Coords } from "../../models/ubi.model";

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
  location: Coords | null;
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  onResetFilters: () => void;
  sortedByPrice: boolean;
  petrolLabel?: string;
  /* Controlado desde `App` porque la barra de filtros también necesita saber
     si estamos en el mapa, para encogerse al hacer scroll. */
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
  const hasResults = Boolean(stations && stations.ListaEESSPrecio.length > 0);

  // Derivado, no efecto: si se quita el combustible estando en el mapa, se
  // vuelve a la lista sin render intermedio. `mapReady` además estrecha los
  // tipos, así que no hacen falta aserciones `!` al pasar `stations` y
  // `location` al mapa.
  const mapReady =
    stations && stations.ListaEESSPrecio.length > 0 && location && sortedByPrice;
  const activeView: StationsView = mapReady ? view : "list";

  return (
    <>
      {/* El conmutador solo se pinta cuando hay resultados, de modo que
          `StationsList` sigue siendo el único dueño del spinner, del error y
          de `EmptyResults`. */}
      {/* El botón de actualizar se pinta aunque no haya resultados: si una
          búsqueda vino vacía o falló, es justo cuando hace falta reintentar. */}
      {!loading && (
        /* `items-start`: la pista bajo el conmutador hace el bloque de dos
           líneas, y centrar dejaba el botón descolgado respecto a las pestañas. */
        <div className="flex items-start justify-between gap-3">
          {hasResults ? (
            <StationsViewToggle
              view={activeView}
              onChange={onViewChange}
              hasLocation={hasLocation}
              hasFuel={sortedByPrice}
            />
          ) : (
            <span />
          )}

          <RefreshButton
            onRefresh={onRefresh}
            busy={isFetching}
            updatedAt={stations?.Fecha}
          />
        </div>
      )}

      {activeView === "map" && mapReady ? (
        // El `fallback` comparte con el mapa real la constante de altura
        // (`MAP_CONTAINER_CLASSES`), así que cargar el chunk diferido no da
        // salto de layout.
        <Suspense
          fallback={<div className={mapContainerClasses(favoritesCollapsed)} />}
        >
          <StationsMap
            stations={stations}
            location={location}
            radiusKm={radiusKm}
            petrolLabel={petrolLabel}
            favoritesCollapsed={favoritesCollapsed}
          />
        </Suspense>
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
