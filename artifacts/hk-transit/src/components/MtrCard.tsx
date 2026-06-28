import { useMtrSchedule, MtrTrain } from "@/hooks/useMtrSchedule";
import { MtrPreset } from "@/hooks/usePresets";
import { Skeleton } from "@/components/ui/skeleton";
import { X, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const MTR_LINE_NAMES: Record<string, { name: string; color: string }> = {
  TML: { name: "Tuen Ma Line", color: "hsl(147 43% 38%)" },
  TWL: { name: "Tsuen Wan Line", color: "hsl(357 80% 46%)" },
  KTL: { name: "Kwun Tong Line", color: "hsl(71 72% 35%)" },
  ISL: { name: "Island Line", color: "hsl(214 88% 51%)" },
  TKL: { name: "Tseung Kwan O Line", color: "hsl(282 55% 53%)" },
  EAL: { name: "East Rail Line", color: "hsl(21 80% 45%)" },
  SIL: { name: "South Island Line", color: "hsl(156 72% 31%)" },
  TCL: { name: "Tung Chung Line", color: "hsl(34 75% 49%)" },
  AEL: { name: "Airport Express", color: "hsl(196 72% 40%)" },
  DRL: { name: "Disneyland Resort Line", color: "hsl(324 71% 59%)" },
};

function minutesUntil(timeStr: string, _currTimeStr: string): number | null {
  if (!timeStr) return null;
  try {
    // MTR API returns "YYYY-MM-DD HH:MM:SS" format
    const isoStr = timeStr.replace(" ", "T") + "+08:00";
    const trainTime = new Date(isoStr);
    if (isNaN(trainTime.getTime())) return null;
    const diff = (trainTime.getTime() - Date.now()) / 1000 / 60;
    return diff;
  } catch {
    return null;
  }
}

function formatMtrTime(timeStr: string): string {
  if (!timeStr) return "--:--";
  // "YYYY-MM-DD HH:MM:SS" → "HH:MM"
  const parts = timeStr.split(" ");
  if (parts.length >= 2) return parts[1].substring(0, 5);
  // Fallback: ISO format with T
  const tParts = timeStr.split("T");
  if (tParts.length >= 2) return tParts[1].substring(0, 5);
  return "--:--";
}

function minuteLabel(mins: number | null): string {
  if (mins === null) return "-";
  if (mins < 0) return "Arr";
  if (mins < 1) return "Due";
  return `${Math.floor(mins)} min`;
}

function minuteColor(mins: number | null): string {
  if (mins === null) return "hsl(var(--muted-foreground))";
  if (mins < 0) return "hsl(var(--muted-foreground))";
  if (mins < 2) return "hsl(0 84% 60%)";
  if (mins < 5) return "hsl(38 92% 50%)";
  return "hsl(var(--foreground))";
}

function TrainRow({ train, currTime, index }: { train: MtrTrain; currTime: string; index: number }) {
  const mins = minutesUntil(train.time, currTime);
  return (
    <div
      className="flex items-center justify-between py-1"
      data-testid={`text-mtr-train-${train.dest}-${index}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-xs w-5 h-5 flex items-center justify-center rounded-full font-mono shrink-0"
          style={{
            background: index === 0 ? "hsl(var(--accent) / 0.2)" : "hsl(var(--secondary))",
            color: index === 0 ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))",
          }}
        >
          {index + 1}
        </span>
        <span
          className="text-xs truncate"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {train.dest}
        </span>
        {train.plat && (
          <span
            className="text-xs px-1 py-0.5 rounded shrink-0"
            style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
          >
            P{train.plat}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs font-mono" style={{ color: "hsl(var(--muted-foreground))" }}>
          {formatMtrTime(train.time)}
        </span>
        <span
          className="font-bold font-mono text-sm min-w-[52px] text-right"
          style={{ color: minuteColor(mins) }}
        >
          {minuteLabel(mins)}
        </span>
      </div>
    </div>
  );
}

interface MtrCardProps {
  preset: MtrPreset;
  onRemove: (id: string) => void;
}

export function MtrCard({ preset, onRemove }: MtrCardProps) {
  const { data, isLoading, isError, refetch } = useMtrSchedule(preset.line, preset.station);
  const lineInfo = MTR_LINE_NAMES[preset.line] || { name: preset.line, color: "hsl(var(--accent))" };

  if (isLoading) {
    return (
      <div
        className="rounded-lg p-4 border"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        data-testid={`card-mtr-loading-${preset.id}`}
      >
        <Skeleton className="h-6 w-40 mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const upTrains = data?.up?.slice(0, 3) || [];
  const downTrains = data?.down?.slice(0, 3) || [];
  const currTime = data?.currTime || "";

  return (
    <div
      className="rounded-lg border overflow-hidden group"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      data-testid={`card-mtr-${preset.id}`}
    >
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ background: lineInfo.color }}
          />
          <div>
            <div
              className="text-sm font-semibold"
              style={{ color: "hsl(var(--foreground))" }}
              data-testid={`text-mtr-line-${preset.id}`}
            >
              {lineInfo.name}
            </div>
            <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              {preset.station} Station
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isError && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-60 hover:opacity-100"
              onClick={() => refetch()}
              data-testid={`button-mtr-refresh-${preset.id}`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
            onClick={() => onRemove(preset.id)}
            data-testid={`button-mtr-remove-${preset.id}`}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-3">
        {isError ? (
          <div
            className="text-sm text-center py-2"
            style={{ color: "hsl(var(--muted-foreground))" }}
            data-testid={`text-mtr-error-${preset.id}`}
          >
            API unavailable — retrying
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div
                className="flex items-center gap-1.5 mb-2 text-xs font-medium"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                <ArrowUp className="h-3 w-3" />
                Up
              </div>
              {upTrains.length === 0 ? (
                <div
                  className="text-xs"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  No service
                </div>
              ) : (
                <div className="space-y-0.5">
                  {upTrains.map((train, i) => (
                    <TrainRow key={i} train={train} currTime={currTime} index={i} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <div
                className="flex items-center gap-1.5 mb-2 text-xs font-medium"
                style={{ color: "hsl(var(--muted-foreground))" }}
              >
                <ArrowDown className="h-3 w-3" />
                Down
              </div>
              {downTrains.length === 0 ? (
                <div
                  className="text-xs"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  No service
                </div>
              ) : (
                <div className="space-y-0.5">
                  {downTrains.map((train, i) => (
                    <TrainRow key={i} train={train} currTime={currTime} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
