import { MtrCard } from "@/components/MtrCard";
import { MtrPreset } from "@/hooks/usePresets";
import { Train, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MtrColumnProps {
  presets: MtrPreset[];
  onRemove: (id: string) => void;
  onAddClick: () => void;
}

export function MtrColumn({ presets, onRemove, onAddClick }: MtrColumnProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-center gap-2">
          <Train className="h-4 w-4" style={{ color: "hsl(var(--accent))" }} />
          <span className="text-sm font-semibold tracking-wide" style={{ color: "hsl(var(--foreground))" }}>
            MTR
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded font-mono"
            style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
          >
            Schedule
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={onAddClick}
          data-testid="button-add-mtr"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Station
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {presets.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-40 text-center rounded-lg border border-dashed"
            style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
            data-testid="text-mtr-empty"
          >
            <Train className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No MTR stations added</p>
            <p className="text-xs mt-1">Click "Add Station" to get started</p>
          </div>
        ) : (
          presets.map((preset) => (
            <MtrCard key={preset.id} preset={preset} onRemove={onRemove} />
          ))
        )}
      </div>
    </div>
  );
}
