const CLIMATEMPO_BASE_URL = "http://apiadvisor.climatempo.com.br";
const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=-21.7617&longitude=-43.3388&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America/Sao_Paulo&forecast_days=5";
const DEFAULT_LOCALE_ID = "152";

function inferWmoCode(summary: string | undefined): number {
  const text = (summary || "").toLowerCase();

  if (text.includes("trovo")) return 95;
  if (text.includes("neve")) return 71;
  if (text.includes("garoa")) return 51;
  if (text.includes("chuva")) return 61;
  if (text.includes("nevo") || text.includes("névoa")) return 45;
  if (text.includes("encoberto") || text.includes("nublado")) return 3;
  if (text.includes("parcial") || text.includes("algumas nuvens")) return 2;
  if (text.includes("sol") || text.includes("claro")) return 1;

  return 0;
}

function normalizeDate(value: unknown): string {
  if (typeof value !== "string" || !value) {
    return new Date().toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }

  return new Date().toISOString().slice(0, 10);
}

function normalizeTimestamp(value: unknown): string {
  if (typeof value === "string" && value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  return new Date().toISOString();
}

async function fetchOpenMeteoWeather() {
  const response = await fetch(OPEN_METEO_URL);

  if (!response.ok) {
    throw new Error(`Falha na Open-Meteo (${response.status})`);
  }

  const data = await response.json();
  const dailyCodes = data?.daily?.weather_code ?? data?.daily?.weathercode ?? [];

  return {
    source: "open-meteo" as const,
    current: {
      time: normalizeTimestamp(data?.current?.time),
      temp: Number(data?.current?.temperature_2m ?? 0),
      code: Number(data?.current?.weather_code ?? 0),
      humidity: Number(data?.current?.relative_humidity_2m ?? 0),
      windKmh: Number(data?.current?.wind_speed_10m ?? 0),
    },
    days: Array.isArray(data?.daily?.time)
      ? data.daily.time.slice(0, 5).map((date: string, index: number) => ({
          date: normalizeDate(date),
          min: Number(data?.daily?.temperature_2m_min?.[index] ?? 0),
          max: Number(data?.daily?.temperature_2m_max?.[index] ?? 0),
          code: Number(dailyCodes[index] ?? 0),
        }))
      : [],
  };
}

export default async function handler(_req: any, res: any) {
  const token = process.env.CLIMATEMPO_TOKEN;
  const localeId = process.env.CLIMATEMPO_LOCALE_ID || DEFAULT_LOCALE_ID;

  if (!token) {
    try {
      const payload = await fetchOpenMeteoWeather();
      return res.status(200).json(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao consultar clima";

      return res.status(502).json({
        error: message,
      });
    }
  }

  try {
    const currentUrl = `${CLIMATEMPO_BASE_URL}/api/v1/weather/locale/${localeId}/current?token=${encodeURIComponent(token)}`;
    const forecastUrl = `${CLIMATEMPO_BASE_URL}/api/v1/forecast/locale/${localeId}/days/15?token=${encodeURIComponent(token)}`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
    ]);

    if (!currentResponse.ok) {
      throw new Error(`Falha ao consultar clima atual (${currentResponse.status})`);
    }

    if (!forecastResponse.ok) {
      throw new Error(`Falha ao consultar previsão (${forecastResponse.status})`);
    }

    const currentJson = await currentResponse.json();
    const forecastJson = await forecastResponse.json();

    const currentData = currentJson?.data ?? currentJson ?? {};
    const forecastItems = Array.isArray(forecastJson?.data)
      ? forecastJson.data
      : Array.isArray(forecastJson)
        ? forecastJson
        : [];

    const currentSummary =
      currentData?.condition ||
      currentData?.summary ||
      currentData?.text_icon?.text?.pt ||
      currentData?.text_icon?.text ||
      currentData?.description ||
      "";

    const current = {
      time: normalizeTimestamp(currentData?.date || currentData?.time),
      temp: Number(currentData?.temperature ?? currentData?.temp ?? 0),
      code: inferWmoCode(currentSummary),
      humidity: Number(currentData?.humidity ?? 0),
      windKmh: Number(currentData?.wind_velocity ?? currentData?.wind_speed ?? 0),
    };

    const days = forecastItems.slice(0, 5).map((day: any) => {
      const summary =
        day?.text_icon?.text?.pt ||
        day?.text_icon?.text ||
        day?.condition ||
        day?.summary ||
        "";

      return {
        date: normalizeDate(day?.date || day?.date_br),
        min: Number(
          day?.temperature?.min ??
            day?.min ??
            day?.minTemp ??
            day?.min_temp ??
            0
        ),
        max: Number(
          day?.temperature?.max ??
            day?.max ??
            day?.maxTemp ??
            day?.max_temp ??
            0
        ),
        code: inferWmoCode(summary),
      };
    });

    return res.status(200).json({
      source: "climatempo",
      current,
      days,
    });
  } catch (error) {
    try {
      const payload = await fetchOpenMeteoWeather();
      return res.status(200).json(payload);
    } catch (fallbackError) {
      const message =
        fallbackError instanceof Error
          ? fallbackError.message
          : "Erro ao consultar clima";

      return res.status(502).json({
        error: message,
      });
    }
  }
}
