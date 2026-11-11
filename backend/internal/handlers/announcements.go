package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/torp/conect2-backend/internal/models"
	"github.com/torp/conect2-backend/internal/services"
)

// AnnouncementHandler encapsula os handlers de comunicados
type AnnouncementHandler struct {
	svc *services.SupabaseService
}

// NewAnnouncementHandler cria um novo AnnouncementHandler
func NewAnnouncementHandler(svc *services.SupabaseService) *AnnouncementHandler {
	return &AnnouncementHandler{svc: svc}
}

// List godoc
// GET /api/announcements
func (h *AnnouncementHandler) List(c *gin.Context) {
	announcements, err := h.svc.GetAnnouncements()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar comunicados: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, announcements)
}

// Create godoc
// POST /api/announcements
func (h *AnnouncementHandler) Create(c *gin.Context) {
	var input models.AnnouncementInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + err.Error()})
		return
	}

	announcement, err := h.svc.AddAnnouncement(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar comunicado: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, announcement)
}

// Update godoc
// PUT /api/announcements/:id
func (h *AnnouncementHandler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID obrigatório"})
		return
	}

	var input models.AnnouncementInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + err.Error()})
		return
	}

	announcement, err := h.svc.UpdateAnnouncement(id, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar comunicado: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, announcement)
}

// Delete godoc
// DELETE /api/announcements/:id
func (h *AnnouncementHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID obrigatório"})
		return
	}

	if err := h.svc.DeleteAnnouncement(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao remover comunicado: " + err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
