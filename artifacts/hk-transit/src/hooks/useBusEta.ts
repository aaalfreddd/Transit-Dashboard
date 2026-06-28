import { useQuery } from '@tanstack/react-query';

export interface BusEta {
  eta: string | null;
  rmk_en: string;
  dest_en: string;
  eta_seq: number;
}

export interface RouteInfo {
  orig_en: string;
  dest_en: string;
}

const fetchBusEta = async (stopId: string, route: string, serviceType: string): Promise<BusEta[]> => {
  const res = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/${serviceType}`);
  if (!res.ok) throw new Error('Failed to fetch bus ETA');
  const json = await res.json();
  return json.data || [];
};

const fetchRouteInfo = async (route: string, direction: string, serviceType: string): Promise<RouteInfo> => {
  const res = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route/${route}/${direction}/${serviceType}`);
  if (!res.ok) throw new Error('Failed to fetch route info');
  const json = await res.json();
  return {
    orig_en: json.data?.orig_en || '',
    dest_en: json.data?.dest_en || ''
  };
};

export function useBusEta(stopId: string, route: string, direction: string, serviceType: string) {
  return useQuery({
    queryKey: ['bus_eta', stopId, route, direction, serviceType],
    queryFn: async () => {
      const [etas, routeInfo] = await Promise.all([
        fetchBusEta(stopId, route, serviceType),
        fetchRouteInfo(route, direction, serviceType).catch(() => ({ orig_en: '', dest_en: '' }))
      ]);
      
      const filteredEtas = etas.filter(eta => eta.eta_seq && eta.eta_seq <= 3);
      filteredEtas.sort((a, b) => a.eta_seq - b.eta_seq);
      
      return {
        etas: filteredEtas,
        routeInfo
      };
    },
    refetchInterval: 30000,
    staleTime: 25000,
    enabled: !!stopId && !!route
  });
}
