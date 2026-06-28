import { useQuery } from "@tanstack/react-query";

export interface BusEta {
  eta: string | null;
  rmk_en: string;
  rmk_tc: string;
  dest_en: string;
  dest_tc: string;
  eta_seq: number;
}

export interface RouteInfo {
  orig_en: string;
  orig_tc: string;
  dest_en: string;
  dest_tc: string;
}

async function fetchKmbEta(stopId: string, route: string, serviceType: string): Promise<BusEta[]> {
  const res = await fetch(
    `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/${serviceType}`
  );
  if (!res.ok) throw new Error("Failed to fetch KMB ETA");
  const json = await res.json();
  return json.data || [];
}

async function fetchCtbEta(stopId: string, route: string): Promise<BusEta[]> {
  const res = await fetch(
    `https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/${stopId}/${route}`
  );
  if (!res.ok) throw new Error("Failed to fetch CTB ETA");
  const json = await res.json();
  return (json.data || []).map((d: {
    eta?: string | null; rmk_en?: string; rmk_tc?: string;
    dest_en?: string; dest_tc?: string; eta_seq?: number;
  }) => ({
    eta: d.eta ?? null,
    rmk_en: d.rmk_en || "",
    rmk_tc: d.rmk_tc || "",
    dest_en: d.dest_en || "",
    dest_tc: d.dest_tc || "",
    eta_seq: d.eta_seq ?? 0,
  }));
}

async function fetchKmbRouteInfo(route: string, direction: string, serviceType: string): Promise<RouteInfo> {
  const res = await fetch(
    `https://data.etabus.gov.hk/v1/transport/kmb/route/${route}/${direction}/${serviceType}`
  );
  if (!res.ok) throw new Error();
  const json = await res.json();
  return {
    orig_en: json.data?.orig_en || "", orig_tc: json.data?.orig_tc || "",
    dest_en: json.data?.dest_en || "", dest_tc: json.data?.dest_tc || "",
  };
}

async function fetchCtbRouteInfo(route: string, direction: string): Promise<RouteInfo> {
  const res = await fetch(`https://rt.data.gov.hk/v2/transport/citybus/route/CTB/${route}`);
  if (!res.ok) throw new Error();
  const json = await res.json();
  const d = json.data || {};
  if (direction === "outbound") {
    return { orig_en: d.orig_en || "", orig_tc: d.orig_tc || "", dest_en: d.dest_en || "", dest_tc: d.dest_tc || "" };
  }
  return { orig_en: d.dest_en || "", orig_tc: d.dest_tc || "", dest_en: d.orig_en || "", dest_tc: d.orig_tc || "" };
}

export interface BusEtaGrouped {
  dest_en: string;
  dest_tc: string;
  etas: BusEta[];
}

export interface BusEtaResult {
  grouped: BusEtaGrouped[];
  routeInfo: RouteInfo;
}

export function useBusEta(
  company: "KMB" | "CTB",
  stopId: string,
  route: string,
  direction: string,
  serviceType: string
) {
  return useQuery({
    queryKey: ["bus_eta", company, stopId, route, direction, serviceType],
    queryFn: async (): Promise<BusEtaResult> => {
      const [etas, routeInfo] = await Promise.all([
        company === "KMB"
          ? fetchKmbEta(stopId, route, serviceType)
          : fetchCtbEta(stopId, route),
        company === "KMB"
          ? fetchKmbRouteInfo(route, direction, serviceType).catch(() => ({ orig_en: "", orig_tc: "", dest_en: "", dest_tc: "" }))
          : fetchCtbRouteInfo(route, direction).catch(() => ({ orig_en: "", orig_tc: "", dest_en: "", dest_tc: "" })),
      ]);

      // Group by destination (up to 3 per dest)
      const byDest = new Map<string, BusEtaGrouped>();
      for (const e of etas) {
        const key = e.dest_tc || e.dest_en || route;
        if (!byDest.has(key)) {
          byDest.set(key, { dest_en: e.dest_en, dest_tc: e.dest_tc, etas: [] });
        }
        const group = byDest.get(key)!;
        if (group.etas.length < 3 && (e.eta || e.rmk_tc || e.rmk_en)) {
          group.etas.push(e);
        }
      }

      return { grouped: Array.from(byDest.values()), routeInfo };
    },
    refetchInterval: 30000,
    staleTime: 25000,
    enabled: !!stopId && !!route,
  });
}
