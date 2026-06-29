const DEFAULT_BG = "#12141d";

export function getDefaultBg(): string {
  return DEFAULT_BG;
}

export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function luminance(hex: string): number {
  const toLin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = toLin(parseInt(hex.slice(1, 3), 16));
  const g = toLin(parseInt(hex.slice(3, 5), 16));
  const b = toLin(parseInt(hex.slice(5, 7), 16));
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

export function applyThemeColor(hex: string) {
  const [h, s, l] = hexToHsl(hex);
  const isDark = l < 50;
  const root = document.documentElement;

  const fgL = isDark ? 95 : 8;
  const mutedL = isDark ? 52 : 48;
  const cardL = isDark ? Math.min(l + 3, 20) : Math.max(l - 3, 96);
  const borderL = isDark ? Math.min(l + 9, 28) : Math.max(l - 9, 90);
  const secondaryL = isDark ? Math.min(l + 9, 28) : Math.max(l - 9, 90);

  const set = (name: string, value: string) => root.style.setProperty(name, value);

  set("--background", `${h} ${s}% ${l}%`);
  set("--foreground", `${h} ${Math.max(s * 0.3, 5)}% ${fgL}%`);
  set("--card", `${h} ${s}% ${cardL}%`);
  set("--card-foreground", `${h} ${Math.max(s * 0.3, 5)}% ${fgL}%`);
  set("--card-border", `${h} ${Math.max(s * 0.7, 5)}% ${borderL}%`);
  set("--border", `${h} ${Math.max(s * 0.7, 5)}% ${borderL}%`);
  set("--secondary", `${h} ${Math.max(s * 0.7, 5)}% ${secondaryL}%`);
  set("--secondary-foreground", `${h} ${Math.max(s * 0.3, 5)}% ${fgL}%`);
  set("--muted", `${h} ${Math.max(s * 0.7, 5)}% ${secondaryL}%`);
  set("--muted-foreground", `${h} ${Math.max(s * 0.5, 5)}% ${mutedL}%`);
  set("--popover", `${h} ${s}% ${cardL}%`);
  set("--popover-foreground", `${h} ${Math.max(s * 0.3, 5)}% ${fgL}%`);
  set("--input", `${h} ${Math.max(s * 0.7, 5)}% ${borderL}%`);

  set("--sidebar", `${h} ${s}% ${cardL}%`);
  set("--sidebar-foreground", `${h} ${Math.max(s * 0.3, 5)}% ${fgL}%`);
  set("--sidebar-border", `${h} ${Math.max(s * 0.7, 5)}% ${borderL}%`);
}

export function resetTheme() {
  const root = document.documentElement;
  const vars = [
    "--background",
    "--foreground",
    "--card",
    "--card-foreground",
    "--card-border",
    "--border",
    "--secondary",
    "--secondary-foreground",
    "--muted",
    "--muted-foreground",
    "--popover",
    "--popover-foreground",
    "--input",
    "--sidebar",
    "--sidebar-foreground",
    "--sidebar-border",
  ];
  vars.forEach((v) => root.style.removeProperty(v));
}
