# =====================================================
# Dockerfile — Conect 2.0 Backend Go
# Build multi-stage: binário estático mínimo
# =====================================================

# ---- Estágio 1: Build ----
FROM golang:1.22-alpine AS builder

# Dependências de build
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copiar módulos e baixar dependências (cache de layer)
COPY go.mod go.sum ./
RUN go mod download

# Copiar código fonte
COPY . .

# Compilar — binário estático sem CGO
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" -o conect2-backend ./main.go

# ---- Estágio 2: Imagem final mínima ----
FROM gcr.io/distroless/static-debian12

WORKDIR /app

# Copiar o binário compilado
COPY --from=builder /app/conect2-backend .

# Certificados SSL (necessários para chamadas HTTPS externas)
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/app/conect2-backend"]
