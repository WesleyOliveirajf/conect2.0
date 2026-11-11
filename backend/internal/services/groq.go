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

const groqBaseURL = "https://api.groq.com/openai/v1"

// GroqService encapsula as chamadas à API da Groq
type GroqService struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

// NewGroqService cria um novo serviço Groq
func NewGroqService(apiKey, model string) *GroqService {
	return &GroqService{
		apiKey: apiKey,
		model:  model,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type groqRequest struct {
	Model     string              `json:"model"`
	Messages  []models.ChatMessage `json:"messages"`
	MaxTokens int                 `json:"max_tokens"`
	Temp      float64             `json:"temperature"`
	Stream    bool                `json:"stream"`
}

type groqResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
			Role    string `json:"role"`
		} `json:"message"`
	} `json:"choices"`
}

// IsConfigured verifica se a chave de API está configurada
func (s *GroqService) IsConfigured() bool {
	return s.apiKey != ""
}

// SendMessages envia uma conversa para a Groq e retorna o conteúdo da resposta
func (s *GroqService) SendMessages(messages []models.ChatMessage) (string, error) {
	if !s.IsConfigured() {
		return "", fmt.Errorf("GROQ_API_KEY não configurada")
	}

	payload := groqRequest{
		Model:     s.model,
		Messages:  messages,
		MaxTokens: 1000,
		Temp:      0.7,
		Stream:    false,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("erro ao serializar requisição: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, groqBaseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("erro ao criar requisição: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("erro ao chamar API Groq: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("erro ao ler resposta: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("groq retornou status %d: %s", resp.StatusCode, string(respBody))
	}

	var groqResp groqResponse
	if err := json.Unmarshal(respBody, &groqResp); err != nil {
		return "", fmt.Errorf("erro ao deserializar resposta: %w", err)
	}

	if len(groqResp.Choices) == 0 {
		return "", fmt.Errorf("resposta vazia da Groq")
	}

	return groqResp.Choices[0].Message.Content, nil
}
