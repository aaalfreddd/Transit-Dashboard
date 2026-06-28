import { useQuery } from "@tanstack/react-query";

export interface BusStopRef {
  id: string;
  seq: number;
}

export interface BusStopName {
  name_en: string;
  name_tc: string;
}

export function cleanStopName(name: string): string {
  return (name || "").replace(/\s*\([A-Z]{2}\d+\)\s*$/, "").replace(/\s*\([A-Z]{3,}\d*\)\s*$/, "").trim();
}

async function fetchKmbStopRefs(route: string, direction: string, serviceType: string): Promise<BusStopRef[]> {
  const res = await fetch(
    `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${encodeURIComponent(route)}/${direction}/${serviceType}`
  );
  if (!res.ok) throw new Error("Failed to fetch KMB route-stops");
  const json = await res.json();
  return (json.data || []).map((s: { stop: string; seq: string | number }) => ({
    id: s.stop,
    seq: Number(s.seq),
  }));
}

async function fetchCtbStopRefs(route: string, direction: string): Promise<BusStopRef[]> {
  const res = await fetch(
    `https://rt.data.gov.hk/v2/transport/citybus/route-stop/CTB/${encodeURIComponent(route)}/${direction}`
  );
  if (!res.ok) throw new Error("Failed to fetch CTB route-stops");
  const json = await res.json();
  return (json.data || []).map((s: { stop: string; seq: string | number }) => ({
    id: s.stop,
    seq: Number(s.seq),
  }));
}

// Fast: returns only stop IDs + sequence (single API call)
export function useBusStopRefs(
  company: "KMB" | "CTB",
  route: string,
  direction: string,
  serviceType: string
) {
  return useQuery({
    queryKey: ["bus_stop_refs", company, route, direction, serviceType],
    queryFn: () => {
      if (company === "KMB") return fetchKmbStopRefs(route, direction, serviceType);
      return fetchCtbStopRefs(route, direction);
    },
    enabled: !!route.trim() && !!direction,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

// Fetch a single stop's name (used for progressive loading)
export async function fetchStopName(
  stopId: string,
  operator: "KMB" | "CTB"
): Promise<BusStopName> {
  try {
    if (operator === "KMB") {
      const r = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${stopId}`);
      const d = await r.json();
      return {
        name_en: cleanStopName(d.data?.name_en || stopId),
        name_tc: cleanStopName(d.data?.name_tc || stopId),
      };
    } else {
      const r = await fetch(`https://rt.data.gov.hk/v2/transport/citybus/stop/${stopId}`);
      const d = await r.json();
      return {
        name_en: cleanStopName(d.data?.name_en || stopId),
        name_tc: cleanStopName(d.data?.name_tc || stopId),
      };
    }
  } catch {
    return { name_en: stopId, name_tc: stopId };
  }
}
