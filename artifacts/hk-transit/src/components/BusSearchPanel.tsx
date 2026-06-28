import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EtaChip } from "@/components/EtaChip";
import { useApp } from "@/contexts/AppContext";
import { Search, RefreshCw, ChevronRight, Loader2, ArrowRight } from "lucide-react";

type Company = "KMB" | "CTB";

interface RouteResult {
  operator: Company;
  route: string;
  direction: string;
  orig: string;
  dest: string;
  stops: { stop: string; seq: number }[];
}

interface StopInfo {
  name_en: string;
  name_tc: string;
}

interface EtaEntry {
  eta: string | null;
  rmk_en: string;
  rmk_tc: string;
  dest_en: string;
  dest_tc: string;
}

function cleanName(n: string) {
  return (n || "").replace(/\s*\([A-Z]{2,}\d*\)\s*$/g, "").trim();
}

async function fetchKmbRouteInfo(route: string) {
  try {
    const r = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route/${route}/outbound/1`);
    const d = await r.json();
    return { orig: d.data?.orig_tc || d.data?.orig_en || "", dest: d.data?.dest_tc || d.data?.dest_en || "" };
  } catch { return { orig: "", dest: "" }; }
}

async function fetchCtbRouteInfo(route: string) {
  try {
    const r = await fetch(`https://rt.data.gov.hk/v2/transport/citybus/route/CTB/${route}`);
    const d = await r.json();
    return { orig: d.data?.orig_tc || d.data?.orig_en || "", dest: d.data?.dest_tc || d.data?.dest_en || "" };
  } catch { return { orig: "", dest: "" }; }
}

async function fetchStopName(stopId: string, operator: Company): Promise<StopInfo> {
  try {
    if (operator === "KMB") {
      const r = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop/${stopId}`);
      const d = await r.json();
      return { name_en: cleanName(d.data?.name_en || stopId), name_tc: cleanName(d.data?.name_tc || stopId) };
    } else {
      const r = await fetch(`https://rt.data.gov.hk/v2/transport/citybus/stop/${stopId}`);
      const d = await r.json();
      return { name_en: cleanName(d.data?.name_en || stopId), name_tc: cleanName(d.data?.name_tc || stopId) };
    }
  } catch { return { name_en: stopId, name_tc: stopId }; }
}

async function fetchEtas(stopId: string, operator: Company, route: string): Promise<EtaEntry[]> {
  if (operator === "KMB") {
    const r = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopId}/${route}/1`);
    const d = await r.json();
    return (d.data || []).slice(0, 5);
  } else {
    const r = await fetch(`https://rt.data.gov.hk/v2/transport/citybus/eta/CTB/${stopId}/${route}`);
    const d = await r.json();
    return (d.data || []).slice(0, 5);
  }
}

interface SelectedStop {
  stopId: string;
  operator: Company;
  route: string;
  direction: string;
  name_en: string;
  name_tc: string;
  etas: EtaEntry[];
  loading: boolean;
  error: boolean;
  updatedAt: string;
}

export function BusSearchPanel() {
  const { language, t } = useApp();
  const [input, setInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<RouteResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [stopNames, setStopNames] = useState<Record<string, StopInfo>>({});
  const [loadingNames, setLoadingNames] = useState(false);
  const [selectedStop, setSelectedStop] = useState<SelectedStop | null>(null);
  const [notFound, setNotFound] = useState(false);
  const etaPanelRef = useRef<HTMLDivElement>(null);

  const isZh = language === "zh";

  async function handleSearch() {
    const q = input.trim().toUpperCase();
    if (!q) return;
    setSearching(true);
    setResults([]);
    setStopNames({});
    setSelectedStop(null);
    setNotFound(false);
    setActiveIdx(0);

    const [kmbInfo, ctbInfo, kmbOut, kmbIn, ctbOut, ctbIn] = await Promise.allSettled([
      fetchKmbRouteInfo(q),
      fetchCtbRouteInfo(q),
      fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${q}/outbound/1`).then(r => r.json()),
      fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${q}/inbound/1`).then(r => r.json()),
      fetch(`https://rt.data.gov.hk/v2/transport/citybus/route-stop/CTB/${q}/outbound`).then(r => r.json()),
      fetch(`https://rt.data.gov.hk/v2/transport/citybus/route-stop/CTB/${q}/inbound`).then(r => r.json()),
    ]);

    const kmbRoute = kmbInfo.status === "fulfilled" ? kmbInfo.value : { orig: "", dest: "" };
    const ctbRoute = ctbInfo.status === "fulfilled" ? ctbInfo.value : { orig: "", dest: "" };

    const found: RouteResult[] = [];
    if (kmbOut.status === "fulfilled" && (kmbOut.value.data || []).length)
      found.push({ operator: "KMB", route: q, direction: "outbound", orig: kmbRoute.orig, dest: kmbRoute.dest, stops: kmbOut.value.data });
    if (kmbIn.status === "fulfilled" && (kmbIn.value.data || []).length)
      found.push({ operator: "KMB", route: q, direction: "inbound", orig: kmbRoute.dest, dest: kmbRoute.orig, stops: kmbIn.value.data });
    if (ctbOut.status === "fulfilled" && (ctbOut.value.data || []).length)
      found.push({ operator: "CTB", route: q, direction: "outbound", orig: ctbRoute.orig, dest: ctbRoute.dest, stops: ctbOut.value.data });
    if (ctbIn.status === "fulfilled" && (ctbIn.value.data || []).length)
      found.push({ operator: "CTB", route: q, direction: "inbound", orig: ctbRoute.dest, dest: ctbRoute.orig, stops: ctbIn.value.data });

    setSearching(false);

    if (!found.length) { setNotFound(true); return; }
    setResults(found);
    loadStopNames(found[0], {});
  }

  async function loadStopNames(result: RouteResult, existing: Record<string, StopInfo>) {
    setLoadingNames(true);
    const stops = result.stops;
    const batches: typeof stops[] = [];
    for (let i = 0; i < stops.length; i += 6) batches.push(stops.slice(i, i + 6));

    let current = { ...existing };
    for (const batch of batches) {
      const entries = await Promise.all(
        batch.map(async s => {
          if (current[s.stop]) return [s.stop, current[s.stop]] as [string, StopInfo];
          const info = await fetchStopName(s.stop, result.operator);
          return [s.stop, info] as [string, StopInfo];
        })
      );
      current = { ...current, ...Object.fromEntries(entries) };
      setStopNames({ ...current });
    }
    setLoadingNames(false);
  }

  async function selectDirection(idx: number) {
    setActiveIdx(idx);
    setSelectedStop(null);
    setStopNames({});
    loadStopNames(results[idx], {});
  }

  async function selectStop(stopId: string, operator: Company, route: string, direction: string, nameInfo: StopInfo) {
    const now = new Date().toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Hong_Kong" });
    setSelectedStop({ stopId, operator, route, direction, name_en: nameInfo.name_en, name_tc: nameInfo.name_tc, etas: [], loading: true, error: false, updatedAt: now });
    setTimeout(() => etaPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    try {
      const etas = await fetchEtas(stopId, operator, route);
      const updatedAt = new Date().toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Hong_Kong" });
      setSelectedStop(prev => prev ? { ...prev, etas, loading: false, error: false, updatedAt } : null);
    } catch {
      setSelectedStop(prev => prev ? { ...prev, loading: false, error: true } : null);
    }
  }

  async function refreshSelectedStop() {
    if (!selectedStop) return;
    const now = new Date().toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Hong_Kong" });
    setSelectedStop(prev => prev ? { ...prev, loading: true, updatedAt: now } : null);
    try {
      const etas = await fetchEtas(selectedStop.stopId, selectedStop.operator, selectedStop.route);
      const updatedAt = new Date().toLocaleTimeString("zh-HK", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Hong_Kong" });
      setSelectedStop(prev => prev ? { ...prev, etas, loading: false, error: false, updatedAt } : null);
    } catch {
      setSelectedStop(prev => prev ? { ...prev, loading: false, error: true } : null);
    }
  }

  const activeResult = results[activeIdx];

  return (
    <div className="flex flex-col min-h-0" style={{ borderTop: "1px solid hsl(var(--border))" }}>
      {/* Search header */}
      <div className="px-4 py-3 flex gap-2" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder={isZh ? "搜尋路線號碼（例如 962X）" : "Search route (e.g. 962X)"}
          className="h-8 font-mono flex-1"
          style={{ fontSize: "calc(var(--base-font-size) * 0.9)" }}
          data-testid="input-bus-search"
        />
        <Button
          className="h-8 px-3 gap-1.5 shrink-0"
          onClick={handleSearch}
          disabled={searching || !input.trim()}
          style={{ fontSize: "calc(var(--base-font-size) * 0.85)" }}
          data-testid="button-bus-search"
        >
          {searching
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <Search className="h-3.5 w-3.5" />
          }
          {isZh ? "搜尋" : "Search"}
        </Button>
      </div>

      {/* Results area */}
      {(searching || results.length > 0 || notFound) && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {searching && (
            <div className="flex items-center gap-3 py-4" style={{ color: "hsl(var(--muted-foreground))" }}>
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              <span style={{ fontSize: "calc(var(--base-font-size) * 0.9)" }}>
                {isZh ? `搜尋路線 ${input.trim().toUpperCase()} 中…` : `Searching route ${input.trim().toUpperCase()}…`}
              </span>
            </div>
          )}

          {notFound && (
            <div className="text-center py-8" style={{ color: "hsl(var(--muted-foreground))" }}>
              <div className="text-3xl mb-3">🚌</div>
              <div className="font-semibold mb-1" style={{ fontSize: "var(--base-font-size)" }}>
                {isZh ? `找不到路線 ${input}` : `Route ${input} not found`}
              </div>
              <div style={{ fontSize: "calc(var(--base-font-size) * 0.85)" }}>
                {isZh ? "請確認路線號碼是否正確" : "Please check the route number"}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <>
              {/* Direction tabs */}
              <div className="flex gap-2 flex-wrap">
                {results.map((r, i) => {
                  const active = i === activeIdx;
                  const isKmb = r.operator === "KMB";
                  const color = isKmb ? "hsl(var(--primary))" : "hsl(38 92% 50%)";
                  const orig = r.orig || (isZh ? "起點" : "Origin");
                  const dest = r.dest || (isZh ? "終點" : "Dest");
                  return (
                    <button
                      key={i}
                      onClick={() => selectDirection(i)}
                      className="flex-1 min-w-0 flex flex-col items-center gap-1 rounded-lg border transition-all"
                      style={{
                        padding: "10px 12px",
                        background: active ? color : "hsl(var(--secondary))",
                        borderColor: active ? color : "hsl(var(--border))",
                        color: active ? "white" : "hsl(var(--foreground))",
                        cursor: "pointer",
                      }}
                      data-testid={`button-bus-dir-${i}`}
                    >
                      <div style={{ fontSize: "10px", opacity: active ? 0.85 : 0.6 }}>
                        {r.operator} · {r.stops.length}{isZh ? "站" : " stops"}
                      </div>
                      <div
                        className="font-bold w-full truncate text-center"
                        style={{ fontSize: "12px" }}
                      >
                        {orig} → {dest}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Stop list */}
              {activeResult && (
                <div className="space-y-1">
                  {/* Route info strip */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2"
                    style={{ background: "hsl(var(--secondary))", fontSize: "12px" }}
                  >
                    <span
                      className="px-1.5 py-0.5 rounded font-bold"
                      style={{
                        background: activeResult.operator === "KMB" ? "hsl(var(--primary) / 0.2)" : "rgba(234,179,8,.2)",
                        color: activeResult.operator === "KMB" ? "hsl(var(--primary))" : "#fbbf24",
                        fontSize: "10px",
                      }}
                    >
                      {activeResult.operator} {activeResult.route}
                    </span>
                    <span style={{ color: "hsl(var(--muted-foreground))" }}>
                      {activeResult.orig || "—"} → {activeResult.dest || "—"}
                    </span>
                    <span style={{ color: "hsl(var(--muted-foreground))", marginLeft: "auto" }}>
                      {activeResult.stops.length}{isZh ? "站" : " stops"}
                    </span>
                  </div>

                  {/* Progress bar while loading names */}
                  {loadingNames && (
                    <div
                      className="h-0.5 rounded-full mb-2 overflow-hidden"
                      style={{ background: "hsl(var(--border))" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: "hsl(var(--primary))",
                          width: `${Math.round(Object.keys(stopNames).length / activeResult.stops.length * 100)}%`,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  )}

                  {/* Stop buttons */}
                  {activeResult.stops.map((s, i) => {
                    const info = stopNames[s.stop];
                    const name = info ? (isZh ? info.name_tc : info.name_en) : null;
                    const isSelected = selectedStop?.stopId === s.stop && selectedStop?.operator === activeResult.operator;
                    return (
                      <button
                        key={s.stop}
                        disabled={!name}
                        onClick={() => name && selectStop(s.stop, activeResult.operator, activeResult.route, activeResult.direction, stopNames[s.stop])}
                        className="flex items-center gap-3 w-full rounded-lg border text-left transition-all"
                        style={{
                          padding: "10px 14px",
                          background: isSelected ? "hsl(var(--primary) / 0.1)" : "hsl(var(--secondary))",
                          borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border))",
                          opacity: !name ? 0.4 : 1,
                          cursor: !name ? "default" : "pointer",
                        }}
                        data-testid={`button-bus-stop-${i}`}
                      >
                        <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px", minWidth: 22, flexShrink: 0 }}>
                          {i + 1}
                        </span>
                        <span
                          className="flex-1 font-semibold"
                          style={{ color: "hsl(var(--foreground))", fontSize: "calc(var(--base-font-size) * 0.9)" }}
                        >
                          {name || "…"}
                        </span>
                        {name && <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(var(--primary))" }} />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ETA panel for selected stop */}
              {selectedStop && (
                <div
                  ref={etaPanelRef}
                  className="rounded-lg border"
                  style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  data-testid="panel-bus-eta"
                >
                  <div
                    className="flex items-start justify-between gap-3 px-4 py-3 border-b"
                    style={{ borderColor: "hsl(var(--border))" }}
                  >
                    <div>
                      <div className="font-bold" style={{ fontSize: "var(--base-font-size)" }}>
                        📍 {isZh ? selectedStop.name_tc : selectedStop.name_en}
                      </div>
                      <div
                        className="flex items-center gap-2 mt-1"
                        style={{ color: "hsl(var(--muted-foreground))", fontSize: "11px" }}
                      >
                        <span
                          className="px-1.5 py-0.5 rounded font-bold"
                          style={{
                            background: selectedStop.operator === "KMB" ? "hsl(var(--primary) / 0.2)" : "rgba(234,179,8,.2)",
                            color: selectedStop.operator === "KMB" ? "hsl(var(--primary))" : "#fbbf24",
                            fontSize: "10px",
                          }}
                        >
                          {selectedStop.operator}
                        </span>
                        {selectedStop.route} ·{" "}
                        {isZh
                          ? (selectedStop.direction === "outbound" ? "往終點方向" : "往起點方向")
                          : (selectedStop.direction === "outbound" ? "Outbound" : "Inbound")}
                        {" "}· {isZh ? "更新" : "Updated"} {selectedStop.updatedAt}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 px-3 gap-1 shrink-0"
                      onClick={refreshSelectedStop}
                      disabled={selectedStop.loading}
                      style={{ fontSize: "12px" }}
                      data-testid="button-bus-eta-refresh"
                    >
                      <RefreshCw className={`h-3 w-3 ${selectedStop.loading ? "animate-spin" : ""}`} />
                      {isZh ? "更新" : "Refresh"}
                    </Button>
                  </div>

                  <div className="px-4 py-3 space-y-2">
                    {selectedStop.loading ? (
                      <div className="flex items-center gap-3 py-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span style={{ fontSize: "calc(var(--base-font-size) * 0.9)" }}>
                          {isZh ? "查詢到站時間中…" : "Fetching ETAs…"}
                        </span>
                      </div>
                    ) : selectedStop.error ? (
                      <div style={{ color: "hsl(0 84% 60%)", fontSize: "calc(var(--base-font-size) * 0.85)" }}>
                        {isZh ? "載入失敗" : "Failed to load"}
                      </div>
                    ) : !selectedStop.etas.length ? (
                      <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.85)" }}>
                        {isZh ? "目前暫無班次資料" : t.noService}
                      </div>
                    ) : (
                      selectedStop.etas.map((e, i) => {
                        const dest = isZh ? (e.dest_tc || e.dest_en) : e.dest_en;
                        const isScheduled = e.rmk_tc?.includes("預定") || e.rmk_en?.includes("Scheduled");
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg px-3 py-2.5"
                            style={{ background: "hsl(var(--secondary))" }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="font-semibold shrink-0"
                                style={{ fontSize: "13px", minWidth: 36 }}
                              >
                                {isZh ? `第 ${i + 1} 班` : `#${i + 1}`}
                              </span>
                              {dest && (
                                <span className="flex items-center gap-1 truncate" style={{ color: "hsl(var(--muted-foreground))", fontSize: "12px" }}>
                                  <ArrowRight className="h-3 w-3 shrink-0" />
                                  {dest}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <EtaChip etaStr={e.eta} remark={isZh ? (e.rmk_tc || e.rmk_en) : e.rmk_en} />
                              {isScheduled && (
                                <span
                                  className="px-1.5 py-0.5 rounded"
                                  style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", fontSize: "9px" }}
                                >
                                  {isZh ? "預定" : "Sched"}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
