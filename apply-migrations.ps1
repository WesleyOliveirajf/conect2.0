# ============================================================
# apply-migrations.ps1
# Script para aplicar as migrations do Conect 2.0 no Supabase
# ============================================================
# Como usar:
#   1. Defina as variáveis de ambiente abaixo
#   2. Execute: .\apply-migrations.ps1
# ============================================================

param(
    [string]$SupabaseUrl      = $env:SUPABASE_URL,
    [string]$ServiceRoleKey   = $env:SUPABASE_SERVICE_KEY,
    [string]$MigrationDir     = "$PSScriptRoot\supabase\migrations"
)

if (-not $SupabaseUrl -or -not $ServiceRoleKey) {
    Write-Error @"
❌ Variáveis obrigatórias não definidas!

Defina-as antes de executar:
  `$env:SUPABASE_URL        = "https://duduzwnyqeuedbaqnbsh.supabase.co"
  `$env:SUPABASE_SERVICE_KEY = "eyJhbG..."   # chave service_role do painel Supabase

Ou passe como parâmetros:
  .\apply-migrations.ps1 -SupabaseUrl "https://..." -ServiceRoleKey "eyJhbG..."
"@
    exit 1
}

$sqlEndpoint = "$SupabaseUrl/rest/v1/rpc/exec_sql"
$queryEndpoint = "$SupabaseUrl/rest/v1/"

Write-Host "`n🚀 Aplicando migrations em: $SupabaseUrl`n"

# Função para executar SQL via REST API
function Invoke-SQL {
    param([string]$SQL, [string]$Label)
    
    Write-Host "  ▶ $Label..."
    
    $headers = @{
        "apikey"        = $ServiceRoleKey
        "Authorization" = "Bearer $ServiceRoleKey"
        "Content-Type"  = "application/json"
        "Prefer"        = "return=minimal"
    }
    
    $body = @{ query = $SQL } | ConvertTo-Json
    
    try {
        # Usa o endpoint de SQL direto via supabase REST
        $resp = Invoke-RestMethod `
            -Uri "$SupabaseUrl/rest/v1/rpc/exec_sql" `
            -Method POST `
            -Headers $headers `
            -Body $body `
            -ErrorAction Stop
        
        Write-Host "  ✅ $Label — OK" -ForegroundColor Green
        return $true
    } catch {
        # Tenta o endpoint alternativo de SQL query
        try {
            $altBody = $SQL
            $altHeaders = @{
                "apikey"        = $ServiceRoleKey
                "Authorization" = "Bearer $ServiceRoleKey"
                "Content-Type"  = "application/sql"
            }
            $resp = Invoke-RestMethod `
                -Uri "$SupabaseUrl/rest/v1/query" `
                -Method POST `
                -Headers $altHeaders `
                -Body $altBody `
                -ErrorAction Stop
            
            Write-Host "  ✅ $Label — OK" -ForegroundColor Green
            return $true
        } catch {
            Write-Host "  ❌ $Label — ERRO: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    }
}

# Aplicar cada arquivo de migration em ordem
$migrations = Get-ChildItem -Path $MigrationDir -Filter "*.sql" | Sort-Object Name

if ($migrations.Count -eq 0) {
    Write-Warning "Nenhuma migration encontrada em: $MigrationDir"
    exit 0
}

$success = 0
$failed  = 0

foreach ($file in $migrations) {
    $sql   = Get-Content $file.FullName -Raw
    $label = $file.Name
    
    if (Invoke-SQL -SQL $sql -Label $label) {
        $success++
    } else {
        $failed++
    }
}

Write-Host "`n📊 Resultado: $success OK, $failed erros`n"

if ($failed -gt 0) {
    Write-Host "⚠️  Algumas migrations falharam. Use o SQL Editor do Supabase para aplicar manualmente:" -ForegroundColor Yellow
    Write-Host "    https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/sql/new" -ForegroundColor Cyan
    Write-Host "    Arquivo consolidado: supabase\schema_completo.sql`n" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "✅ Todas as migrations aplicadas com sucesso!`n" -ForegroundColor Green
    exit 0
}
