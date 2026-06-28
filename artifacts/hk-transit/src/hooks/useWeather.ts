import { useQuery } from '@tanstack/react-query';

export interface WeatherData {
  temperature: number;
  humidity: number;
  iconCode: number;
}

const fetchWeather = async (): Promise<WeatherData> => {
  const res = await fetch('https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en');
  if (!res.ok) throw new Error('Failed to fetch weather');
  const data = await res.json();
  
  return {
    temperature: data.temperature?.data?.[0]?.value || 0,
    humidity: data.humidity?.data?.[0]?.value || 0,
    iconCode: data.icon?.[0] || 50
  };
};

export function useWeather() {
  return useQuery({
    queryKey: ['hk_weather'],
    queryFn: fetchWeather,
    refetchInterval: 60000 * 5, // 5 minutes
    staleTime: 60000 * 4,
  });
}
