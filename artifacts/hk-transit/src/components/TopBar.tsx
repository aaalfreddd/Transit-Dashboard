import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import { Droplets, Settings, AArrowUp, AArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/contexts/AppContext";

function formatDate(date: Date, language: string): string {
  return date.toLocaleDateString(language === "zh" ? "zh-HK" : "en-HK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Hong_Kong",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-HK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Hong_Kong",
  });
}

interface TopBarProps {
  onSettingsOpen: () => void;
}

export function TopBar({ onSettingsOpen }: TopBarProps) {
  const [now, setNow] = useState(new Date());
  const { data: weather, isLoading: weatherLoading } = useWeather();
  const { t, language, setLanguage, fontSize, increaseFontSize, decreaseFontSize } = useApp();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-6 py-3 border-b shrink-0"
      style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
      data-testid="top-bar"
    >
      <div className="flex items-center gap-6">
        <div>
          <div
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: "hsl(var(--muted-foreground))" }}
            data-testid="text-date"
          >
            {formatDate(now, language)}
          </div>
          <div
            className="font-mono font-bold tracking-tight leading-none mt-0.5"
            style={{ color: "hsl(var(--foreground))", fontSize: `calc(var(--base-font-size) * 2)` }}
            data-testid="text-clock"
          >
            {formatTime(now)}
          </div>
        </div>

        <div className="h-10 w-px" style={{ background: "hsl(var(--border))" }} />

        <div className="flex items-center gap-4" data-testid="weather-section">
          {weatherLoading ? (
            <div className="flex gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ) : weather ? (
            <>
              {weather.iconCode && (
                <img
                  src={`https://www.hko.gov.hk/images/HKOWxIconOutline/pic${weather.iconCode}.png`}
                  alt={t.weatherDesc[weather.iconCode] || ""}
                  className="h-9 w-9 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  data-testid="img-weather-icon"
                />
              )}
              <div>
                <div
                  className="font-bold"
                  style={{ color: "hsl(var(--foreground))", fontSize: "calc(var(--base-font-size) * 1.4)" }}
                  data-testid="text-temperature"
                >
                  {weather.temperature}°C
                </div>
                <div
                  style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.85)" }}
                  data-testid="text-weather-desc"
                >
                  {t.weatherDesc[weather.iconCode] || ""}
                </div>
              </div>
              <div className="flex items-center gap-1" data-testid="text-humidity">
                <Droplets className="h-3.5 w-3.5" style={{ color: "hsl(var(--accent))" }} />
                <span style={{ color: "hsl(var(--muted-foreground))", fontSize: "calc(var(--base-font-size) * 0.9)" }}>
                  {weather.humidity}%
                </span>
              </div>
            </>
          ) : (
            <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "var(--base-font-size)" }}>
              {t.weatherUnavailable}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded"
          style={{
            background: "hsl(var(--secondary))",
            color: "hsl(var(--muted-foreground))",
            fontSize: "calc(var(--base-font-size) * 0.8)",
          }}
        >
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: "hsl(120 60% 50%)" }} />
          {t.live}
        </div>

        <div
          className="h-6 w-px mx-1"
          style={{ background: "hsl(var(--border))" }}
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={decreaseFontSize}
          disabled={fontSize <= 12}
          title="Decrease font size"
          data-testid="button-font-decrease"
        >
          <AArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={increaseFontSize}
          disabled={fontSize >= 20}
          title="Increase font size"
          data-testid="button-font-increase"
        >
          <AArrowUp className="h-4 w-4" />
        </Button>

        <div
          className="h-6 w-px mx-1"
          style={{ background: "hsl(var(--border))" }}
        />

        <div
          className="flex rounded overflow-hidden border"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          <button
            onClick={() => setLanguage("en")}
            className="px-2.5 py-1 text-xs font-medium transition-colors"
            style={{
              background: language === "en" ? "hsl(var(--primary))" : "hsl(var(--secondary))",
              color: language === "en" ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
            }}
            data-testid="button-lang-en"
          >
            EN
          </button>
          <button
            onClick={() => setLanguage("zh")}
            className="px-2.5 py-1 text-xs font-medium transition-colors"
            style={{
              background: language === "zh" ? "hsl(var(--primary))" : "hsl(var(--secondary))",
              color: language === "zh" ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
            }}
            data-testid="button-lang-zh"
          >
            中文
          </button>
        </div>

        <div
          className="h-6 w-px mx-1"
          style={{ background: "hsl(var(--border))" }}
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onSettingsOpen}
          data-testid="button-settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
