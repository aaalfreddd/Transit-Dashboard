import { useEffect } from "react";
import { useBusEta } from "@/hooks/useBusEta";
import { BusPreset } from "@/hooks/usePresets";
import { Skeleton } from "@/components/ui/skeleton";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { EtaChip } from "@/components/EtaChip";
import { fetchStopName, cleanStopName } from "@/hooks/useBusStops";

interface BusCardProps {
  preset: BusPreset;
  onRemove: (id: string) => void;
  onUpdateName: (id: string, stopName: string) => void;
}

export function BusCard({ preset, onRemove, onUpdateName }: BusCardProps) {
  const { t, language } = useApp();
  const company = preset.company ?? "KMB";
  const { data, isLoading, isError, refetch } = useBusEta(
    company,
    preset.stopId,
    preset.route,
    preset.direction,
    preset.serviceType
  );

  // Auto-fetch and save stop name if missing
  useEffect(() => {
    if (preset.stopName) return; // already have it
    let cancelled = false;
    (async () => {
      const info = await fetchStopName(preset.stopId, company);
      if (!cancelled && info.name_en) {
        const name = cleanStopName(language === "zh" ? info.name_tc : info.name_en);
        onUpdateName(preset.id, name);
      }
    })();
    return () => { cancelled = true; };
  }, [preset.stopName, preset.stopId, preset.id, company, language, onUpdateName]);

  const routeDest = language === "zh"
    ? (data?.routeInfo.dest_tc || data?.routeInfo.dest_en)
    : data?.routeInfo.dest_en;
  const fallbackDest = language === "zh"
    ? (preset.direction === "outbound" ? "去程" : "回程")
    : (preset.direction === "outbound" ? t.outbound : t.inbound);

  const isKmb = company === "KMB";
  const routeColor = isKmb ? "hsl(var(--primary))" : "hsl(38 92% 50%)";

  if (isLoading) {
    return (
      <div
        className="rounded-lg border overflow-hidden"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        data-testid={`card-bus-loading-${preset.id}`}
      >
        <div className="px-4 py-3 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40 mb-1.5" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="px-4 pb-3 space-y-2">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-3/4 rounded-lg" />
        </div>
      </div>
    );
  }

  const stopLabel = preset.stopName || preset.stopId;

  return (
    <div
      className="rounded-lg border overflow-hidden group"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      data-testid={`card-bus-${preset.id}`}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        {/* Route badge */}
        <div
          className="flex items-center justify-center h-10 w-10 rounded font-bold font-mono shrink-0"
          style={{
            background: `${routeColor}22`,
            color: routeColor,
            fontSize: "calc(var(--base-font-size) * 1.4)",
            border: `1.5px solid ${routeColor}55`,
          }}
          data-testid={`text-bus-route-${preset.id}`}
        >
          {preset.route}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="font-semibold truncate"
            style={{ color: "hsl(var(--foreground))", fontSize: "var(--base-font-size)" }}
            data-testid={`text-bus-dest-${preset.id}`}
          >
            {routeDest || fallbackDest}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="px-1.5 py-0.5 rounded font-bold"
              style={{
                background: `${routeColor}22`,
                color: routeColor,
                fontSize: "10px",
              }}
            >
              {company}
            </span>
            <span
              className="truncate"
              style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px" }}
            >
              {stopLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isError && (
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-60 hover:opacity-100"
              onClick={() => refetch()} data-testid={`button-bus-refresh-${preset.id}`}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
            onClick={() => onRemove(preset.id)} data-testid={`button-bus-remove-${preset.id}`}>
            <X className="h-3.5 w-3.5" />
            </Button>
        </div>
      </div>

      {/* ETA body */}
      <div className="px-4 py-3 space-y-3">
        {isError ? (
          <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.85)" }}
            data-testid={`text-bus-error-${preset.id}`}>
            {t.apiUnavailable}
          </div>
        ) : !data?.grouped?.length ? (
          <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.85)" }}
            data-testid={`text-bus-noservice-${preset.id}`}>
            {t.noService}
          </div>
        ) : (
          data.grouped.map((group, gi) => {
            const destLabel = language === "zh"
              ? (group.dest_tc || group.dest_en)
              : group.dest_en;
            return (
              <div key={gi}>
                {destLabel && (
                  <div
                    className="mb-1.5"
                    style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px" }}
                  >
                    → {destLabel}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {group.etas.map((eta, ei) => (
                    <EtaChip
                      key={ei}
                      etaStr={eta.eta}
                      remark={language === "zh" ? (eta.rmk_tc || eta.rmk_en) : eta.rmk_en}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
