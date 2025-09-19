import { useState, useEffect } from 'react';
import { AdminStorage, type Announcement, useAdminStorage } from '../utils/adminStorage';
import { supabaseService } from '../utils/supabaseService';
import { useToast } from '@/components/ui/use-toast';

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const adminStorage = useAdminStorage();
  const { toast } = useToast();

  // Inicializar Supabase e carregar comunicados
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      try {
        // Tentar inicializar Supabase
        const supabaseInitialized = supabaseService.initialize();
        setIsSupabaseConnected(supabaseInitialized);

        if (supabaseInitialized) {
          console.log('🔄 Carregando comunicados do Supabase...');

          try {
            // Carregar dados do Supabase
            const supabaseAnnouncements = await supabaseService.getAnnouncements();

            if (supabaseAnnouncements.length > 0) {
              setAnnouncements(supabaseAnnouncements);
              // Sincronizar com adminStorage como backup
              adminStorage.saveAnnouncements(supabaseAnnouncements);
              console.log(`✅ ${supabaseAnnouncements.length} comunicados carregados do Supabase`);
            } else {
              // Se Supabase estiver vazio, migrar dados locais
              await migrateLocalDataToSupabase();
            }
          } catch (supabaseError) {
            console.warn('⚠️ Erro ao carregar do Supabase, usando dados locais:', supabaseError);
            loadFromLocalStorage();
          }
        } else {
          console.log('📱 Modo offline - usando adminStorage');
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Carregar dados do adminStorage (localStorage criptografado)
  const loadFromLocalStorage = () => {
    try {
      // Verificar integridade dos dados primeiro
      const isValid = adminStorage.validateData();

      if (!isValid) {
        console.warn('⚠️ Dados corrompidos detectados, restaurando backup...');
        const backup = adminStorage.restoreFromBackup();
        if (backup) {
          setAnnouncements(backup);
          adminStorage.saveAnnouncements(backup);
        } else {
          console.log('🔄 Backup não disponível, usando dados padrão');
          const defaultData = adminStorage.resetToDefault();
          setAnnouncements(defaultData);
        }
      } else {
        // Carregar dados normalmente
        const loadedAnnouncements = adminStorage.loadAnnouncements();
        setAnnouncements(loadedAnnouncements);
      }
    } catch (error) {
      console.error('❌ Erro crítico ao carregar comunicados:', error);
      // Fallback para dados padrão em caso de erro crítico
      const defaultData = adminStorage.resetToDefault();
      setAnnouncements(defaultData);
    }
  };

  // Migrar dados locais para Supabase
  const migrateLocalDataToSupabase = async () => {
    try {
      const localAnnouncements = adminStorage.loadAnnouncements();

      if (localAnnouncements.length > 0) {
        console.log('🔄 Migrando comunicados locais para Supabase...');
        await supabaseService.syncAnnouncementsToSupabase(localAnnouncements);

        // Recarregar do Supabase após migração
        const supabaseAnnouncements = await supabaseService.getAnnouncements();
        setAnnouncements(supabaseAnnouncements);

        toast({
          title: "✅ Migração Concluída",
          description: "Comunicados locais foram migrados para o Supabase com sucesso.",
        });
      } else {
        console.log('📋 Nenhum comunicado local para migrar');
        const defaultData = adminStorage.resetToDefault();
        setAnnouncements(defaultData);
      }
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      loadFromLocalStorage();
    }
  };

  // Atualizar comunicados com validação e backup automático
  const updateAnnouncements = async (newAnnouncements: Announcement[]) => {
    try {
      // Validar dados antes de salvar
      const isValid = newAnnouncements.every(ann =>
        ann.id && ann.title && ann.content && ann.priority && ann.date
      );

      if (!isValid) {
        console.error('❌ Dados inválidos detectados, operação cancelada');
        return false;
      }

      // Atualizar estado local
      setAnnouncements(newAnnouncements);

      // Sempre salvar com backup automático no adminStorage
      const localSuccess = adminStorage.saveAnnouncements(newAnnouncements);

      if (!localSuccess) {
        console.error('❌ Falha ao salvar comunicados localmente');
        return false;
      }

      // Se Supabase estiver conectado, sincronizar também
      if (isSupabaseConnected) {
        try {
          await supabaseService.syncAnnouncementsToSupabase(newAnnouncements);
          console.log('✅ Comunicados sincronizados com Supabase');
        } catch (supabaseError) {
          console.warn('⚠️ Erro ao sincronizar com Supabase (dados salvos localmente):', supabaseError);
          // Continua mesmo se o Supabase falhar, pois dados estão salvos localmente
        }
      }

      console.log('✅ Comunicados atualizados com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar comunicados:', error);
      return false;
    }
  };

  // Adicionar novo comunicado
  const addAnnouncement = async (announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      if (isSupabaseConnected) {
        // Adicionar no Supabase
        const newAnnouncement = await supabaseService.addAnnouncement(announcementData);
        const updatedAnnouncements = [newAnnouncement, ...announcements];

        setAnnouncements(updatedAnnouncements);
        adminStorage.saveAnnouncements(updatedAnnouncements);

        toast({
          title: "✅ Comunicado Adicionado",
          description: `"${announcementData.title}" foi adicionado com sucesso no Supabase.`,
        });
      } else {
        // Modo offline - adicionar apenas localmente
        const now = new Date();
        const newAnnouncement: Announcement = {
          id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...announcementData,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };

        const updatedAnnouncements = [newAnnouncement, ...announcements];
        setAnnouncements(updatedAnnouncements);
        adminStorage.saveAnnouncements(updatedAnnouncements);

        toast({
          title: "✅ Comunicado Adicionado (Offline)",
          description: `"${announcementData.title}" foi adicionado localmente.`,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar comunicado:', error);
      toast({
        title: "❌ Erro ao Adicionar",
        description: "Não foi possível adicionar o comunicado.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Atualizar comunicado existente
  const updateAnnouncement = async (id: string, updates: Partial<Announcement>): Promise<boolean> => {
    try {
      if (isSupabaseConnected) {
        // Atualizar no Supabase
        const updatedAnnouncement = await supabaseService.updateAnnouncement(id, updates);
        const updatedAnnouncements = announcements.map(ann =>
          ann.id === id ? updatedAnnouncement : ann
        );

        setAnnouncements(updatedAnnouncements);
        adminStorage.saveAnnouncements(updatedAnnouncements);

        toast({
          title: "✅ Comunicado Atualizado",
          description: `"${updatedAnnouncement.title}" foi atualizado com sucesso.`,
        });
      } else {
        // Modo offline - atualizar apenas localmente
        const updatedAnnouncements = announcements.map(ann =>
          ann.id === id ? { ...ann, ...updates, updatedAt: new Date().toISOString() } : ann
        );

        setAnnouncements(updatedAnnouncements);
        adminStorage.saveAnnouncements(updatedAnnouncements);

        toast({
          title: "✅ Comunicado Atualizado (Offline)",
          description: "Comunicado foi atualizado localmente.",
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar comunicado:', error);
      toast({
        title: "❌ Erro ao Atualizar",
        description: "Não foi possível atualizar o comunicado.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remover comunicado
  const deleteAnnouncement = async (id: string): Promise<boolean> => {
    try {
      const announcementToDelete = announcements.find(ann => ann.id === id);

      if (isSupabaseConnected) {
        // Remover do Supabase
        await supabaseService.deleteAnnouncement(id);
      }

      // Remover localmente
      const updatedAnnouncements = announcements.filter(ann => ann.id !== id);
      setAnnouncements(updatedAnnouncements);
      adminStorage.saveAnnouncements(updatedAnnouncements);

      toast({
        title: "🗑️ Comunicado Removido",
        description: `"${announcementToDelete?.title}" foi excluído com sucesso.`,
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao remover comunicado:', error);
      toast({
        title: "❌ Erro ao Remover",
        description: "Não foi possível remover o comunicado.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Resetar para dados padrão com confirmação
  const resetAnnouncements = () => {
    try {
      const defaultData = adminStorage.resetToDefault();
      setAnnouncements(defaultData);
      console.log('🔄 Comunicados resetados para padrão');
      return true;
    } catch (error) {
      console.error('❌ Erro ao resetar comunicados:', error);
      return false;
    }
  };

  // Exportar dados para backup manual
  const exportData = () => {
    try {
      return adminStorage.exportData();
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      return null;
    }
  };

  // Importar dados de backup manual
  const importData = (jsonData: string) => {
    try {
      const success = adminStorage.importData(jsonData);
      if (success) {
        // Recarregar dados após importação
        const importedAnnouncements = adminStorage.loadAnnouncements();
        setAnnouncements(importedAnnouncements);
        console.log('📥 Dados importados e aplicados com sucesso');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao importar dados:', error);
      return false;
    }
  };

  // Restaurar do backup automático
  const restoreFromBackup = () => {
    try {
      const backup = adminStorage.restoreFromBackup();
      if (backup) {
        setAnnouncements(backup);
        adminStorage.saveAnnouncements(backup);
        console.log('🔄 Backup restaurado com sucesso');
        return true;
      } else {
        console.warn('⚠️ Nenhum backup disponível');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao restaurar backup:', error);
      return false;
    }
  };

  return {
    announcements,
    isLoading,
    isSupabaseConnected,
    updateAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    resetAnnouncements,
    exportData,
    importData,
    restoreFromBackup,
    validateData: adminStorage.validateData
  };
};

// Exportar tipo para uso em outros componentes
export type { Announcement };