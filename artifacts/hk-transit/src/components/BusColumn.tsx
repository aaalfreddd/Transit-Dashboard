import { BusCard } from "@/components/BusCard";
import { BusPreset } from "@/hooks/usePresets";
import { Bus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

interface BusColumnProps {
  presets: BusPreset[];
  onRemove: (id: string) => void;
  onAddClick: () => void;
}

export function BusColumn({ presets, onRemove, onAddClick }: BusColumnProps) {
  const { t } = useApp();

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-center gap-2">
          <Bus className="h-4 w-4 shrink-0" style={{ color: "hsl(var(--primary))" }} />
          <span className="font-semibold tracking-wide" style={{ color: "hsl(var(--foreground))", fontSize: "var(--base-font-size)" }}>
            {t.busEta}
          </span>
          <span
            className="px-1.5 py-0.5 rounded font-mono"
            style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.75)" }}
          >
            KMB · CTB
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5"
          style={{ fontSize: "calc(var(--base-font-size) * 0.85)" }}
          onClick={onAddClick} data-testid="button-add-bus">
          <Plus className="h-3.5 w-3.5" />
          {t.addRoute}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {presets.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-40 text-center rounded-lg border border-dashed"
            style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
            data-testid="text-bus-empty"
          >
            <Bus className="h-8 w-8 mb-2 opacity-30" />
            <p style={{ fontSize: "var(--base-font-size)" }}>{t.noBusRoutes}</p>
            <p style={{ fontSize: "calc(var(--base-font-size) * 0.85)" }} className="mt-1">{t.noBusRoutesHint}</p>
          </div>
        ) : (
          presets.map((preset) => (
            <BusCard key={preset.id} preset={preset} onRemove={onRemove} />
          ))
        )}
      </div>
    </div>
  );
}
