import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import { Droplets, Thermometer, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const WEATHER_ICON_DESCRIPTIONS: Record<number, string> = {
  50: "Fine", 51: "Fine", 52: "Fine", 53: "Fine", 54: "Fine",
  60: "Cloudy", 61: "Overcast", 62: "Light Rain", 63: "Rain", 64: "Heavy Rain",
  65: "Thunderstorms", 70: "Fine", 71: "Fine", 72: "Fine", 73: "Fine", 74: "Fine",
  75: "Fine", 76: "Foggy", 77: "Sunny", 80: "Windy", 81: "Dry",
  82: "Humid", 83: "Hot", 84: "Cold", 85: "Warm", 90: "Hot", 91: "Warm", 92: "Cool", 93: "Cold",
};

function getWeatherDescription(iconCode: number): string {
  return WEATHER_ICON_DESCRIPTIONS[iconCode] || "Partly Cloudy";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-HK", {
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

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-6 py-3 border-b"
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
            {formatDate(now)}
          </div>
          <div
            className="text-3xl font-mono font-bold tracking-tight leading-none mt-0.5"
            style={{ color: "hsl(var(--foreground))", letterSpacing: "0.05em" }}
            data-testid="text-clock"
          >
            {formatTime(now)}
          </div>
        </div>

        <div
          className="h-10 w-px"
          style={{ background: "hsl(var(--border))" }}
        />

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
                  alt={getWeatherDescription(weather.iconCode)}
                  className="h-9 w-9 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  data-testid="img-weather-icon"
                />
              )}
              <div>
                <div
                  className="text-xl font-bold"
                  style={{ color: "hsl(var(--foreground))" }}
                  data-testid="text-temperature"
                >
                  {weather.temperature}°C
                </div>
                <div
                  className="text-xs"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                  data-testid="text-weather-desc"
                >
                  {getWeatherDescription(weather.iconCode)}
                </div>
              </div>
              <div className="flex items-center gap-1" data-testid="text-humidity">
                <Droplets className="h-3.5 w-3.5" style={{ color: "hsl(var(--accent))" }} />
                <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {weather.humidity}%
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Weather unavailable
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded"
          style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
        >
          <div
            className="h-1.5 w-1.5 rounded-full animate-pulse"
            style={{ background: "hsl(120 60% 50%)" }}
          />
          Live
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsOpen}
          className="h-8 w-8"
          data-testid="button-settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
