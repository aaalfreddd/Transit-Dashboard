import { useApp } from "@/contexts/AppContext";
import { luminance } from "@/lib/theme";

interface EtaChipProps {
  etaStr: string | null;
  remark?: string;
  size?: "sm" | "md";
}

function etaColors(bgHex: string, diff: number) {
  const lum = luminance(bgHex);
  const isLight = lum > 0.5;
  if (diff <= 0) {
    return isLight
      ? { bg: "rgba(185,28,28,.12)", text: "#b91c1c" }
      : { bg: "rgba(239,68,68,.15)", text: "#f87171" };
  }
  if (diff <= 3) {
    return isLight
      ? { bg: "rgba(180,83,9,.12)", text: "#b45309" }
      : { bg: "rgba(234,179,8,.15)", text: "#fbbf24" };
  }
  return isLight
    ? { bg: "rgba(21,128,61,.12)", text: "#15803d" }
    : { bg: "rgba(34,197,94,.12)", text: "#4ade80" };
}

export function EtaChip({ etaStr, remark, size = "md" }: EtaChipProps) {
  const { language, bgColor } = useApp();
  const isSm = size === "sm";

  if (!etaStr) {
    const txt = remark || "\u2014";
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
    return <span style={{ color: "hsl(var(--muted-foreground))" }}>\u2014</span>;
  }

  const nowLabel = language === "zh" ? "\u5373\u5c07\u62b5\u9054" : "Due";
  const minLabel = language === "zh" ? "\u5206" : "m";

  if (diff <= 0) {
    const c = etaColors(bgColor, diff);
    return (
      <div style={{
        display: "inline-flex", alignItems: "baseline", gap: 2,
        borderRadius: 8, padding: isSm ? "3px 8px" : "4px 10px",
        background: c.bg, color: c.text,
        fontSize: isSm ? "11px" : "12px", fontWeight: 700,
      }}>
        {nowLabel}
      </div>
    );
  }

  if (diff <= 3) {
    const c = etaColors(bgColor, diff);
    return (
      <div style={{
        display: "inline-flex", alignItems: "baseline", gap: 2,
        borderRadius: 8, padding: isSm ? "3px 8px" : "4px 10px",
        background: c.bg, color: c.text, fontWeight: 700,
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

  const c = etaColors(bgColor, diff);
  return (
    <div style={{
      display: "inline-flex", alignItems: "baseline", gap: 2,
      borderRadius: 8, padding: isSm ? "3px 8px" : "4px 10px",
      background: c.bg, color: c.text, fontWeight: 700,
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
