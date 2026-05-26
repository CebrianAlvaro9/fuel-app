import { useState } from "react";
import { Filters } from "./shared/filters/FiltersNavBar";
import { StationsList } from "./shared/stations/StationsList";

import type { FilterState } from "./models/filters.model";

import { useStationsData } from "./hooks/useStationsData";

function App() {
  const [filters, setFilters] = useState<FilterState>({
    community: "",
    province: "",
    municipality: "",
    petrol: "",
    isMarine: false,
    date: "",
  });

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const { stations, isLoading, error } = useStationsData(filters);

  return (
    <div className="min-h-screen bg-base-200 pb-12 font-sans">
      <Filters filters={filters} onChange={updateFilters} />

      <main className="container mx-auto px-4 max-w-6xl space-y-8">
        <StationsList
          loading={isLoading}
          error={error}
          stations={stations}
          isMarine={filters.isMarine}
        />
      </main>
    </div>
  );
}

export default App;
