import { useQuery } from "@tanstack/react-query";
import {
  getAutonomousCommunities,
  getProvincesByCommunity,
  getPetrols,
  getMunicipalitiesByProvince,
} from "../apis/masterData.api";

// Necesita conocer las selecciones actuales para ejecutar las queries dependientes
interface UseFiltersDataParams {
  communityId: string;
  provinceId: string;
}

export const useFiltersData = ({ communityId, provinceId }: UseFiltersDataParams) => {
  const { data: communities, isLoading: isLoadingCommunities } = useQuery({
    queryKey: ["communities"],
    queryFn: ({ signal }) => getAutonomousCommunities({ signal }),
    staleTime: 1000 * 60 * 60 * 24,
    select: (data) => data.map((c) => ({ value: c.IDCCAA, label: c.CCAA })),
  });

  const { data: petrols, isLoading: isLoadingPetrols } = useQuery({
    queryKey: ["petrols"],
    queryFn: ({ signal }) => getPetrols({ signal }),
    staleTime: 1000 * 60 * 60 * 24,
    select: (data) => data.map((p) => ({ value: p.IDProducto, label: p.NombreProducto })),
  });

  const { data: provinces, isLoading: isLoadingProvinces } = useQuery({
    queryKey: ["provinces", communityId],
    queryFn: ({ signal }) => getProvincesByCommunity(communityId, { signal }),
    enabled: !!communityId,
    staleTime: 1000 * 60 * 60 * 24,
    select: (data) => data.map((p) => ({ value: p.IDPovincia, label: p.Provincia })),
  });

  const { data: municipalities, isLoading: isLoadingMunicipalities } = useQuery({
    queryKey: ["municipalities", provinceId],
    queryFn: ({ signal }) => getMunicipalitiesByProvince(provinceId, { signal }),
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 60 * 24,
    select: (data) => data.map((m) => ({ value: m.IDMunicipio, label: m.Municipio })),
  });

  return {
    options: {
      communities,
      petrols,
      provinces,
      municipalities,
    },
    loaders: {
      isLoadingCommunities,
      isLoadingPetrols,
      isLoadingProvinces,
      isLoadingMunicipalities,
    },
  };
};
