const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://duduzwnyqeuedbaqnbsh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZHV6d255cWV1ZWRiYXFuYnNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNzczMjksImV4cCI6MjA3Mzg1MzMyOX0.AZAff6_lSH12UnFrZvMNOFGprCAJR50-81MD8m48W6M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Testar conexão básica
    const { data, error } = await supabase.from('employees').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('📊 Número de funcionários na tabela:', data || 0);
    
    // Testar busca de funcionários
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .limit(5);
      
    if (employeesError) {
      console.error('❌ Erro ao buscar funcionários:', employeesError.message);
      return;
    }
    
    console.log('👥 Primeiros 5 funcionários:');
    employees.forEach(emp => console.log(`- ${emp.name} (${emp.department})`));
    
    // Testar tabela de comunicados
    const { data: announcements, error: announcementsError } = await supabase
      .from('announcements')
      .select('count', { count: 'exact', head: true });
      
    if (announcementsError) {
      console.error('❌ Erro ao acessar tabela de comunicados:', announcementsError.message);
    } else {
      console.log('📢 Número de comunicados na tabela:', announcements || 0);
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
}

testConnection();