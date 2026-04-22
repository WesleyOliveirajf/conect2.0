import { useState, useEffect, useCallback } from "react";

/** Juiz de Fora, MG (centro aproximado) */
const LAT = -21.7617;
const LON = -43.3388;
const TIMEZONE = "America/Sao_Paulo";

export interface DayForecast {
  date: string;
  min: number;
  max: number;
  code: number;
}

export interface CurrentWeather {
  temp: number;
  code: number;
  humidity: number;
  windKmh: number;
  time: string;
}

export interface UseWeatherState {
  current: CurrentWeather | null;
  days: DayForecast[];
  isLoading: boolean;
  error: string | null;
  source: "climatempo" | "open-meteo";
  refetch: () => void;
}

export function useWeather(): UseWeatherState {
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [days, setDays] = useState<DayForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"climatempo" | "open-meteo">("open-meteo");
  const cacheKey = "torp_weather_cache_v1";

  const loadFromOpenMeteo = useCallback(async () => {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(LAT));
    url.searchParams.set("longitude", String(LON));
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
    );
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
    url.searchParams.set("timezone", TIMEZONE);
    url.searchParams.set("forecast_days", "5");

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Falha na API (${res.status})`);
    }
    const data = (await res.json()) as {
      current: {
        time: string;
        temperature_2m: number;
        relative_humidity_2m: number;
        weather_code: number;
        wind_speed_10m: number;
      };
      daily: {
        time: string[];
        weather_code?: number[];
        weathercode?: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
      };
    };

    if (!data.current) {
      throw new Error("Resposta inválida");
    }

    setCurrent({
      time: data.current.time,
      temp: data.current.temperature_2m,
      code: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      windKmh: data.current.wind_speed_10m,
    });

    const d = data.daily;
    const dailyCodes = d.weather_code ?? d.weathercode ?? [];
    const out: DayForecast[] = d.time.map((date, i) => ({
      date,
      min: d.temperature_2m_min[i] ?? 0,
      max: d.temperature_2m_max[i] ?? 0,
      code: dailyCodes[i] ?? 0,
    }));
    setDays(out);
    setSource("open-meteo");
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        current: {
          time: data.current.time,
          temp: data.current.temperature_2m,
          code: data.current.weather_code,
          humidity: data.current.relative_humidity_2m,
          windKmh: data.current.wind_speed_10m,
        },
        days: out,
        source: "open-meteo",
      })
    );
  }, []);

  const load = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const climatempoRes = await fetch("/api/weather");
      if (climatempoRes.ok) {
        const data = (await climatempoRes.json()) as {
          current: CurrentWeather;
          days: DayForecast[];
          source: "climatempo";
        };

        if (!data.current || !Array.isArray(data.days)) {
          throw new Error("Resposta inválida da Climatempo");
        }

        setCurrent(data.current);
        setDays(data.days);
        setSource("climatempo");
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            current: data.current,
            days: data.days,
            source: data.source,
          })
        );
        setIsLoading(false);
        return;
      }

      await loadFromOpenMeteo();
    } catch (e) {
      try {
        await loadFromOpenMeteo();
      } catch (fallbackError) {
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          try {
            const parsed = JSON.parse(cached) as {
              current: CurrentWeather;
              days: DayForecast[];
              source?: "climatempo" | "open-meteo";
            };
            setCurrent(parsed.current);
            setDays(parsed.days);
            setSource(parsed.source ?? "open-meteo");
            setError("Exibindo última previsão salva.");
            return;
          } catch {
            localStorage.removeItem(cacheKey);
          }
        }

        setError(
          fallbackError instanceof Error
            ? fallbackError.message
            : "Não foi possível carregar o tempo"
        );
        setCurrent(null);
        setDays([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadFromOpenMeteo]);

  useEffect(() => {
    load();
  }, [load]);

  return { current, days, isLoading, error, source, refetch: load };
}
