package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/torp/conect2-backend/internal/config"
	"github.com/torp/conect2-backend/internal/handlers"
	"github.com/torp/conect2-backend/internal/middleware"
	"github.com/torp/conect2-backend/internal/services"
)

func main() {
	// ---------------------------------------------------------------
	// Configuração
	// ---------------------------------------------------------------
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("❌ Erro ao carregar configuração: %v", err)
	}

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// ---------------------------------------------------------------
	// Serviços
	// ---------------------------------------------------------------
	supabaseSvc := services.NewSupabaseService(cfg.SupabaseURL, cfg.SupabaseKey)
	weatherSvc := services.NewWeatherService(cfg.ClimatempToken, cfg.ClimaLocalID)
	groqSvc := services.NewGroqService(cfg.GroqAPIKey, cfg.GroqModel)

	// ---------------------------------------------------------------
	// Handlers
	// ---------------------------------------------------------------
	weatherHandler := handlers.NewWeatherHandler(weatherSvc)
	employeeHandler := handlers.NewEmployeeHandler(supabaseSvc)
	announcementHandler := handlers.NewAnnouncementHandler(supabaseSvc)
	hrHandler := handlers.NewHrHandler(supabaseSvc)
	chatHandler := handlers.NewChatHandler(groqSvc)

	// ---------------------------------------------------------------
	// Roteador
	// ---------------------------------------------------------------
	r := gin.New()

	// Middlewares globais
	rateLimiterStore := middleware.NewRateLimiterStore(cfg.RateLimitRPS, cfg.RateLimitBurst)
	r.Use(
		middleware.Logger(),
		middleware.SecurityHeaders(),
		middleware.CORS(cfg.AllowedOrigins),
		middleware.RateLimit(rateLimiterStore),
		gin.Recovery(),
	)

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "conect2-backend",
		})
	})

	// ---------------------------------------------------------------
	// Rotas da API
	// ---------------------------------------------------------------
	api := r.Group("/api")
	{
		// Clima
		api.GET("/weather", weatherHandler.GetWeather)

		// Funcionários
		employees := api.Group("/employees")
		{
			employees.GET("", employeeHandler.List)
			employees.POST("", employeeHandler.Create)
			employees.PUT("/:id", employeeHandler.Update)
			employees.DELETE("/:id", employeeHandler.Delete)
		}

		// Comunicados
		announcements := api.Group("/announcements")
		{
			announcements.GET("", announcementHandler.List)
			announcements.POST("", announcementHandler.Create)
			announcements.PUT("/:id", announcementHandler.Update)
			announcements.DELETE("/:id", announcementHandler.Delete)
		}

		// Perguntas de RH
		hr := api.Group("/hr-questions")
		{
			hr.GET("", hrHandler.ListQuestions)
			hr.POST("", hrHandler.CreateQuestion)
			hr.PATCH("/:id/status", hrHandler.UpdateQuestionStatus)
		}

		// Chatbot
		chat := api.Group("/chat")
		{
			chat.POST("", chatHandler.Chat)
			chat.GET("/status", chatHandler.Status)
		}
	}

	// ---------------------------------------------------------------
	// Iniciar servidor
	// ---------------------------------------------------------------
	addr := ":" + cfg.Port
	log.Printf("🚀 Servidor Conect 2.0 iniciado em http://localhost%s (modo: %s)", addr, cfg.Env)
	if err := r.Run(addr); err != nil {
		log.Fatalf("❌ Erro ao iniciar servidor: %v", err)
	}
}
