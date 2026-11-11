package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/torp/conect2-backend/internal/models"
	"github.com/torp/conect2-backend/internal/services"
)

// HrHandler encapsula os handlers de perguntas de RH
type HrHandler struct {
	svc *services.SupabaseService
}

// NewHrHandler cria um novo HrHandler
func NewHrHandler(svc *services.SupabaseService) *HrHandler {
	return &HrHandler{svc: svc}
}

// ListQuestions godoc
// GET /api/hr-questions
func (h *HrHandler) ListQuestions(c *gin.Context) {
	questions, err := h.svc.GetHrQuestions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar perguntas: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, questions)
}

// CreateQuestion godoc
// POST /api/hr-questions
func (h *HrHandler) CreateQuestion(c *gin.Context) {
	var input models.HrQuestionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + err.Error()})
		return
	}

	if err := h.svc.AddHrQuestion(input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar pergunta: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Pergunta enviada com sucesso"})
}

// UpdateQuestionStatus godoc
// PATCH /api/hr-questions/:id/status
func (h *HrHandler) UpdateQuestionStatus(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID obrigatório"})
		return
	}

	var payload models.HrQuestionStatusUpdate
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status inválido: " + err.Error()})
		return
	}

	if err := h.svc.UpdateHrQuestionStatus(id, payload.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar status: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Status atualizado com sucesso"})
}
