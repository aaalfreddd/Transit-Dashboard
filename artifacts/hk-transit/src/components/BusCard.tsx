import { useBusEta } from "@/hooks/useBusEta";
import { BusPreset } from "@/hooks/usePresets";
import { Skeleton } from "@/components/ui/skeleton";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

function minutesUntil(etaStr: string | null): number | null {
  if (!etaStr) return null;
  const diff = (new Date(etaStr).getTime() - Date.now()) / 60000;
  return diff;
}

function formatAbsTime(etaStr: string | null): string {
  if (!etaStr) return "";
  return new Date(etaStr).toLocaleTimeString("en-HK", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Hong_Kong",
  });
}

function etaColor(minutes: number | null): string {
  if (minutes === null || minutes < 0) return "hsl(var(--muted-foreground))";
  if (minutes < 2) return "hsl(0 84% 60%)";
  if (minutes < 5) return "hsl(38 92% 50%)";
  return "hsl(var(--foreground))";
}

interface BusCardProps {
  preset: BusPreset;
  onRemove: (id: string) => void;
}

export function BusCard({ preset, onRemove }: BusCardProps) {
  const { t, language } = useApp();
  const { data, isLoading, isError, refetch } = useBusEta(
    preset.company ?? "KMB",
    preset.stopId,
    preset.route,
    preset.direction,
    preset.serviceType
  );

  function etaLabel(minutes: number | null): string {
    if (minutes === null) return "-";
    if (minutes < 0) return t.departed;
    if (minutes < 1) return t.due;
    return `${Math.floor(minutes)} min`;
  }

  const dest = language === "zh"
    ? (data?.routeInfo.dest_tc || data?.routeInfo.dest_en)
    : data?.routeInfo.dest_en;
  const fallbackDest = language === "zh"
    ? (preset.direction === "outbound" ? "去程" : "回程")
    : (preset.direction === "outbound" ? t.outbound : t.inbound);

  if (isLoading) {
    return (
      <div
        className="rounded-lg p-4 border"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        data-testid={`card-bus-loading-${preset.id}`}
      >
        <div className="flex justify-between items-start mb-3">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border overflow-hidden group"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      data-testid={`card-bus-${preset.id}`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center h-10 w-10 rounded font-bold font-mono"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              fontSize: "calc(var(--base-font-size) * 1.3)",
            }}
            data-testid={`text-bus-route-${preset.id}`}
          >
            {preset.route}
          </div>
          <div>
            <div
              className="font-semibold"
              style={{ color: "hsl(var(--foreground))", fontSize: "var(--base-font-size)" }}
              data-testid={`text-bus-dest-${preset.id}`}
            >
              {dest || fallbackDest}
            </div>
            <div
              className="flex items-center gap-1.5 mt-0.5"
              style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.8)" }}
            >
              <span
                className="px-1 py-0.5 rounded font-mono"
                style={{ background: "hsl(var(--secondary))" }}
              >
                {preset.company ?? "KMB"}
              </span>
              <span>{preset.stopId}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
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

      <div className="px-4 py-3">
        {isError ? (
          <div
            className="text-center py-2"
            style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.9)" }}
            data-testid={`text-bus-error-${preset.id}`}
          >
            {t.apiUnavailable}
          </div>
        ) : !data?.etas?.length ? (
          <div
            className="text-center py-2"
            style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.9)" }}
            data-testid={`text-bus-noservice-${preset.id}`}
          >
            {t.noService}
          </div>
        ) : (
          <div className="space-y-2">
            {data.etas.map((eta, i) => {
              const mins = minutesUntil(eta.eta);
              const etaDest = language === "zh" ? (eta.dest_tc || eta.dest_en) : eta.dest_en;
              const rmk = language === "zh" ? (eta.rmk_tc || eta.rmk_en) : eta.rmk_en;
              return (
                <div key={i} className="flex items-center justify-between"
                  data-testid={`text-bus-eta-${preset.id}-${i}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-5 h-5 flex items-center justify-center rounded-full font-mono shrink-0"
                      style={{
                        background: i === 0 ? "hsl(var(--primary) / 0.2)" : "hsl(var(--secondary))",
                        color: i === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                        fontSize: "calc(var(--base-font-size) * 0.75)",
                      }}
                    >
                      {i + 1}
                    </div>
                    {etaDest && (
                      <span className="truncate" style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.8)" }}>
                        {etaDest}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {rmk && rmk !== "-" && (
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.75)" }}
                      >
                        {rmk}
                      </span>
                    )}
                    <span className="font-mono" style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.8)" }}>
                      {formatAbsTime(eta.eta)}
                    </span>
                    <span
                      className="font-bold font-mono min-w-[52px] text-right"
                      style={{ color: etaColor(mins), fontSize: "var(--base-font-size)" }}
                    >
                      {etaLabel(mins)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
