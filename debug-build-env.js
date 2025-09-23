// Script para testar carregamento de variáveis de ambiente no modo production
import { loadEnv } from 'vite';

console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE - MODO PRODUCTION ===');

// Teste no modo production
const prodEnv = loadEnv('production', process.cwd(), '');
console.log('Modo Production:');
console.log('VITE_SUPABASE_URL:', prodEnv.VITE_SUPABASE_URL || 'NÃO DEFINIDA');
console.log('VITE_SUPABASE_ANON_KEY:', prodEnv.VITE_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');

// Teste no modo development
const devEnv = loadEnv('development', process.cwd(), '');
console.log('\nModo Development:');
console.log('VITE_SUPABASE_URL:', devEnv.VITE_SUPABASE_URL || 'NÃO DEFINIDA');
console.log('VITE_SUPABASE_ANON_KEY:', devEnv.VITE_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');

// Teste com prefixo vazio (todas as variáveis)
const allEnv = loadEnv('production', process.cwd(), '');
console.log('\nTodas as variáveis VITE_* no modo production:');
Object.keys(allEnv).filter(key => key.startsWith('VITE_')).forEach(key => {
  console.log(`${key}: ${allEnv[key] ? 'DEFINIDA' : 'NÃO DEFINIDA'}`);
});

// Verificar se o arquivo .env existe
import fs from 'fs';
const envPath = process.cwd() + '/.env';
console.log('\nVerificação do arquivo .env:');
console.log('Arquivo .env existe:', fs.existsSync(envPath));
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  console.log('Número de linhas de configuração:', lines.length);
  console.log('Contém VITE_SUPABASE_URL:', envContent.includes('VITE_SUPABASE_URL'));
  console.log('Contém VITE_SUPABASE_ANON_KEY:', envContent.includes('VITE_SUPABASE_ANON_KEY'));
}