package models

// Employee representa um funcionário da empresa
type Employee struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Extension  string  `json:"extension"`
	Email      *string `json:"email,omitempty"`
	Department string  `json:"department"`
	LunchTime  *string `json:"lunchTime,omitempty"`
	CreatedAt  *string `json:"created_at,omitempty"`
	UpdatedAt  *string `json:"updated_at,omitempty"`
}

// EmployeeInput é o payload de criação/atualização de funcionário
type EmployeeInput struct {
	Name       string  `json:"name" binding:"required"`
	Extension  string  `json:"extension" binding:"required"`
	Email      *string `json:"email,omitempty"`
	Department string  `json:"department" binding:"required"`
	LunchTime  *string `json:"lunchTime,omitempty"`
}

// Announcement representa um comunicado
type Announcement struct {
	ID        string  `json:"id"`
	Title     string  `json:"title"`
	Content   string  `json:"content"`
	Priority  string  `json:"priority"` // "alta" | "média" | "baixa"
	Date      string  `json:"date"`
	ImageURL  *string `json:"image_url,omitempty"`
	CreatedAt *string `json:"createdAt,omitempty"`
	UpdatedAt *string `json:"updatedAt,omitempty"`
}

// AnnouncementInput é o payload de criação/atualização de comunicado
type AnnouncementInput struct {
	Title    string  `json:"title" binding:"required"`
	Content  string  `json:"content" binding:"required"`
	Priority string  `json:"priority" binding:"required,oneof=alta média baixa"`
	Date     string  `json:"date" binding:"required"`
	ImageURL *string `json:"image_url,omitempty"`
}

// HrQuestion representa uma pergunta para o RH
type HrQuestion struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Question  string `json:"question"`
	Status    string `json:"status"` // "nova" | "visualizada" | "resolvida"
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

// HrQuestionInput é o payload de criação de pergunta para o RH
type HrQuestionInput struct {
	Name     string `json:"name" binding:"required"`
	Question string `json:"question" binding:"required"`
}

// HrQuestionStatusUpdate é o payload de atualização de status
type HrQuestionStatusUpdate struct {
	Status string `json:"status" binding:"required,oneof=nova visualizada resolvida"`
}

// WeatherCurrent representa as condições climáticas atuais
type WeatherCurrent struct {
	Time     string  `json:"time"`
	Temp     float64 `json:"temp"`
	Code     int     `json:"code"`
	Humidity float64 `json:"humidity"`
	WindKmh  float64 `json:"windKmh"`
}

// DayForecast representa a previsão de um dia
type DayForecast struct {
	Date string  `json:"date"`
	Min  float64 `json:"min"`
	Max  float64 `json:"max"`
	Code int     `json:"code"`
}

// WeatherResponse é a resposta completa de clima
type WeatherResponse struct {
	Source  string         `json:"source"`
	Current WeatherCurrent `json:"current"`
	Days    []DayForecast  `json:"days"`
}

// ChatMessage representa uma mensagem do chatbot
type ChatMessage struct {
	Role    string `json:"role" binding:"required,oneof=system user assistant"`
	Content string `json:"content" binding:"required"`
}

// ChatRequest é o payload de uma requisição de chat
type ChatRequest struct {
	Messages []ChatMessage `json:"messages" binding:"required,min=1"`
}

// ChatResponse é a resposta do chatbot
type ChatResponse struct {
	Content string `json:"content"`
}

// ErrorResponse é o payload padrão de erro
type ErrorResponse struct {
	Error string `json:"error"`
}
