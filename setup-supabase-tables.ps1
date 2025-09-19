# ========================================
# SCRIPT PARA CRIAR TABELAS NO SUPABASE
# Executa o SQL via API REST do Supabase
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
    Write-Host "✅ Configurações carregadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar se as variáveis necessárias estão definidas
$supabaseUrl = [Environment]::GetEnvironmentVariable("VITE_SUPABASE_URL")
$supabaseKey = [Environment]::GetEnvironmentVariable("VITE_SUPABASE_ANON_KEY")

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no .env!" -ForegroundColor Red
    exit 1
}

Write-Host "🔗 URL do Supabase: $supabaseUrl" -ForegroundColor Yellow
Write-Host "🔑 Chave configurada: ✅" -ForegroundColor Yellow

# Ler o conteúdo do arquivo SQL
Write-Host "`n📄 Lendo arquivo supabase-setup.sql..." -ForegroundColor Cyan

if (-not (Test-Path "supabase-setup.sql")) {
    Write-Host "❌ Arquivo supabase-setup.sql não encontrado!" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content "supabase-setup.sql" -Raw
Write-Host "✅ Arquivo SQL carregado ($(($sqlContent -split "`n").Count) linhas)" -ForegroundColor Green

# Preparar headers para a requisição
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

# URL da API REST do Supabase para executar SQL
$apiUrl = "$supabaseUrl/rest/v1/rpc/exec_sql"

# Preparar o corpo da requisição
$body = @{
    sql = $sqlContent
} | ConvertTo-Json -Depth 10

Write-Host "`n🚀 Executando script SQL no Supabase..." -ForegroundColor Cyan
Write-Host "📡 Endpoint: $apiUrl" -ForegroundColor Yellow

try {
    # Executar a requisição
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Headers $headers -Body $body -ErrorAction Stop
    
    Write-Host "✅ Script SQL executado com sucesso!" -ForegroundColor Green
    Write-Host "📊 Resposta do servidor:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
} catch {
    Write-Host "❌ Erro ao executar o script SQL:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "📊 Status Code: $statusCode" -ForegroundColor Yellow
        
        try {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorBody = $reader.ReadToEnd()
            Write-Host "📄 Detalhes do erro:" -ForegroundColor Yellow
            Write-Host $errorBody -ForegroundColor Red
        } catch {
            Write-Host "Não foi possível ler os detalhes do erro." -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n💡 Alternativas:" -ForegroundColor Cyan
    Write-Host "1. Execute manualmente no painel do Supabase:" -ForegroundColor White
    Write-Host "   https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/sql" -ForegroundColor Blue
    Write-Host "2. Copie o conteúdo de supabase-setup.sql e cole no SQL Editor" -ForegroundColor White
    
    exit 1
}

Write-Host "`n🎉 Configuração do banco concluída!" -ForegroundColor Green
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Verifique as tabelas no painel: https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/editor" -ForegroundColor White
Write-Host "2. Teste a aplicação para confirmar a sincronização" -ForegroundColor White
Write-Host "3. Os dados do localStorage serão migrados automaticamente" -ForegroundColor White