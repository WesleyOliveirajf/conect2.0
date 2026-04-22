import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type Employee } from './useEmployeeSearch';
import { supabaseService } from '@/utils/supabaseService';

const STORAGE_KEY = 'torp_employees';
const ENABLE_AUTO_MIGRATION = (import.meta as any).env?.VITE_ENABLE_AUTO_MIGRATION === 'true';

// Função para gerar ID único
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Dados padrão dos funcionários
const DEFAULT_EMPLOYEES: Employee[] = [
  // GENTE E GESTÃO
  { id: generateId(), name: "Flávia (Diretora)", extension: "4723", email: "xxx", department: "Gente e Gestão" },
  { id: generateId(), name: "Bruno (RH)", extension: "4727", email: "bruno.oliveira@torp.ind.br", department: "Gente e Gestão", lunchTime: "12:00-13:00" },
  { id: generateId(), name: "Fabiane (Enfermagem)", extension: "4805", email: "fabiane.lourenco@torp.ind.br", department: "Gente e Gestão", lunchTime: "12:00-13:00" },
  
  // SALAS
  { id: generateId(), name: "Sala de Reuniões", extension: "4724", email: "xxx", department: "Salas" },
  
  // ADMINISTRATIVO
  { id: generateId(), name: "Ediane (Financeiro)", extension: "4713", email: "ediane.costa@torp.ind.br", department: "Administrativo", lunchTime: "12:00-13:00" },
  { id: generateId(), name: "Michele (Fiscal)", extension: "4729", email: "fiscal@torp.ind.br", department: "Administrativo", lunchTime: "11:00-12:00" },
  { id: generateId(), name: "Jussara Inácio (Recepção)", extension: "4701", email: "jussara.inacio@torp.ind.br", department: "Administrativo", lunchTime: "11:30-13:00" },
  { id: generateId(), name: "Fernanda (Faturamento)", extension: "4737", email: "fernanda.faturamento@torp.com", department: "Administrativo", lunchTime: "12:30-14:00" },
  { id: generateId(), name: "Tatiana (DP)", extension: "4728", email: "tatiana.guimaraes@torp.ind.br", department: "Administrativo", lunchTime: "12:30-13:30" },
  
  // PORTARIA
  { id: generateId(), name: "Carlos Silva (Porteiro)", extension: "4700", email: "portaria@torp.ind.br", department: "Portaria", lunchTime: "12:00-13:00" },
  { id: generateId(), name: "Ana Costa (Entrada Principal)", extension: "4702", email: "entrada@torp.ind.br", department: "Portaria", lunchTime: "13:00-14:00" },
  
  // COMERCIAL
  { id: generateId(), name: "Carlos Eduardo (Supervisor Operações)", extension: "4717", email: "carloseduardo.oliveira@torp.ind.br", department: "Comercial" },
  { id: generateId(), name: "Khendry", extension: "4714", email: "khendry.mendonca@torp.ind.br", department: "Comercial", lunchTime: "12:00-13:00" },
  { id: generateId(), name: "Marcus", extension: "4732", email: "marcos.teixeira@torp.ind.br", department: "Comercial", lunchTime: "11:00-12:00" },
  
  // CONTROLADORIA
  { id: generateId(), name: "Vinícius", extension: "4705", email: "vinicius.reis@torp.ind.br", department: "Controladoria", lunchTime: "12:30-13:30" },
  
  // MARKETING
  { id: generateId(), name: "Alice", extension: "4718", email: "alice.abreu@torp.ind.br", department: "Marketing", lunchTime: "12:00-13:00" },
  
  // TI
  { id: generateId(), name: "Wesley Oliveira", extension: "4722", email: "wesley.oliveira@torp.ind.br", department: "TI", lunchTime: "12:30-13:30" },
  
  // PCP
  { id: generateId(), name: "João Silva (PCP)", extension: "4750", email: "joao.silva@torp.ind.br", department: "PCP", lunchTime: "12:00-13:00" },
  { id: generateId(), name: "Maria Santos (PCP)", extension: "4751", email: "maria.santos@torp.ind.br", department: "PCP", lunchTime: "11:30-12:30" },
  
  // COMPRAS/PREFEITURA
  { id: generateId(), name: "Felipe (Supervisor Operações)", extension: "4708", email: "felipe.marciano@torp.ind.br", department: "Compras/Prefeitura", lunchTime: "13:00-14:00" },
  
  // SALA DE CARTELA
  { id: generateId(), name: "Sala de Cartela", extension: "4709", email: "xxx", department: "Salas" },
];

export interface EmployeeFormData {
  name: string;
  extension: string;
  email?: string;
  department: string;
  lunchTime?: string;
}

export const useEmployeeManager = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const { toast } = useToast();

  // Função para garantir que todos os funcionários tenham IDs
  const ensureEmployeeIds = (employees: Employee[]): Employee[] => {
    return employees.map(emp => ({
      ...emp,
      id: emp.id || generateId()
    }));
  };

  // Inicializar Supabase e carregar dados
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 useEmployeeManager: Iniciando inicialização...');
      setIsLoading(true);
      
      try {
        // Tentar inicializar Supabase
        console.log('🔧 Tentando inicializar Supabase...');
        const supabaseInitialized = supabaseService.initialize();
        setIsSupabaseConnected(supabaseInitialized);
        console.log('📊 Supabase inicializado:', supabaseInitialized);

        if (supabaseInitialized) {
          console.log('🔄 Carregando funcionários do Supabase...');
          
          try {
            // Carregar dados do Supabase
            const supabaseEmployees = await supabaseService.getEmployees();
            console.log('📥 Funcionários recebidos do Supabase:', supabaseEmployees.length);
            console.log('📋 Dados dos funcionários:', supabaseEmployees);
            
            if (supabaseEmployees.length > 0) {
              setEmployees(supabaseEmployees);
              // Sincronizar com localStorage como backup
              localStorage.setItem(STORAGE_KEY, JSON.stringify(supabaseEmployees));
              console.log(`✅ ${supabaseEmployees.length} funcionários carregados do Supabase`);
            } else {
              console.log('📭 Supabase retornou 0 funcionários');
              // Supabase vazio: decidir migrar ou usar dados locais conforme flag
              if (ENABLE_AUTO_MIGRATION) {
                console.log('🔄 Migração automática habilitada, migrando dados locais...');
                await migrateLocalDataToSupabase();
              } else {
                console.log('ℹ️ Supabase vazio e migração automática desativada, carregando dados locais');
                loadFromLocalStorage();
              }
            }
          } catch (supabaseError) {
            console.error('⚠️ Erro ao carregar do Supabase:', supabaseError);
            console.log('📱 Fallback: carregando dados locais');
            loadFromLocalStorage();
          }
        } else {
          console.log('📱 Modo offline - usando localStorage');
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
        console.log('🏁 Inicialização concluída');
      }
    };

    initializeData();
  }, []);

  // Carregar dados do localStorage
  const loadFromLocalStorage = () => {
    try {
      console.log('[useEmployeeManager] 🔍 Verificando dados no localStorage...');
      const storedEmployees = localStorage.getItem(STORAGE_KEY);
      if (storedEmployees) {
        const parsed = JSON.parse(storedEmployees);
        const employeesWithIds = ensureEmployeeIds(parsed);
        console.log(`[useEmployeeManager] ✅ Encontrados ${employeesWithIds.length} funcionários no localStorage`);
        console.log('[useEmployeeManager] Primeiros 3 funcionários:', employeesWithIds.slice(0, 3).map(emp => ({ name: emp.name, department: emp.department })));
        setEmployees(employeesWithIds);
        // Salvar de volta com IDs se necessário
        if (employeesWithIds.some((emp, index) => emp.id !== parsed[index]?.id)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(employeesWithIds));
          console.log(`[useEmployeeManager] 💾 Salvos ${employeesWithIds.length} funcionários no localStorage`);
        }
      } else {
        console.log('[useEmployeeManager] ⚠️ Nenhum dado encontrado no localStorage, usando dados padrão');
        const employeesWithIds = ensureEmployeeIds(DEFAULT_EMPLOYEES);
        setEmployees(employeesWithIds);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(employeesWithIds));
        console.log(`[useEmployeeManager] 💾 Salvos ${employeesWithIds.length} funcionários padrão no localStorage`);
      }
    } catch (error) {
      console.error('[useEmployeeManager] ❌ Erro ao carregar funcionários:', error);
      const employeesWithIds = ensureEmployeeIds(DEFAULT_EMPLOYEES);
      setEmployees(employeesWithIds);
    }
  };

  // Migrar dados locais para Supabase
  const migrateLocalDataToSupabase = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const localEmployees = stored ? JSON.parse(stored) : DEFAULT_EMPLOYEES;
      
      console.log('🔄 Migrando dados locais para Supabase...');
      await supabaseService.syncEmployeesToSupabase(localEmployees);
      
      // Recarregar do Supabase após migração
      const supabaseEmployees = await supabaseService.getEmployees();
      setEmployees(supabaseEmployees);
      
      toast({
        title: "✅ Migração Concluída",
        description: "Dados locais foram migrados para o Supabase com sucesso.",
      });
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      loadFromLocalStorage();
    }
  };

  // Salvar funcionários (Supabase + localStorage como backup)
  const saveEmployees = async (newEmployees: Employee[]) => {
    try {
      // Sempre salvar no localStorage como backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEmployees));
      setEmployees(newEmployees);
      
      // Se Supabase estiver conectado, não precisamos fazer nada aqui
      // pois as operações individuais já salvam no Supabase
      console.log('💾 Funcionários salvos localmente');
    } catch (error) {
      console.error('❌ Erro ao salvar funcionários:', error);
      toast({
        title: "❌ Erro ao Salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  // Adicionar novo funcionário
  const addEmployee = async (employeeData: EmployeeFormData): Promise<boolean> => {
    try {
      // Removida a validação de email duplicado - emails podem ser iguais

      if (isSupabaseConnected) {
        // Adicionar no Supabase
        const newEmployee = await supabaseService.addEmployee(employeeData);
        const updatedEmployees = [...employees, newEmployee];
        await saveEmployees(updatedEmployees);
        
        toast({
          title: "✅ Funcionário Adicionado",
          description: `${employeeData.name} foi adicionado com sucesso no Supabase.`,
        });
      } else {
        // Modo offline - adicionar apenas localmente
        const newEmployee: Employee = {
          id: generateId(),
          ...employeeData,
          lunchTime: employeeData.lunchTime || undefined,
        };
        const updatedEmployees = [...employees, newEmployee];
        await saveEmployees(updatedEmployees);
        
        toast({
          title: "✅ Funcionário Adicionado (Offline)",
          description: `${employeeData.name} foi adicionado localmente.`,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar funcionário:', error);
      toast({
        title: "❌ Erro ao Adicionar",
        description: "Não foi possível adicionar o funcionário.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Editar funcionário existente
  const updateEmployee = async (id: string, employeeData: EmployeeFormData): Promise<boolean> => {
    try {
      const index = employees.findIndex(emp => emp.id === id);
      if (index === -1) {
        toast({
          title: "❌ Erro ao Atualizar",
          description: "Funcionário não encontrado.",
          variant: "destructive",
        });
        return false;
      }

      // Removida a validação de email duplicado - emails podem ser iguais

      if (isSupabaseConnected) {
        // Atualizar no Supabase
        const updatedEmployee = await supabaseService.updateEmployee(id, employeeData);
        const updatedEmployees = [...employees];
        updatedEmployees[index] = updatedEmployee;
        await saveEmployees(updatedEmployees);
        
        toast({
          title: "✅ Funcionário Atualizado",
          description: `${employeeData.name} foi atualizado com sucesso no Supabase.`,
        });
      } else {
        // Modo offline - atualizar apenas localmente
        const updatedEmployees = [...employees];
        updatedEmployees[index] = {
          ...updatedEmployees[index],
          ...employeeData,
          lunchTime: employeeData.lunchTime || undefined,
        };
        await saveEmployees(updatedEmployees);
        
        toast({
          title: "✅ Funcionário Atualizado (Offline)",
          description: `${employeeData.name} foi atualizado localmente.`,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar funcionário:', error);
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o funcionário.";
      toast({
        title: "❌ Erro ao Atualizar",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  // Remover funcionário
  const removeEmployee = async (id: string): Promise<boolean> => {
    try {
      const employeeToRemove = employees.find(emp => emp.id === id);
      if (!employeeToRemove) {
        toast({
          title: "❌ Erro ao Remover",
          description: "Funcionário não encontrado.",
          variant: "destructive",
        });
        return false;
      }

      if (isSupabaseConnected) {
        // Remover do Supabase
        await supabaseService.deleteEmployee(id);
        const updatedEmployees = employees.filter(emp => emp.id !== id);
        await saveEmployees(updatedEmployees);
        
        toast({
          title: "✅ Funcionário Removido",
          description: `${employeeToRemove.name} foi removido com sucesso do Supabase.`,
        });
      } else {
        // Modo offline - remover apenas localmente
        const updatedEmployees = employees.filter(emp => emp.id !== id);
        await saveEmployees(updatedEmployees);
        
        toast({
          title: "✅ Funcionário Removido (Offline)",
          description: `${employeeToRemove.name} foi removido localmente.`,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao remover funcionário:', error);
      toast({
        title: "❌ Erro ao Remover",
        description: "Não foi possível remover o funcionário.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Resetar para dados padrão
  const resetToDefault = () => {
    try {
      saveEmployees(DEFAULT_EMPLOYEES);
      toast({
        title: "✅ Dados Resetados",
        description: "Lista de funcionários foi resetada para os dados padrão.",
      });
    } catch (error) {
      console.error('Erro ao resetar funcionários:', error);
      toast({
        title: "❌ Erro ao Resetar",
        description: "Não foi possível resetar os dados.",
        variant: "destructive",
      });
    }
  };

  // Exportar dados
  const exportEmployees = (): string | null => {
    try {
      return JSON.stringify(employees, null, 2);
    } catch (error) {
      console.error('Erro ao exportar funcionários:', error);
      return null;
    }
  };

  // Importar dados
  const importEmployees = (jsonData: string): boolean => {
    try {
      const importedEmployees = JSON.parse(jsonData);
      
      // Validar estrutura dos dados
      if (!Array.isArray(importedEmployees)) {
        throw new Error('Dados devem ser um array');
      }

      // Validar cada funcionário
      for (const emp of importedEmployees) {
        if (!emp.name || !emp.extension || !emp.department) {
          throw new Error('Dados de funcionário inválidos');
        }
      }

      saveEmployees(importedEmployees);
      toast({
        title: "✅ Dados Importados",
        description: `${importedEmployees.length} funcionários foram importados com sucesso.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao importar funcionários:', error);
      toast({
        title: "❌ Erro na Importação",
        description: "Arquivo inválido ou corrompido.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Obter departamentos únicos
  const getDepartments = (): string[] => {
    const departments = employees.map(emp => emp.department);
    return [...new Set(departments)].sort();
  };

  return {
    employees,
    isLoading,
    isSupabaseConnected,
    addEmployee,
    updateEmployee,
    removeEmployee,
    deleteEmployee: removeEmployee, // Alias para compatibilidade
    resetToDefault,
    exportEmployees,
    importEmployees,
    getDepartments,
  };
};