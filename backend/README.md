# Conect 2.0 — Backend Go

Backend em Go que substitui as serverless functions do Vercel, expondo uma API REST consumida pelo frontend React existente.

## Arquitetura

```
frontend/ (React + Vite — mantido)
    ↓  HTTP/JSON via proxy Vite (dev) ou URL direta (prod)
backend/ (Go + Gin)
    ├── GET  /health                    → health check
    ├── GET  /api/weather               → clima atual + previsão 5 dias
    ├── GET  /api/employees             → listar funcionários
    ├── POST /api/employees             → criar funcionário
    ├── PUT  /api/employees/:id         → atualizar funcionário
    ├── DELETE /api/employees/:id       → remover funcionário
    ├── GET  /api/announcements         → listar comunicados
    ├── POST /api/announcements         → criar comunicado
    ├── PUT  /api/announcements/:id     → atualizar comunicado
    ├── DELETE /api/announcements/:id   → remover comunicado
    ├── GET  /api/hr-questions          → listar perguntas de RH
    ├── POST /api/hr-questions          → enviar pergunta de RH
    ├── PATCH /api/hr-questions/:id/status → atualizar status
    ├── POST /api/chat                  → chatbot (proxy Groq)
    └── GET  /api/chat/status           → status do chatbot
          ↓
    Supabase (PostgreSQL)
    Groq API (IA)
    Open-Meteo / Climatempo (Clima)
```

## Estrutura de Pastas

```
backend/
├── main.go                         # Ponto de entrada, rotas, DI
├── go.mod                          # Módulo Go e dependências
├── Dockerfile                      # Build multi-stage
├── docker-compose.yml              # Orquestração local
├── .env.example                    # Variáveis de ambiente
└── internal/
    ├── config/
    │   └── config.go               # Carregamento do .env
    ├── models/
    │   └── models.go               # Structs compartilhadas
    ├── middleware/
    │   └── middleware.go           # CORS, Logger, Rate Limiter, Security Headers
    ├── services/
    │   ├── supabase.go             # Cliente REST Supabase
    │   ├── weather.go              # Climatempo + Open-Meteo (fallback)
    │   └── groq.go                 # Proxy para API da Groq
    └── handlers/
        ├── weather.go              # Handler GET /api/weather
        ├── employees.go            # Handlers CRUD /api/employees
        ├── announcements.go        # Handlers CRUD /api/announcements
        ├── hr.go                   # Handlers /api/hr-questions
        └── chat.go                 # Handler POST /api/chat
```

## Pré-requisitos

- [Go 1.22+](https://go.dev/dl/)
- Projeto Supabase configurado (tabelas `employees`, `announcements`, `hr_questions`)

## Configuração

```bash
# 1. Entre na pasta backend
cd backend

# 2. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Edite o .env com suas credenciais
# SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios

# 4. Baixe as dependências Go
go mod tidy
```

## Rodando em Desenvolvimento

### Opção A — Backend + Frontend separados (recomendado)

Terminal 1 — Backend Go:
```bash
cd backend
go run main.go
# Servidor rodando em http://localhost:8080
```

Terminal 2 — Frontend React:
```bash
# Na raiz do projeto
npm run dev
# Frontend rodando em http://localhost:5173
# O Vite faz proxy /api/* → http://localhost:8080 automaticamente
```

### Opção B — Apenas o backend Go (teste via curl/Postman)

```bash
cd backend
go run main.go
```

Exemplos de requisições:
```bash
# Clima
curl http://localhost:8080/api/weather

# Funcionários
curl http://localhost:8080/api/employees

# Criar funcionário
curl -X POST http://localhost:8080/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","extension":"4799","department":"TI"}'

# Chatbot
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Olá, quem trabalha no departamento de TI?"}]}'
```

## Build para Produção

### Com Docker (recomendado)

```bash
cd backend

# Build da imagem
docker build -t conect2-backend .

# Executar
docker run -p 8080:8080 --env-file .env conect2-backend
```

### Com Docker Compose

```bash
cd backend
docker-compose up -d
```

### Build direto (binário)

```bash
cd backend

# Linux/Mac
go build -ldflags="-w -s" -o conect2-backend ./main.go

# Windows
go build -ldflags="-w -s" -o conect2-backend.exe ./main.go

# Executar
./conect2-backend
```

## Deploy em Produção

O backend Go pode ser hospedado em qualquer lugar que rode containers ou binários:

| Plataforma | Suporte | Observação |
|---|---|---|
| **Railway** | ✅ | `railway up` com Dockerfile |
| **Fly.io** | ✅ | `fly deploy` com Dockerfile |
| **Render** | ✅ | Detecta Go automaticamente |
| **VPS (Ubuntu)** | ✅ | Binário + systemd service |
| **Google Cloud Run** | ✅ | Container sem servidor |
| **AWS ECS/Fargate** | ✅ | Container gerenciado |

### Configurar o Frontend para Produção

No `.env` do frontend (`.env.production`), defina:
```
VITE_API_URL=https://sua-api-go.com
```

E atualize o `vite.config.ts` se necessário — o proxy já está configurado para usar `VITE_API_URL` automaticamente.

## Variáveis de Ambiente

| Variável | Obrigatório | Padrão | Descrição |
|---|---|---|---|
| `SUPABASE_URL` | ✅ | — | URL do projeto Supabase |
| `SUPABASE_SERVICE_KEY` | ✅ | — | Chave service_role do Supabase |
| `GROQ_API_KEY` | ❌ | — | Chave API da Groq (chatbot) |
| `GROQ_MODEL` | ❌ | `llama-3.1-8b-instant` | Modelo Groq |
| `CLIMATEMPO_TOKEN` | ❌ | — | Token Climatempo (usa Open-Meteo se vazio) |
| `CLIMATEMPO_LOCALE_ID` | ❌ | `152` | ID do locale Climatempo |
| `PORT` | ❌ | `8080` | Porta do servidor |
| `APP_ENV` | ❌ | `development` | `development` ou `production` |
| `RATE_LIMIT_RPS` | ❌ | `20` | Requisições/segundo por IP |
| `RATE_LIMIT_BURST` | ❌ | `50` | Burst máximo por IP |
| `ALLOWED_ORIGINS` | ❌ | `http://localhost:5173,...` | Origens CORS separadas por vírgula |
