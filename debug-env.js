// Script de debug para verificar variáveis de ambiente no contexto Vite
import { createClient } from '@supabase/supabase-js';

console.log('=== DEBUG: Variáveis de Ambiente ===');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('VITE_ENABLE_AUTO_MIGRATION:', import.meta.env.VITE_ENABLE_AUTO_MIGRATION);

// Testar inicialização do Supabase
try {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase criado com sucesso');
    
    // Testar uma consulta simples
    supabase.from('employees').select('count', { count: 'exact' }).then(({ count, error }) => {
      if (error) {
        console.error('❌ Erro ao testar consulta:', error);
      } else {
        console.log('✅ Consulta de teste bem-sucedida. Total de funcionários:', count);
      }
    });
  } else {
    console.error('❌ Variáveis do Supabase não configuradas');
  }
} catch (error) {
  console.error('❌ Erro ao inicializar Supabase:', error);
}