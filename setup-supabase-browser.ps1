# ========================================
# SCRIPT PARA CONFIGURAR SUPABASE VIA NAVEGADOR
# Abre o painel e copia o SQL para execução manual
# ========================================

Write-Host "🚀 CONFIGURAÇÃO AUTOMÁTICA DO SUPABASE" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Verificar se o arquivo SQL existe
if (-not (Test-Path "supabase-setup.sql")) {
    Write-Host "❌ Arquivo supabase-setup.sql não encontrado!" -ForegroundColor Red
    exit 1
}

# Ler o conteúdo do SQL
$sqlContent = Get-Content "supabase-setup.sql" -Raw
Write-Host "📄 Script SQL carregado ($(($sqlContent -split "`n").Count) linhas)" -ForegroundColor Cyan

# Copiar SQL para área de transferência
try {
    $sqlContent | Set-Clipboard
    Write-Host "✅ SQL copiado para área de transferência!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Não foi possível copiar para área de transferência" -ForegroundColor Yellow
}

# URL do painel SQL do Supabase
$supabaseUrl = "https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/sql"

Write-Host "`n🌐 Abrindo painel do Supabase..." -ForegroundColor Cyan
Write-Host "📍 URL: $supabaseUrl" -ForegroundColor Yellow

# Abrir o navegador
try {
    Start-Process $supabaseUrl
    Write-Host "✅ Navegador aberto!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao abrir navegador. Acesse manualmente:" -ForegroundColor Red
    Write-Host $supabaseUrl -ForegroundColor Blue
}

Write-Host "`n📋 INSTRUÇÕES PARA EXECUÇÃO:" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host "1. ✅ O navegador foi aberto no painel SQL do Supabase" -ForegroundColor White
Write-Host "2. ✅ O script SQL foi copiado para sua área de transferência" -ForegroundColor White
Write-Host "3. 📝 No painel, clique em 'New Query' ou use o editor existente" -ForegroundColor White
Write-Host "4. 📋 Cole o conteúdo (Ctrl+V) no editor SQL" -ForegroundColor White
Write-Host "5. ▶️  Clique em 'Run' para executar o script" -ForegroundColor White
Write-Host "6. ✅ Aguarde a confirmação de sucesso" -ForegroundColor White

Write-Host "`n🔍 VERIFICAÇÃO APÓS EXECUÇÃO:" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host "• Vá para 'Table Editor' no menu lateral" -ForegroundColor White
Write-Host "• Confirme que as tabelas 'employees' e 'announcements' foram criadas" -ForegroundColor White
Write-Host "• Verifique se há dados de exemplo nas tabelas" -ForegroundColor White

Write-Host "`n🎯 RESULTADO ESPERADO:" -ForegroundColor Green
Write-Host "=====================" -ForegroundColor Green
Write-Host "✅ Tabela 'employees' criada com estrutura completa" -ForegroundColor White
Write-Host "✅ Tabela 'announcements' criada com estrutura completa" -ForegroundColor White
Write-Host "✅ Índices criados para melhor performance" -ForegroundColor White
Write-Host "✅ Row Level Security (RLS) habilitado" -ForegroundColor White
Write-Host "✅ Dados de exemplo inseridos" -ForegroundColor White
Write-Host "✅ Triggers para updated_at configurados" -ForegroundColor White

Write-Host "`n⚡ APÓS A EXECUÇÃO:" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "• Volte para a aplicação e teste a funcionalidade" -ForegroundColor White
Write-Host "• Os dados do localStorage serão sincronizados automaticamente" -ForegroundColor White
Write-Host "• A aplicação funcionará em tempo real entre dispositivos" -ForegroundColor White

Write-Host "`n🔗 LINKS ÚTEIS:" -ForegroundColor Green
Write-Host "===============" -ForegroundColor Green
Write-Host "• Painel SQL: https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/sql" -ForegroundColor Blue
Write-Host "• Editor de Tabelas: https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/editor" -ForegroundColor Blue
Write-Host "• Configurações da API: https://supabase.com/dashboard/project/duduzwnyqeuedbaqnbsh/settings/api" -ForegroundColor Blue

Write-Host "`n💡 DICA:" -ForegroundColor Yellow
Write-Host "Se houver algum erro durante a execução, verifique os logs no painel" -ForegroundColor White
Write-Host "e execute os comandos SQL individualmente se necessário." -ForegroundColor White

Write-Host "`n✨ Pressione qualquer tecla quando terminar a execução no navegador..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "Agora teste a aplicação para verificar se tudo está funcionando." -ForegroundColor White