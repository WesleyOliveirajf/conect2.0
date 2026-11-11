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

// SupabaseService encapsula as operações no Supabase via REST API
type SupabaseService struct {
	url        string
	serviceKey string
	httpClient *http.Client
}

// NewSupabaseService cria um novo serviço Supabase
func NewSupabaseService(url, serviceKey string) *SupabaseService {
	return &SupabaseService{
		url:        url,
		serviceKey: serviceKey,
		httpClient: &http.Client{Timeout: 15 * time.Second},
	}
}

// -----------------------------------------------------------------------
// Employees
// -----------------------------------------------------------------------

// dbEmployee é o shape da tabela `employees` no Supabase
type dbEmployee struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Extension  string  `json:"extension"`
	Email      *string `json:"email"`
	Department string  `json:"department"`
	LunchTime  *string `json:"lunch_time"`
	CreatedAt  *string `json:"created_at"`
	UpdatedAt  *string `json:"updated_at"`
}

func dbToEmployee(d dbEmployee) models.Employee {
	return models.Employee{
		ID:         d.ID,
		Name:       d.Name,
		Extension:  d.Extension,
		Email:      d.Email,
		Department: d.Department,
		LunchTime:  d.LunchTime,
		CreatedAt:  d.CreatedAt,
		UpdatedAt:  d.UpdatedAt,
	}
}

// GetEmployees retorna todos os funcionários
func (s *SupabaseService) GetEmployees() ([]models.Employee, error) {
	body, err := s.request(http.MethodGet, "/rest/v1/employees?select=*&order=name.asc", nil)
	if err != nil {
		return nil, err
	}
	var rows []dbEmployee
	if err := json.Unmarshal(body, &rows); err != nil {
		return nil, fmt.Errorf("erro ao decodificar funcionários: %w", err)
	}
	employees := make([]models.Employee, len(rows))
	for i, row := range rows {
		employees[i] = dbToEmployee(row)
	}
	return employees, nil
}

// AddEmployee insere um novo funcionário
func (s *SupabaseService) AddEmployee(input models.EmployeeInput) (*models.Employee, error) {
	payload := map[string]interface{}{
		"name":       input.Name,
		"extension":  input.Extension,
		"email":      input.Email,
		"department": input.Department,
		"lunch_time": input.LunchTime,
	}
	body, err := s.requestWithReturn(http.MethodPost, "/rest/v1/employees", payload)
	if err != nil {
		return nil, err
	}
	var rows []dbEmployee
	if err := json.Unmarshal(body, &rows); err != nil || len(rows) == 0 {
		return nil, fmt.Errorf("resposta inválida ao criar funcionário")
	}
	emp := dbToEmployee(rows[0])
	return &emp, nil
}

// UpdateEmployee atualiza um funcionário pelo ID
func (s *SupabaseService) UpdateEmployee(id string, input models.EmployeeInput) (*models.Employee, error) {
	payload := map[string]interface{}{
		"name":       input.Name,
		"extension":  input.Extension,
		"email":      input.Email,
		"department": input.Department,
		"lunch_time": input.LunchTime,
	}
	body, err := s.requestWithReturn(http.MethodPatch, "/rest/v1/employees?id=eq."+id, payload)
	if err != nil {
		return nil, err
	}
	var rows []dbEmployee
	if err := json.Unmarshal(body, &rows); err != nil || len(rows) == 0 {
		return nil, fmt.Errorf("funcionário não encontrado ou resposta inválida")
	}
	emp := dbToEmployee(rows[0])
	return &emp, nil
}

// DeleteEmployee remove um funcionário pelo ID
func (s *SupabaseService) DeleteEmployee(id string) error {
	_, err := s.request(http.MethodDelete, "/rest/v1/employees?id=eq."+id, nil)
	return err
}

// -----------------------------------------------------------------------
// Announcements
// -----------------------------------------------------------------------

type dbAnnouncement struct {
	ID        string  `json:"id"`
	Title     string  `json:"title"`
	Content   string  `json:"content"`
	Priority  string  `json:"priority"`
	Date      string  `json:"date"`
	ImageURL  *string `json:"image_url"`
	CreatedAt *string `json:"created_at"`
	UpdatedAt *string `json:"updated_at"`
}

func dbToAnnouncement(d dbAnnouncement) models.Announcement {
	return models.Announcement{
		ID:        d.ID,
		Title:     d.Title,
		Content:   d.Content,
		Priority:  d.Priority,
		Date:      d.Date,
		ImageURL:  d.ImageURL,
		CreatedAt: d.CreatedAt,
		UpdatedAt: d.UpdatedAt,
	}
}

// GetAnnouncements retorna todos os comunicados
func (s *SupabaseService) GetAnnouncements() ([]models.Announcement, error) {
	body, err := s.request(http.MethodGet, "/rest/v1/announcements?select=*&order=created_at.desc", nil)
	if err != nil {
		return nil, err
	}
	var rows []dbAnnouncement
	if err := json.Unmarshal(body, &rows); err != nil {
		return nil, fmt.Errorf("erro ao decodificar comunicados: %w", err)
	}
	announcements := make([]models.Announcement, len(rows))
	for i, row := range rows {
		announcements[i] = dbToAnnouncement(row)
	}
	return announcements, nil
}

// AddAnnouncement insere um novo comunicado
func (s *SupabaseService) AddAnnouncement(input models.AnnouncementInput) (*models.Announcement, error) {
	payload := map[string]interface{}{
		"title":     input.Title,
		"content":   input.Content,
		"priority":  input.Priority,
		"date":      input.Date,
		"image_url": input.ImageURL,
	}
	body, err := s.requestWithReturn(http.MethodPost, "/rest/v1/announcements", payload)
	if err != nil {
		return nil, err
	}
	var rows []dbAnnouncement
	if err := json.Unmarshal(body, &rows); err != nil || len(rows) == 0 {
		return nil, fmt.Errorf("resposta inválida ao criar comunicado")
	}
	ann := dbToAnnouncement(rows[0])
	return &ann, nil
}

// UpdateAnnouncement atualiza um comunicado pelo ID
func (s *SupabaseService) UpdateAnnouncement(id string, input models.AnnouncementInput) (*models.Announcement, error) {
	payload := map[string]interface{}{
		"title":     input.Title,
		"content":   input.Content,
		"priority":  input.Priority,
		"date":      input.Date,
		"image_url": input.ImageURL,
	}
	body, err := s.requestWithReturn(http.MethodPatch, "/rest/v1/announcements?id=eq."+id, payload)
	if err != nil {
		return nil, err
	}
	var rows []dbAnnouncement
	if err := json.Unmarshal(body, &rows); err != nil || len(rows) == 0 {
		return nil, fmt.Errorf("comunicado não encontrado ou resposta inválida")
	}
	ann := dbToAnnouncement(rows[0])
	return &ann, nil
}

// DeleteAnnouncement remove um comunicado pelo ID
func (s *SupabaseService) DeleteAnnouncement(id string) error {
	_, err := s.request(http.MethodDelete, "/rest/v1/announcements?id=eq."+id, nil)
	return err
}

// -----------------------------------------------------------------------
// HR Questions
// -----------------------------------------------------------------------

type dbHrQuestion struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Question  string `json:"question"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func dbToHrQuestion(d dbHrQuestion) models.HrQuestion {
	return models.HrQuestion{
		ID:        d.ID,
		Name:      d.Name,
		Question:  d.Question,
		Status:    d.Status,
		CreatedAt: d.CreatedAt,
		UpdatedAt: d.UpdatedAt,
	}
}

// GetHrQuestions retorna todas as perguntas de RH
func (s *SupabaseService) GetHrQuestions() ([]models.HrQuestion, error) {
	body, err := s.request(http.MethodGet, "/rest/v1/hr_questions?select=*&order=created_at.desc", nil)
	if err != nil {
		return nil, err
	}
	var rows []dbHrQuestion
	if err := json.Unmarshal(body, &rows); err != nil {
		return nil, fmt.Errorf("erro ao decodificar perguntas: %w", err)
	}
	questions := make([]models.HrQuestion, len(rows))
	for i, row := range rows {
		questions[i] = dbToHrQuestion(row)
	}
	return questions, nil
}

// AddHrQuestion insere uma nova pergunta
func (s *SupabaseService) AddHrQuestion(input models.HrQuestionInput) error {
	payload := map[string]interface{}{
		"name":     input.Name,
		"question": input.Question,
		"status":   "nova",
	}
	_, err := s.request(http.MethodPost, "/rest/v1/hr_questions", payload)
	return err
}

// UpdateHrQuestionStatus atualiza o status de uma pergunta
func (s *SupabaseService) UpdateHrQuestionStatus(id, status string) error {
	payload := map[string]interface{}{
		"status": status,
	}
	_, err := s.requestWithReturn(http.MethodPatch, "/rest/v1/hr_questions?id=eq."+id, payload)
	return err
}

// -----------------------------------------------------------------------
// HTTP helpers
// -----------------------------------------------------------------------

func (s *SupabaseService) request(method, path string, payload interface{}) ([]byte, error) {
	var bodyReader io.Reader
	if payload != nil {
		b, err := json.Marshal(payload)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, s.url+path, bodyReader)
	if err != nil {
		return nil, err
	}
	s.setHeaders(req, false)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("supabase %s %s → %d: %s", method, path, resp.StatusCode, string(body))
	}

	return body, nil
}

// requestWithReturn adiciona o header Prefer: return=representation para obter o registro criado/atualizado
func (s *SupabaseService) requestWithReturn(method, path string, payload interface{}) ([]byte, error) {
	var bodyReader io.Reader
	if payload != nil {
		b, err := json.Marshal(payload)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, s.url+path, bodyReader)
	if err != nil {
		return nil, err
	}
	s.setHeaders(req, true)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("supabase %s %s → %d: %s", method, path, resp.StatusCode, string(body))
	}

	return body, nil
}

func (s *SupabaseService) setHeaders(req *http.Request, withReturn bool) {
	req.Header.Set("apikey", s.serviceKey)
	req.Header.Set("Authorization", "Bearer "+s.serviceKey)
	req.Header.Set("Content-Type", "application/json")
	if withReturn {
		req.Header.Set("Prefer", "return=representation")
	}
}
