package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config contém todas as configurações da aplicação
type Config struct {
	// Servidor
	Port string
	Env  string

	// Supabase
	SupabaseURL string
	SupabaseKey string

	// Groq (IA)
	GroqAPIKey string
	GroqModel  string

	// Climatempo (opcional)
	ClimatempToken  string
	ClimaLocalID    string

	// Rate Limiting
	RateLimitRPS   int
	RateLimitBurst int

	// CORS — origens permitidas separadas por vírgula
	AllowedOrigins string
}

// Load carrega configurações do ambiente (lê .env se existir)
func Load() (*Config, error) {
	// Tenta carregar .env — não é erro se não existir (produção usa env real)
	if err := godotenv.Load(); err != nil {
		log.Println("[config] Arquivo .env não encontrado, usando variáveis de ambiente do sistema")
	}

	cfg := &Config{
		Port:           getEnv("PORT", "8080"),
		Env:            getEnv("APP_ENV", "development"),
		SupabaseURL:    getEnv("SUPABASE_URL", ""),
		SupabaseKey:    getEnv("SUPABASE_SERVICE_KEY", ""),
		GroqAPIKey:     getEnv("GROQ_API_KEY", ""),
		GroqModel:      getEnv("GROQ_MODEL", "llama-3.1-8b-instant"),
		ClimatempToken: getEnv("CLIMATEMPO_TOKEN", ""),
		ClimaLocalID:   getEnv("CLIMATEMPO_LOCALE_ID", "152"),
		AllowedOrigins: getEnv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"),
	}

	rps, err := strconv.Atoi(getEnv("RATE_LIMIT_RPS", "20"))
	if err != nil {
		rps = 20
	}
	cfg.RateLimitRPS = rps

	burst, err := strconv.Atoi(getEnv("RATE_LIMIT_BURST", "50"))
	if err != nil {
		burst = 50
	}
	cfg.RateLimitBurst = burst

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *Config) validate() error {
	if c.SupabaseURL == "" {
		return fmt.Errorf("SUPABASE_URL é obrigatório")
	}
	if c.SupabaseKey == "" {
		return fmt.Errorf("SUPABASE_SERVICE_KEY é obrigatório")
	}
	return nil
}

func getEnv(key, defaultValue string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultValue
}
