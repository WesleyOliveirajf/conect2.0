package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/torp/conect2-backend/internal/services"
)

// WeatherHandler encapsula o handler de clima
type WeatherHandler struct {
	svc *services.WeatherService
}

// NewWeatherHandler cria um novo WeatherHandler
func NewWeatherHandler(svc *services.WeatherService) *WeatherHandler {
	return &WeatherHandler{svc: svc}
}

// GetWeather godoc
// GET /api/weather
// Retorna as condições climáticas atuais e previsão para 5 dias
func (h *WeatherHandler) GetWeather(c *gin.Context) {
	c.Header("Cache-Control", "no-store, max-age=0")

	result, err := h.svc.GetWeather()
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}
