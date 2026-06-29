import { useMtrSchedule, MtrTrain } from "@/hooks/useMtrSchedule";
import { MtrPreset } from "@/hooks/usePresets";
import { Skeleton } from "@/components/ui/skeleton";
import { X, RefreshCw, ArrowUp, ArrowDown, TrainFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { MTR_LINE_MAP, MTR_STATION_MAP } from "@/lib/mtrStations";

function minutesUntil(timeStr: string): number | null {
  if (!timeStr) return null;
  try {
    const isoStr = timeStr.replace(" ", "T") + "+08:00";
    const t = new Date(isoStr);
    if (isNaN(t.getTime())) return null;
    return (t.getTime() - Date.now()) / 60000;
  } catch {
    return null;
  }
}

function formatMtrTime(timeStr: string): string {
  if (!timeStr) return "--:--";
  const parts = timeStr.split(" ");
  if (parts.length >= 2) return parts[1].substring(0, 5);
  const tParts = timeStr.split("T");
  if (tParts.length >= 2) return tParts[1].substring(0, 5);
  return "--:--";
}

function minuteColor(mins: number | null): string {
  if (mins === null || mins < 0) return "hsl(var(--muted-foreground))";
  if (mins < 2) return "hsl(0 84% 60%)";
  if (mins < 5) return "hsl(38 92% 50%)";
  return "hsl(var(--foreground))";
}

function TrainRow({
  train, index, due, departed, language,
}: {
  train: MtrTrain; index: number; due: string; departed: string; language: string;
}) {
  const mins = minutesUntil(train.time);
  const label = mins === null ? "-" : mins < 0 ? departed : mins < 1 ? due : `${Math.floor(mins)} min`;

  // Resolve destination code to full station name
  const destInfo = MTR_STATION_MAP[train.dest];
  const destName = destInfo
    ? (language === "zh" ? destInfo.name_zh : destInfo.name_en)
    : train.dest;

  return (
    <div className="flex items-center justify-between py-1" data-testid={`text-mtr-train-${train.dest}-${index}`}>
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-5 h-5 flex items-center justify-center rounded-full font-mono shrink-0"
          style={{
            background: index === 0 ? "hsl(var(--accent) / 0.2)" : "hsl(var(--secondary))",
            color: index === 0 ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))",
            fontSize: "calc(var(--base-font-size) * 0.75)",
          }}
        >
          {index + 1}
        </span>
        <span className="truncate" style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.8)" }}>
          {destName}
        </span>
        {train.plat && (
          <span
            className="px-1 py-0.5 rounded shrink-0"
            style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.75)" }}
          >
            P{train.plat}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono" style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.8)" }}>
          {formatMtrTime(train.time)}
        </span>
        <span
          className="font-bold font-mono min-w-[52px] text-right"
          style={{ color: minuteColor(mins), fontSize: "var(--base-font-size)" }}
        >
          {label}
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
  const { t, language } = useApp();
  const { data, isLoading, isError, refetch } = useMtrSchedule(preset.line, preset.station);

  const lineData = MTR_LINE_MAP[preset.line];
  const lineName = lineData
    ? (language === "zh" ? lineData.name_zh : lineData.name_en)
    : (t.mtrLineNames[preset.line] || preset.line);
  const lineColor = lineData?.color || "hsl(var(--accent))";

  const stationData = lineData?.stations.find((s) => s.code === preset.station);
  const stationName = stationData
    ? (language === "zh" ? stationData.name_zh : stationData.name_en)
    : preset.station;

  if (isLoading) {
    return (
      <div
        className="rounded-lg p-4 border"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        data-testid={`card-mtr-loading-${preset.id}`}
      >
        <Skeleton className="h-6 w-40 mb-3" />
        <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-5 w-full" />)}</div>
      </div>
    );
  }

  const upTrains = data?.up?.slice(0, 3) || [];
  const downTrains = data?.down?.slice(0, 3) || [];

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
          <div className="h-3 w-3 rounded-full shrink-0" style={{ background: lineColor }} />
          <div>
            <div className="font-semibold" style={{ color: "hsl(var(--foreground))", fontSize: "var(--base-font-size)" }}
              data-testid={`text-mtr-line-${preset.id}`}>
              ➜ {lineName}
            </div>
            <div className="flex items-center gap-1"
              style={{ color: "hsl(var(--muted-foreground))", fontSize: "var(--base-font-size)" }}>
              <TrainFront className="h-3.5 w-3.5 shrink-0 opacity-80" />
              {stationName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isError && (
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-60 hover:opacity-100"
              onClick={() => refetch()} data-testid={`button-mtr-refresh-${preset.id}`}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon"
            className="h-7 w-7 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
            onClick={() => onRemove(preset.id)} data-testid={`button-mtr-remove-${preset.id}`}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="px-4 py-3">
        {isError ? (
          <div className="text-center py-2" style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.9)" }}
            data-testid={`text-mtr-error-${preset.id}`}>
            {t.apiUnavailable}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2 font-medium"
                style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.8)" }}>
                <ArrowUp className="h-3 w-3" />
                {t.up}
              </div>
              {upTrains.length === 0
                ? <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.85)" }}>{t.noService}</div>
                : <div className="space-y-0.5">{upTrains.map((train, i) => (
                    <TrainRow key={i} train={train} index={i} due={t.due} departed={t.departed} language={language} />
                  ))}</div>
              }
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-2 font-medium"
                style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.8)" }}>
                <ArrowDown className="h-3 w-3" />
                {t.down}
              </div>
              {downTrains.length === 0
                ? <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.85)" }}>{t.noService}</div>
                : <div className="space-y-0.5">{downTrains.map((train, i) => (
                    <TrainRow key={i} train={train} index={i} due={t.due} departed={t.departed} language={language} />
                  ))}</div>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
