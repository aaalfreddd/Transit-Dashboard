import { useState, useEffect } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BusPreset, MtrPreset } from "@/hooks/usePresets";
import { MTR_LINES } from "@/lib/mtrStations";
import { useBusStopRefs, fetchStopName, BusStopName } from "@/hooks/useBusStops";
import { useApp } from "@/contexts/AppContext";
import { X, Plus, Bus, Train, Loader2 } from "lucide-react";

type Company = "KMB" | "CTB";

function BusStopSelect({
  company, route, direction, serviceType, value, onChange, language,
}: {
  company: Company; route: string; direction: string; serviceType: string;
  value: string; onChange: (stopId: string, stopName: string) => void; language: string;
}) {
  const canFetch = !!route.trim() && !!direction;
  const { data: stopRefs, isLoading, isError } = useBusStopRefs(company, route, direction, serviceType);
  const [names, setNames] = useState<Record<string, BusStopName>>({});
  const [loadingNames, setLoadingNames] = useState(false);

  // Progressive name loading in batches of 6
  useEffect(() => {
    if (!stopRefs?.length) { setNames({}); return; }
    setNames({});
    setLoadingNames(true);
    let cancelled = false;

    (async () => {
      const batches: typeof stopRefs[] = [];
      for (let i = 0; i < stopRefs.length; i += 6) batches.push(stopRefs.slice(i, i + 6));

      let current: Record<string, BusStopName> = {};
      for (const batch of batches) {
        if (cancelled) return;
        const entries = await Promise.all(
          batch.map(async (s) => [s.id, await fetchStopName(s.id, company)] as [string, BusStopName])
        );
        current = { ...current, ...Object.fromEntries(entries) };
        if (!cancelled) setNames({ ...current });
      }
      if (!cancelled) setLoadingNames(false);
    })();

    return () => { cancelled = true; };
  }, [stopRefs, company]);

  const fsSmall = "calc(var(--base-font-size) * 0.85)";

  if (!canFetch) {
    return (
      <div className="w-full h-8 rounded border px-3 flex items-center"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", fontSize: fsSmall }}>
        Enter route &amp; direction first
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-8 rounded border px-3 flex items-center gap-2"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", fontSize: fsSmall }}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Loading stops…
      </div>
    );
  }

  if (isError || !stopRefs?.length) {
    return (
      <div className="w-full h-8 rounded border px-3 flex items-center"
        style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary))", color: "hsl(0 84% 60%)", fontSize: fsSmall }}>
        No stops found for this route
      </div>
    );
  }

  const loaded = Object.keys(names).length;
  const total = stopRefs.length;
  const pct = total > 0 ? Math.round(loaded / total * 100) : 0;

  return (
    <div className="space-y-1">
      {/* Progress bar while names are loading */}
      {loadingNames && (
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, background: "hsl(var(--primary))" }} />
        </div>
      )}
      <Select
        value={value}
        onValueChange={(stopId) => {
          const nameInfo = names[stopId];
          const stopName = nameInfo
            ? (language === "zh" ? nameInfo.name_tc : nameInfo.name_en)
            : "";
          onChange(stopId, stopName);
        }}
      >
        <SelectTrigger className="h-8" style={{ fontSize: fsSmall }} data-testid="select-bus-stop">
          <SelectValue placeholder={loadingNames ? `Loading names… (${pct}%)` : "Select stop"} />
        </SelectTrigger>
        <SelectContent className="max-h-72 overflow-y-auto">
          {stopRefs.map((stop) => {
            const nameInfo = names[stop.id];
            const displayName = nameInfo
              ? (language === "zh" ? nameInfo.name_tc : nameInfo.name_en)
              : null;
            return (
              <SelectItem
                key={stop.id}
                value={stop.id}
                disabled={!displayName}
              >
                <span className="font-mono text-xs opacity-50 mr-1.5">{stop.seq}.</span>
                {displayName
                  ? <span className="font-medium">{displayName}</span>
                  : <span className="opacity-40 italic" style={{ fontSize: "0.85em" }}>Loading…</span>
                }
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  busPresets: BusPreset[];
  mtrPresets: MtrPreset[];
  onAddBus: (preset: Omit<BusPreset, "id">) => void;
  onRemoveBus: (id: string) => void;
  onUpdateBusName: (id: string, stopName: string) => void;
  onAddMtr: (preset: Omit<MtrPreset, "id">) => void;
  onRemoveMtr: (id: string) => void;
}

export function SettingsDrawer({
  open, onClose,
  busPresets, mtrPresets,
  onAddBus, onRemoveBus, onUpdateBusName,
  onAddMtr, onRemoveMtr,
}: SettingsDrawerProps) {
  const { t, language } = useApp();

  const [busForm, setBusForm] = useState({
    company: "KMB" as Company,
    route: "",
    direction: "outbound",
    serviceType: "1",
    stopId: "",
    stopName: "",
  });

  const [mtrForm, setMtrForm] = useState({ line: "TML", station: "" });

  const handleAddBus = () => {
    if (!busForm.route.trim() || !busForm.stopId) return;
    onAddBus({
      company: busForm.company,
      route: busForm.route.trim().toUpperCase(),
      stopId: busForm.stopId,
      stopName: busForm.stopName,
      direction: busForm.direction,
      serviceType: busForm.serviceType,
    });
    setBusForm({ company: "KMB", route: "", direction: "outbound", serviceType: "1", stopId: "", stopName: "" });
  };

  const handleAddMtr = () => {
    if (!mtrForm.station) return;
    onAddMtr({ line: mtrForm.line, station: mtrForm.station });
    setMtrForm((f) => ({ ...f, station: "" }));
  };

  const selectedMtrLine = MTR_LINES.find((l) => l.code === mtrForm.line);

  const fs = "var(--base-font-size)";
  const fsSmall = "calc(var(--base-font-size) * 0.85)";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <SheetHeader className="mb-6">
          <SheetTitle style={{ fontSize: "calc(var(--base-font-size) * 1.1)" }} data-testid="text-settings-title">
            {t.settings}
          </SheetTitle>
          <SheetDescription style={{ fontSize: fsSmall }}>{t.settingsDesc}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Bus Routes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bus className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
              <h3 className="font-semibold" style={{ fontSize: fs }}>{t.busRoutes}</h3>
            </div>

            <div className="space-y-2 mb-4">
              {busPresets.map((p) => (
                <div key={p.id}
                  className="flex items-center justify-between px-3 py-2 rounded border"
                  style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary))" }}
                  data-testid={`settings-bus-${p.id}`}
                >
                  <div>
                    <span className="font-mono font-bold" style={{ fontSize: fs }}>{p.route}</span>
                    <span className="ml-1.5 px-1 py-0.5 rounded"
                      style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", fontSize: fsSmall }}>
                      {p.company ?? "KMB"}
                    </span>
                    <span className="ml-2" style={{ color: "hsl(var(--muted-foreground))", fontSize: fsSmall }}>
                      {p.direction} · {p.stopId}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"
                    onClick={() => onRemoveBus(p.id)} data-testid={`button-settings-remove-bus-${p.id}`}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="rounded-lg p-4 border space-y-3" style={{ borderColor: "hsl(var(--border))" }}>
              <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))", fontSize: fsSmall }}>
                {t.addRoute}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block" style={{ fontSize: fsSmall }}>{t.company}</Label>
                  <Select value={busForm.company}
                    onValueChange={(v) => setBusForm((f) => ({ ...f, company: v as Company, stopId: "" }))}>
                    <SelectTrigger className="h-8" style={{ fontSize: fsSmall }} data-testid="select-bus-company">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KMB">KMB 九巴</SelectItem>
                      <SelectItem value="CTB">CTB 城巴</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1 block" style={{ fontSize: fsSmall }}>{t.routeNo}</Label>
                  <Input
                    placeholder={t.selectRoute}
                    value={busForm.route}
                    onChange={(e) => setBusForm((f) => ({ ...f, route: e.target.value, stopId: "" }))}
                    className="h-8 font-mono"
                    style={{ fontSize: fsSmall }}
                    data-testid="input-bus-route"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block" style={{ fontSize: fsSmall }}>{t.direction}</Label>
                  <Select value={busForm.direction}
                    onValueChange={(v) => setBusForm((f) => ({ ...f, direction: v, stopId: "" }))}>
                    <SelectTrigger className="h-8" style={{ fontSize: fsSmall }} data-testid="select-bus-direction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="outbound">{t.outbound}</SelectItem>
                      <SelectItem value="inbound">{t.inbound}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {busForm.company === "KMB" && (
                  <div>
                    <Label className="mb-1 block" style={{ fontSize: fsSmall }}>{t.serviceType}</Label>
                    <Input
                      placeholder="1"
                      value={busForm.serviceType}
                      onChange={(e) => setBusForm((f) => ({ ...f, serviceType: e.target.value, stopId: "" }))}
                      className="h-8"
                      style={{ fontSize: fsSmall }}
                      data-testid="input-bus-service-type"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-1 block" style={{ fontSize: fsSmall }}>Bus Stop</Label>
                <BusStopSelect
                  company={busForm.company}
                  route={busForm.route}
                  direction={busForm.direction}
                  serviceType={busForm.serviceType}
                  value={busForm.stopId}
                  onChange={(stopId, stopName) => setBusForm((f) => ({ ...f, stopId, stopName }))}
                  language={language}
                />
              </div>

              <Button
                className="w-full h-8 gap-2"
                style={{ fontSize: fsSmall }}
                onClick={handleAddBus}
                disabled={!busForm.route.trim() || !busForm.stopId}
                data-testid="button-settings-add-bus"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.addRoute}
              </Button>
            </div>
          </div>

          <Separator />

          {/* MTR Stations */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Train className="h-4 w-4" style={{ color: "hsl(var(--accent))" }} />
              <h3 className="font-semibold" style={{ fontSize: fs }}>{t.mtrStations}</h3>
            </div>

            <div className="space-y-2 mb-4">
              {mtrPresets.map((p) => {
                const lineData = MTR_LINES.find((l) => l.code === p.line);
                const sta = lineData?.stations.find((s) => s.code === p.station);
                const lineName = lineData ? (language === "zh" ? lineData.name_zh : lineData.name_en) : p.line;
                const staName = sta ? (language === "zh" ? sta.name_zh : sta.name_en) : p.station;
                return (
                  <div key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded border"
                    style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--secondary))" }}
                    data-testid={`settings-mtr-${p.id}`}
                  >
                    <div>
                      <span className="font-mono font-bold" style={{ fontSize: fs }}>{p.line}</span>
                      <span className="ml-2" style={{ color: "hsl(var(--muted-foreground))", fontSize: fsSmall }}>
                        {lineName} · {staName}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0"
                      onClick={() => onRemoveMtr(p.id)} data-testid={`button-settings-remove-mtr-${p.id}`}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg p-4 border space-y-3" style={{ borderColor: "hsl(var(--border))" }}>
              <p className="font-medium" style={{ color: "hsl(var(--muted-foreground))", fontSize: fsSmall }}>
                {t.addStation}
              </p>

              <div>
                <Label className="mb-1 block" style={{ fontSize: fsSmall }}>{t.stationLine}</Label>
                <Select value={mtrForm.line}
                  onValueChange={(v) => setMtrForm({ line: v, station: "" })}>
                  <SelectTrigger className="h-8" style={{ fontSize: fsSmall }} data-testid="select-mtr-line">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MTR_LINES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {language === "zh" ? (
                          <><span className="mr-1">{l.name_zh}</span><span className="font-mono opacity-60">{l.code}</span></>
                        ) : (
                          <><span className="font-mono font-bold mr-2">{l.code}</span>{l.name_en}</>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1 block" style={{ fontSize: fsSmall }}>{t.stationCode}</Label>
                <Select value={mtrForm.station}
                  onValueChange={(v) => setMtrForm((f) => ({ ...f, station: v }))}>
                  <SelectTrigger className="h-8" style={{ fontSize: fsSmall }} data-testid="select-mtr-station">
                    <SelectValue placeholder={t.selectStation} />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedMtrLine?.stations || []).map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {language === "zh" ? (
                          <><span className="mr-1">{s.name_zh}</span><span className="font-mono opacity-60">{s.code}</span></>
                        ) : (
                          <><span className="font-mono font-bold mr-2">{s.code}</span>{s.name_en}</>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full h-8 gap-2"
                style={{ fontSize: fsSmall }}
                onClick={handleAddMtr}
                disabled={!mtrForm.station}
                data-testid="button-settings-add-mtr"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.addStation}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
