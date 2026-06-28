import { useApp } from "@/contexts/AppContext";

interface EtaChipProps {
  etaStr: string | null;
  remark?: string;
  size?: "sm" | "md";
}

export function EtaChip({ etaStr, remark, size = "md" }: EtaChipProps) {
  const { language } = useApp();
  const isSm = size === "sm";

  if (!etaStr) {
    const txt = remark || "—";
    return (
      <span style={{ color: "hsl(var(--muted-foreground))", fontSize: isSm ? "10px" : "11px" }}>
        {txt}
      </span>
    );
  }

  let diff: number;
  let timeStr: string;
  try {
    const d = new Date(etaStr);
    diff = Math.round((d.getTime() - Date.now()) / 60000);
    timeStr = d.toLocaleTimeString("zh-HK", {
      hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Hong_Kong",
    });
  } catch {
    return <span style={{ color: "hsl(var(--muted-foreground))" }}>—</span>;
  }

  const nowLabel = language === "zh" ? "即將抵達" : "Due";
  const minLabel = language === "zh" ? "分" : "m";

  if (diff <= 0) {
    return (
      <div style={{
        display: "inline-flex", alignItems: "baseline", gap: 2,
        borderRadius: 8, padding: isSm ? "3px 8px" : "4px 10px",
        background: "rgba(239,68,68,.15)", color: "#f87171",
        fontSize: isSm ? "11px" : "12px", fontWeight: 700,
      }}>
        {nowLabel}
      </div>
    );
  }

  if (diff <= 3) {
    return (
      <div style={{
        display: "inline-flex", alignItems: "baseline", gap: 2,
        borderRadius: 8, padding: isSm ? "3px 8px" : "4px 10px",
        background: "rgba(234,179,8,.15)", color: "#fbbf24", fontWeight: 700,
      }}>
        <span style={{ fontSize: isSm ? "16px" : "18px", lineHeight: 1, fontFamily: "var(--app-font-mono)" }}>
          {diff}
        </span>
        <span style={{ fontSize: "10px", opacity: 0.8, marginLeft: 1 }}>{minLabel}</span>
        <span style={{ fontSize: "11px", opacity: 0.7, marginLeft: 6, fontFamily: "var(--app-font-mono)" }}>
          {timeStr}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: "inline-flex", alignItems: "baseline", gap: 2,
      borderRadius: 8, padding: isSm ? "3px 8px" : "4px 10px",
      background: "rgba(34,197,94,.12)", color: "#4ade80", fontWeight: 700,
    }}>
      <span style={{ fontSize: isSm ? "16px" : "18px", lineHeight: 1, fontFamily: "var(--app-font-mono)" }}>
        {diff}
      </span>
      <span style={{ fontSize: "10px", opacity: 0.8, marginLeft: 1 }}>{minLabel}</span>
      <span style={{ fontSize: "11px", opacity: 0.7, marginLeft: 6, fontFamily: "var(--app-font-mono)" }}>
        {timeStr}
      </span>
    </div>
  );
}
