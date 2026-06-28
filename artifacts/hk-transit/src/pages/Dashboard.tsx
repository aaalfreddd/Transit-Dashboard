import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { BusColumn } from "@/components/BusColumn";
import { MtrColumn } from "@/components/MtrColumn";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { usePresets } from "@/hooks/usePresets";

type SettingsPanel = "none" | "bus" | "mtr" | "settings";

export default function Dashboard() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<SettingsPanel>("none");

  const {
    busPresets,
    mtrPresets,
    isLoaded,
    addBusPreset,
    removeBusPreset,
    addMtrPreset,
    removeMtrPreset,
  } = usePresets();

  if (!isLoaded) {
    return (
      <div
        className="h-screen w-full flex items-center justify-center"
        style={{ background: "hsl(var(--background))" }}
      >
        <div
          className="text-sm font-mono"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Initialising...
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden"
      style={{ background: "hsl(var(--background))" }}
      data-testid="dashboard"
    >
      <TopBar onSettingsOpen={() => setSettingsOpen(true)} />

      <div className="flex flex-1 min-h-0 divide-x" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <BusColumn
            presets={busPresets}
            onRemove={removeBusPreset}
            onAddClick={() => setSettingsOpen(true)}
          />
        </div>

        <div
          className="w-px shrink-0"
          style={{ background: "hsl(var(--border))" }}
        />

        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <MtrColumn
            presets={mtrPresets}
            onRemove={removeMtrPreset}
            onAddClick={() => setSettingsOpen(true)}
          />
        </div>
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        busPresets={busPresets}
        mtrPresets={mtrPresets}
        onAddBus={addBusPreset}
        onRemoveBus={removeBusPreset}
        onAddMtr={addMtrPreset}
        onRemoveMtr={removeMtrPreset}
      />
    </div>
  );
}
