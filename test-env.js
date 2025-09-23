// Script para testar carregamento de variáveis de ambiente
import { loadEnv } from 'vite';

const mode = process.env.NODE_ENV || 'development';
const env = loadEnv(mode, process.cwd(), '');

console.log('=== TESTE DE VARIÁVEIS DE AMBIENTE ===');
console.log('Mode:', mode);
console.log('Process CWD:', process.cwd());
console.log('');

console.log('Variáveis VITE_* encontradas:');
Object.keys(env).forEach(key => {
  if (key.startsWith('VITE_')) {
    console.log(`${key}: ${env[key] ? '✓ Definida' : '✗ Não definida'}`);
  }
});

console.log('');
console.log('Variáveis específicas do Supabase:');
console.log('VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL || 'NÃO DEFINIDA');
console.log('VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? 'DEFINIDA (oculta por segurança)' : 'NÃO DEFINIDA');

// Teste de import.meta.env (simulação)
console.log('');
console.log('=== SIMULAÇÃO import.meta.env ===');
console.log('Em um contexto de módulo ES, as variáveis seriam:');
console.log('import.meta.env.VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL);
console.log('import.meta.env.VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? '[DEFINIDA]' : '[NÃO DEFINIDA]');