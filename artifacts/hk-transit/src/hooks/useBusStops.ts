import { useQuery } from "@tanstack/react-query";

export interface BusStop {
  id: string;
  name_en: string;
  name_tc: string;
  seq: number;
}

function cleanStopName(name: string): string {
  return (name || "").replace(/\s*\([A-Z]{2}\d+\)\s*$/, "").replace(/\s*\([A-Z]{3,}\d*\)\s*$/, "").trim();
}

async function fetchKmbStops(route: string, direction: string, serviceType: string): Promise<BusStop[]> {
  const rsRes = await fetch(
    `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${encodeURIComponent(route)}/${direction}/${serviceType}`
  );
  if (!rsRes.ok) throw new Error("Failed to fetch KMB route-stops");
  const rsData = await rsRes.json();
  const routeStops: { stop: string; seq: number }[] = rsData.data || [];

  const stops = await Promise.all(
    routeStops.map(async ({ stop, seq }) => {
      try {
        const sRes = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${stop}`);
        const sData = await sRes.json();
        return {
          id: stop,
          name_en: cleanStopName(sData.data?.name_en || stop),
          name_tc: cleanStopName(sData.data?.name_tc || stop),
          seq,
        };
      } catch {
        return { id: stop, name_en: stop, name_tc: stop, seq };
      }
    })
  );

  return stops.sort((a, b) => a.seq - b.seq);
}

async function fetchCtbStops(route: string, direction: string): Promise<BusStop[]> {
  const rsRes = await fetch(
    `https://rt.data.gov.hk/v2/transport/citybus/route-stop/CTB/${encodeURIComponent(route)}/${direction}`
  );
  if (!rsRes.ok) throw new Error("Failed to fetch CTB route-stops");
  const rsData = await rsRes.json();
  const routeStops: { stop: string; seq: string | number }[] = rsData.data || [];

  const stops = await Promise.all(
    routeStops.map(async ({ stop, seq }) => {
      try {
        const sRes = await fetch(`https://rt.data.gov.hk/v2/transport/citybus/stop/${stop}`);
        const sData = await sRes.json();
        return {
          id: stop,
          name_en: cleanStopName(sData.data?.name_en || stop),
          name_tc: cleanStopName(sData.data?.name_tc || stop),
          seq: Number(seq),
        };
      } catch {
        return { id: stop, name_en: stop, name_tc: stop, seq: Number(seq) };
      }
    })
  );

  return stops.sort((a, b) => a.seq - b.seq);
}

export function useBusStops(
  company: "KMB" | "CTB",
  route: string,
  direction: string,
  serviceType: string
) {
  return useQuery({
    queryKey: ["bus_stops", company, route, direction, serviceType],
    queryFn: () => {
      if (company === "KMB") return fetchKmbStops(route, direction, serviceType);
      return fetchCtbStops(route, direction);
    },
    enabled: !!route.trim() && !!direction,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}
