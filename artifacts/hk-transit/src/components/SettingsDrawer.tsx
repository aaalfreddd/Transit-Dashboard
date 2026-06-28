import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BusPreset, MtrPreset } from "@/hooks/usePresets";
import { X, Plus, Bus, Train } from "lucide-react";

const MTR_LINES = [
  { code: "TML", name: "Tuen Ma Line" },
  { code: "TWL", name: "Tsuen Wan Line" },
  { code: "KTL", name: "Kwun Tong Line" },
  { code: "ISL", name: "Island Line" },
  { code: "TKL", name: "Tseung Kwan O Line" },
  { code: "EAL", name: "East Rail Line" },
  { code: "SIL", name: "South Island Line" },
  { code: "TCL", name: "Tung Chung Line" },
  { code: "AEL", name: "Airport Express" },
  { code: "DRL", name: "Disneyland Resort Line" },
];

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  busPresets: BusPreset[];
  mtrPresets: MtrPreset[];
  onAddBus: (preset: Omit<BusPreset, "id">) => void;
  onRemoveBus: (id: string) => void;
  onAddMtr: (preset: Omit<MtrPreset, "id">) => void;
  onRemoveMtr: (id: string) => void;
}

export function SettingsDrawer({
  open,
  onClose,
  busPresets,
  mtrPresets,
  onAddBus,
  onRemoveBus,
  onAddMtr,
  onRemoveMtr,
}: SettingsDrawerProps) {
  const [busForm, setBusForm] = useState({
    route: "",
    stopId: "",
    direction: "outbound",
    serviceType: "1",
  });
  const [mtrForm, setMtrForm] = useState({ line: "TML", station: "" });

  const handleAddBus = () => {
    if (!busForm.route.trim() || !busForm.stopId.trim()) return;
    onAddBus({
      route: busForm.route.trim().toUpperCase(),
      stopId: busForm.stopId.trim(),
      direction: busForm.direction,
      serviceType: busForm.serviceType,
    });
    setBusForm({ route: "", stopId: "", direction: "outbound", serviceType: "1" });
  };

  const handleAddMtr = () => {
    if (!mtrForm.station.trim()) return;
    onAddMtr({ line: mtrForm.line, station: mtrForm.station.trim().toUpperCase() });
    setMtrForm({ line: "TML", station: "" });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <SheetHeader className="mb-6">
          <SheetTitle data-testid="text-settings-title">Settings</SheetTitle>
          <SheetDescription>
            Manage your bus routes and MTR station presets.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bus className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
              <h3 className="font-semibold text-sm">Bus Routes (KMB)</h3>
            </div>

            <div className="space-y-2 mb-4">
              {busPresets.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 rounded border"
                  style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary))" }}
                  data-testid={`settings-bus-${p.id}`}
                >
                  <div>
                    <span className="font-mono font-bold text-sm">{p.route}</span>
                    <span className="text-xs ml-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {p.stopId} · {p.direction}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => onRemoveBus(p.id)}
                    data-testid={`button-settings-remove-bus-${p.id}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div
              className="rounded-lg p-4 border space-y-3"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <p className="text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
                Add Route
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Route No.</Label>
                  <Input
                    placeholder="e.g. 271"
                    value={busForm.route}
                    onChange={(e) => setBusForm((f) => ({ ...f, route: e.target.value }))}
                    className="h-8 text-sm"
                    data-testid="input-bus-route"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Stop ID</Label>
                  <Input
                    placeholder="e.g. E010S0200"
                    value={busForm.stopId}
                    onChange={(e) => setBusForm((f) => ({ ...f, stopId: e.target.value }))}
                    className="h-8 text-sm font-mono"
                    data-testid="input-bus-stopid"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Direction</Label>
                  <Select
                    value={busForm.direction}
                    onValueChange={(v) => setBusForm((f) => ({ ...f, direction: v }))}
                  >
                    <SelectTrigger className="h-8 text-sm" data-testid="select-bus-direction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="inbound">Inbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Service Type</Label>
                  <Input
                    placeholder="1"
                    value={busForm.serviceType}
                    onChange={(e) => setBusForm((f) => ({ ...f, serviceType: e.target.value }))}
                    className="h-8 text-sm"
                    data-testid="input-bus-service-type"
                  />
                </div>
              </div>
              <Button
                className="w-full h-8 text-sm gap-2"
                onClick={handleAddBus}
                disabled={!busForm.route.trim() || !busForm.stopId.trim()}
                data-testid="button-settings-add-bus"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Route
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Train className="h-4 w-4" style={{ color: "hsl(var(--accent))" }} />
              <h3 className="font-semibold text-sm">MTR Stations</h3>
            </div>

            <div className="space-y-2 mb-4">
              {mtrPresets.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 rounded border"
                  style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary))" }}
                  data-testid={`settings-mtr-${p.id}`}
                >
                  <div>
                    <span className="font-mono font-bold text-sm">{p.line}</span>
                    <span className="text-xs ml-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {p.station}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => onRemoveMtr(p.id)}
                    data-testid={`button-settings-remove-mtr-${p.id}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div
              className="rounded-lg p-4 border space-y-3"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              <p className="text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
                Add Station
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Line</Label>
                  <Select
                    value={mtrForm.line}
                    onValueChange={(v) => setMtrForm((f) => ({ ...f, line: v }))}
                  >
                    <SelectTrigger className="h-8 text-sm" data-testid="select-mtr-line">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MTR_LINES.map((l) => (
                        <SelectItem key={l.code} value={l.code}>
                          {l.code} — {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Station Code</Label>
                  <Input
                    placeholder="e.g. TIS"
                    value={mtrForm.station}
                    onChange={(e) => setMtrForm((f) => ({ ...f, station: e.target.value }))}
                    className="h-8 text-sm font-mono"
                    data-testid="input-mtr-station"
                  />
                </div>
              </div>
              <Button
                className="w-full h-8 text-sm gap-2"
                onClick={handleAddMtr}
                disabled={!mtrForm.station.trim()}
                data-testid="button-settings-add-mtr"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Station
              </Button>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Station codes: TIS, TSW, KOT, HKU, NOP, etc. Find your station code at the MTR official site.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
