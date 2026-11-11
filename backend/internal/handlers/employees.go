package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/torp/conect2-backend/internal/models"
	"github.com/torp/conect2-backend/internal/services"
)

// EmployeeHandler encapsula os handlers de funcionários
type EmployeeHandler struct {
	svc *services.SupabaseService
}

// NewEmployeeHandler cria um novo EmployeeHandler
func NewEmployeeHandler(svc *services.SupabaseService) *EmployeeHandler {
	return &EmployeeHandler{svc: svc}
}

// List godoc
// GET /api/employees
func (h *EmployeeHandler) List(c *gin.Context) {
	employees, err := h.svc.GetEmployees()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar funcionários: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, employees)
}

// Create godoc
// POST /api/employees
func (h *EmployeeHandler) Create(c *gin.Context) {
	var input models.EmployeeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + err.Error()})
		return
	}

	employee, err := h.svc.AddEmployee(input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar funcionário: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, employee)
}

// Update godoc
// PUT /api/employees/:id
func (h *EmployeeHandler) Update(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID obrigatório"})
		return
	}

	var input models.EmployeeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos: " + err.Error()})
		return
	}

	employee, err := h.svc.UpdateEmployee(id, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar funcionário: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, employee)
}

// Delete godoc
// DELETE /api/employees/:id
func (h *EmployeeHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID obrigatório"})
		return
	}

	if err := h.svc.DeleteEmployee(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao remover funcionário: " + err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
