# ========================================
# SCRIPT ALTERNATIVO PARA CRIAR TABELAS NO SUPABASE
# Usa API REST direta para executar comandos SQL individuais
# ========================================

# Carregar variáveis do arquivo .env
Write-Host "🔧 Carregando configurações do .env..." -ForegroundColor Cyan

if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "✅ Configurações carregadas!" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar variáveis
$supabaseUrl = [Environment]::GetEnvironmentVariable("VITE_SUPABASE_URL")
$supabaseKey = [Environment]::GetEnvironmentVariable("VITE_SUPABASE_ANON_KEY")

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Variáveis do Supabase não encontradas!" -ForegroundColor Red
    exit 1
}

Write-Host "🔗 Conectando ao Supabase..." -ForegroundColor Cyan

# Headers para requisições
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

# Função para executar SQL
function Invoke-SupabaseSQL {
    param([string]$sql, [string]$description)
    
    Write-Host "📝 $description..." -ForegroundColor Yellow
    
    try {
        # Tentar via endpoint de query direta
        $queryUrl = "$supabaseUrl/rest/v1/rpc/query"
        $body = @{ query = $sql } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $queryUrl -Method POST -Headers $headers -Body $body -ErrorAction Stop
        Write-Host "✅ $description - Sucesso!" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "⚠️ Tentativa 1 falhou, tentando método alternativo..." -ForegroundColor Yellow
        
        try {
            # Método alternativo: usar endpoint de função personalizada
            $rpcUrl = "$supabaseUrl/rest/v1/rpc/exec"
            $body = @{ sql_query = $sql } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri $rpcUrl -Method POST -Headers $headers -Body $body -ErrorAction Stop
            Write-Host "✅ $description - Sucesso (método alternativo)!" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "❌ $description - Falhou:" -ForegroundColor Red
            Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Lista de comandos SQL para executar
$sqlCommands = @(
    @{
        sql = "CREATE EXTENSION IF NOT EXISTS `"uuid-ossp`";"
        desc = "Habilitando extensão UUID"
    },
    @{
        sql = @"
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    extension VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(255) NOT NULL,
    lunch_time VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"@
        desc = "Criando tabela employees"
    },
    @{
        sql = @"
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('alta', 'média', 'baixa')),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"@
        desc = "Criando tabela announcements"
    },
    @{
        sql = "CREATE INDEX IF NOT EXISTS idx_employees_name ON public.employees(name);"
        desc = "Criando índice para nome dos funcionários"
    },
    @{
        sql = "CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);"
        desc = "Criando índice para departamento"
    },
    @{
        sql = "CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees(email);"
        desc = "Criando índice para email"
    }
)

Write-Host "`n🚀 Iniciando criação das tabelas..." -ForegroundColor Cyan

$successCount = 0
$totalCommands = $sqlCommands.Count

foreach ($command in $sqlCommands) {
    if (Invoke-SupabaseSQL -sql $command.sql -description $command.desc) {
        $successCount++
    }
    Start-Sleep -Milliseconds 500  # Pequena pausa entre comandos
}

Write-Host "`n📊 Resultado:" -ForegroundColor Cyan
Write-Host "✅ Comandos executados com sucesso: $successCount/$totalCommands" -ForegroundColor Green

if ($successCount -eq $totalCommands) {
    Write-Host "`n🎉 Todas as tabelas foram criadas com sucesso!" -ForegroundColor Green
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. Teste a aplicação para verificar a conexão" -ForegroundColor White
    Write-Host "2. Os dados do localStorage serão sincronizados automaticamente" -ForegroundColor White
} else {
    Write-Host "`n⚠️ Algumas operações falharam. Tente executar manualmente:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/sql" -ForegroundColor Blue
}

# Tentar verificar se as tabelas existem
Write-Host "`n🔍 Verificando tabelas criadas..." -ForegroundColor Cyan

try {
    $checkUrl = "$supabaseUrl/rest/v1/employees?select=count"
    $response = Invoke-RestMethod -Uri $checkUrl -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "✅ Tabela employees: Acessível" -ForegroundColor Green
} catch {
    Write-Host "❌ Tabela employees: Não acessível" -ForegroundColor Red
}

try {
    $checkUrl = "$supabaseUrl/rest/v1/announcements?select=count"
    $response = Invoke-RestMethod -Uri $checkUrl -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "✅ Tabela announcements: Acessível" -ForegroundColor Green
} catch {
    Write-Host "❌ Tabela announcements: Não acessível" -ForegroundColor Red
}