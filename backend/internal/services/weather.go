package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/torp/conect2-backend/internal/models"
)

const (
	openMeteoURL     = "https://api.open-meteo.com/v1/forecast?latitude=-21.7617&longitude=-43.3388&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo&forecast_days=5"
	climatempoBase   = "http://apiadvisor.climatempo.com.br"
	defaultLocaleID  = "152"
)

// WeatherService encapsula as chamadas às APIs de clima
type WeatherService struct {
	climatempoToken  string
	climatempoLocale string
	httpClient       *http.Client
}

// NewWeatherService cria um novo serviço de clima
func NewWeatherService(token, localeID string) *WeatherService {
	if localeID == "" {
		localeID = defaultLocaleID
	}
	return &WeatherService{
		climatempoToken:  token,
		climatempoLocale: localeID,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GetWeather retorna a previsão do tempo — tenta Climatempo primeiro, depois Open-Meteo
func (s *WeatherService) GetWeather() (*models.WeatherResponse, error) {
	if s.climatempoToken != "" {
		if result, err := s.fetchClimatempo(); err == nil {
			return result, nil
		}
	}
	return s.fetchOpenMeteo()
}

// -----------------------------------------------------------------------
// Climatempo
// -----------------------------------------------------------------------

type climatempoCurrentData struct {
	Temperature  *float64 `json:"temperature"`
	Temp         *float64 `json:"temp"`
	Humidity     *float64 `json:"humidity"`
	WindVelocity *float64 `json:"wind_velocity"`
	WindSpeed    *float64 `json:"wind_speed"`
	Condition    *string  `json:"condition"`
	Summary      *string  `json:"summary"`
	Date         *string  `json:"date"`
	Time         *string  `json:"time"`
	TextIcon     *struct {
		Text interface{} `json:"text"`
	} `json:"text_icon"`
}

type climatempoForecastDay struct {
	Date        interface{} `json:"date"`
	DateBr      interface{} `json:"date_br"`
	Temperature *struct {
		Min *float64 `json:"min"`
		Max *float64 `json:"max"`
	} `json:"temperature"`
	Min         *float64    `json:"min"`
	Max         *float64    `json:"max"`
	MinTemp     *float64    `json:"minTemp"`
	MaxTemp     *float64    `json:"maxTemp"`
	Condition   *string     `json:"condition"`
	Summary     *string     `json:"summary"`
	TextIcon    *struct {
		Text interface{} `json:"text"`
	} `json:"text_icon"`
}

func (s *WeatherService) fetchClimatempo() (*models.WeatherResponse, error) {
	currentURL := fmt.Sprintf("%s/api/v1/weather/locale/%s/current?token=%s",
		climatempoBase, s.climatempoLocale, s.climatempoToken)
	forecastURL := fmt.Sprintf("%s/api/v1/forecast/locale/%s/days/15?token=%s",
		climatempoBase, s.climatempoLocale, s.climatempoToken)

	type rawResp struct {
		Data interface{} `json:"data"`
	}

	currentBody, err := s.get(currentURL)
	if err != nil {
		return nil, err
	}
	forecastBody, err := s.get(forecastURL)
	if err != nil {
		return nil, err
	}

	// Decodifica current
	var currentRaw map[string]json.RawMessage
	if err := json.Unmarshal(currentBody, &currentRaw); err != nil {
		return nil, err
	}
	currentDataRaw := currentBody
	if d, ok := currentRaw["data"]; ok {
		currentDataRaw = d
	}

	var currentData climatempoCurrentData
	if err := json.Unmarshal(currentDataRaw, &currentData); err != nil {
		return nil, err
	}

	// Decodifica forecast
	var forecastRaw map[string]json.RawMessage
	_ = json.Unmarshal(forecastBody, &forecastRaw)
	forecastDataRaw := forecastBody
	if d, ok := forecastRaw["data"]; ok {
		forecastDataRaw = d
	}

	var forecastDays []climatempoForecastDay
	if err := json.Unmarshal(forecastDataRaw, &forecastDays); err != nil {
		// tenta como array direto
		_ = json.Unmarshal(forecastBody, &forecastDays)
	}

	temp := floatOrZero(currentData.Temperature, currentData.Temp)
	humidity := floatOrZero(currentData.Humidity)
	wind := floatOrZero(currentData.WindVelocity, currentData.WindSpeed)
	summary := stringOrEmpty(currentData.Condition, currentData.Summary)
	timeStr := stringOrEmpty(currentData.Date, currentData.Time)
	if timeStr == "" {
		timeStr = time.Now().UTC().Format(time.RFC3339)
	}

	current := models.WeatherCurrent{
		Time:     timeStr,
		Temp:     temp,
		Code:     inferWmoCode(summary),
		Humidity: humidity,
		WindKmh:  wind,
	}

	days := make([]models.DayForecast, 0, 5)
	for i, d := range forecastDays {
		if i >= 5 {
			break
		}
		daySummary := ""
		if d.Condition != nil {
			daySummary = *d.Condition
		} else if d.Summary != nil {
			daySummary = *d.Summary
		}

		dateStr := fmt.Sprintf("%v", d.Date)
		minTemp := floatOrZero(d.Min, d.MinTemp)
		maxTemp := floatOrZero(d.Max, d.MaxTemp)
		if d.Temperature != nil {
			if d.Temperature.Min != nil {
				minTemp = *d.Temperature.Min
			}
			if d.Temperature.Max != nil {
				maxTemp = *d.Temperature.Max
			}
		}

		days = append(days, models.DayForecast{
			Date: normalizeDate(dateStr),
			Min:  minTemp,
			Max:  maxTemp,
			Code: inferWmoCode(daySummary),
		})
	}

	return &models.WeatherResponse{
		Source:  "climatempo",
		Current: current,
		Days:    days,
	}, nil
}

// -----------------------------------------------------------------------
// Open-Meteo (fallback gratuito)
// -----------------------------------------------------------------------

type openMeteoResponse struct {
	Current struct {
		Time               string  `json:"time"`
		Temperature2m      float64 `json:"temperature_2m"`
		RelativeHumidity2m float64 `json:"relative_humidity_2m"`
		WeatherCode        int     `json:"weather_code"`
		WindSpeed10m       float64 `json:"wind_speed_10m"`
	} `json:"current"`
	Daily struct {
		Time              []string  `json:"time"`
		WeatherCode       []int     `json:"weather_code"`
		Weathercode       []int     `json:"weathercode"`
		Temperature2mMax  []float64 `json:"temperature_2m_max"`
		Temperature2mMin  []float64 `json:"temperature_2m_min"`
	} `json:"daily"`
}

func (s *WeatherService) fetchOpenMeteo() (*models.WeatherResponse, error) {
	body, err := s.get(openMeteoURL)
	if err != nil {
		return nil, err
	}

	var data openMeteoResponse
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	dailyCodes := data.Daily.WeatherCode
	if len(dailyCodes) == 0 {
		dailyCodes = data.Daily.Weathercode
	}

	current := models.WeatherCurrent{
		Time:     data.Current.Time,
		Temp:     data.Current.Temperature2m,
		Code:     data.Current.WeatherCode,
		Humidity: data.Current.RelativeHumidity2m,
		WindKmh:  data.Current.WindSpeed10m,
	}

	days := make([]models.DayForecast, 0, 5)
	for i, dateStr := range data.Daily.Time {
		if i >= 5 {
			break
		}
		code := 0
		if i < len(dailyCodes) {
			code = dailyCodes[i]
		}
		days = append(days, models.DayForecast{
			Date: dateStr,
			Min:  safeIndex(data.Daily.Temperature2mMin, i),
			Max:  safeIndex(data.Daily.Temperature2mMax, i),
			Code: code,
		})
	}

	return &models.WeatherResponse{
		Source:  "open-meteo",
		Current: current,
		Days:    days,
	}, nil
}

// -----------------------------------------------------------------------
// helpers
// -----------------------------------------------------------------------

func (s *WeatherService) get(url string) ([]byte, error) {
	resp, err := s.httpClient.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d de %s", resp.StatusCode, url)
	}
	return io.ReadAll(resp.Body)
}

func inferWmoCode(summary string) int {
	switch {
	case contains(summary, "trovo"):
		return 95
	case contains(summary, "neve"):
		return 71
	case contains(summary, "garoa"):
		return 51
	case contains(summary, "chuva"):
		return 61
	case contains(summary, "nevo"), contains(summary, "névoa"):
		return 45
	case contains(summary, "encoberto"), contains(summary, "nublado"):
		return 3
	case contains(summary, "parcial"), contains(summary, "algumas nuvens"):
		return 2
	case contains(summary, "sol"), contains(summary, "claro"):
		return 1
	default:
		return 0
	}
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(s) > 0 && stringContains(s, sub))
}

func stringContains(s, sub string) bool {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}

func normalizeDate(value string) string {
	if len(value) >= 10 {
		return value[:10]
	}
	return time.Now().Format("2006-01-02")
}

func floatOrZero(ptrs ...*float64) float64 {
	for _, p := range ptrs {
		if p != nil {
			return *p
		}
	}
	return 0
}

func stringOrEmpty(ptrs ...*string) string {
	for _, p := range ptrs {
		if p != nil {
			return *p
		}
	}
	return ""
}

func safeIndex(slice []float64, i int) float64 {
	if i < len(slice) {
		return slice[i]
	}
	return 0
}

// Evitar erro de importação não usada
var _ = bytes.NewReader
