package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/torp/conect2-backend/internal/models"
	"github.com/torp/conect2-backend/internal/services"
)

// ChatHandler encapsula o handler do chatbot (proxy para Groq)
type ChatHandler struct {
	groqSvc *services.GroqService
}

// NewChatHandler cria um novo ChatHandler
func NewChatHandler(groqSvc *services.GroqService) *ChatHandler {
	return &ChatHandler{groqSvc: groqSvc}
}

// Chat godoc
// POST /api/chat
// Envia mensagens para a Groq e retorna a resposta do assistente
func (h *ChatHandler) Chat(c *gin.Context) {
	if !h.groqSvc.IsConfigured() {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Chatbot não configurado. GROQ_API_KEY ausente.",
		})
		return
	}

	var req models.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payload inválido: " + err.Error()})
		return
	}

	// Injeta o system prompt padrão se não estiver presente
	messages := req.Messages
	if len(messages) == 0 || messages[0].Role != "system" {
		systemMsg := models.ChatMessage{
			Role: "system",
			Content: `Você é o Oráculo, assistente inteligente da TORP (Tecnologia, Organização, Recursos e Pessoas).
Seja útil, preciso e profissional.
- Para consultas sobre funcionários, use apenas informações fornecidas no contexto.
- Se a informação não estiver disponível, informe isso claramente.`,
		}
		messages = append([]models.ChatMessage{systemMsg}, messages...)
	}

	content, err := h.groqSvc.SendMessages(messages)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Erro ao comunicar com IA: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.ChatResponse{Content: content})
}

// Status godoc
// GET /api/chat/status
// Retorna o status do serviço de chatbot
func (h *ChatHandler) Status(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"configured": h.groqSvc.IsConfigured(),
	})
}
