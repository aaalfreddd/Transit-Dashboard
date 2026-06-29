import { BusCard } from "@/components/BusCard";
import { BusSearchPanel } from "@/components/BusSearchPanel";
import { BusPreset } from "@/hooks/usePresets";
import { Bus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

interface BusColumnProps {
  presets: BusPreset[];
  onRemove: (id: string) => void;
  onUpdateName: (id: string, stopName: string) => void;
  onAddClick: () => void;
}

export function BusColumn({ presets, onRemove, onUpdateName, onAddClick }: BusColumnProps) {
  const { t } = useApp();

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Column header */}
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

      {/* Scrollable presets */}
      <div className="overflow-y-auto p-4 space-y-3" style={{ maxHeight: presets.length === 0 ? 0 : undefined }}>
        {presets.length === 0 ? null : presets.map((preset) => (
          <BusCard key={preset.id} preset={preset} onRemove={onRemove} onUpdateName={onUpdateName} />
        ))}
      </div>

      {/* Empty state for presets */}
      {presets.length === 0 && (
        <div
          className="flex items-center gap-3 mx-4 mt-4 px-4 py-3 rounded-lg border border-dashed"
          style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
          data-testid="text-bus-empty"
        >
          <Bus className="h-5 w-5 opacity-40 shrink-0" />
          <div>
            <p style={{ fontSize: "calc(var(--base-font-size) * 0.9)" }}>{t.noBusRoutes}</p>
            <p style={{ fontSize: "calc(var(--base-font-size) * 0.8)" }} className="mt-0.5">{t.noBusRoutesHint}</p>
          </div>
        </div>
      )}

      {/* Search panel — always visible at bottom, fills remaining space */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <BusSearchPanel />
      </div>
    </div>
  );
}
