/**
 * Serviço de integração com Supabase
 * Gerencia conexão e operações CRUD para funcionários e comunicados
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { type Employee } from '../hooks/useEmployeeSearch';
import { type Announcement } from '../utils/adminStorage';

// Tipos para o banco de dados
export interface DatabaseEmployee {
  id: string;
  name: string;
  extension: string;
  email?: string;
  department: string;
  lunch_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'alta' | 'média' | 'baixa';
  date: string;
  created_at?: string;
  updated_at?: string;
}

// Definição do schema do banco
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: DatabaseEmployee;
        Insert: Omit<DatabaseEmployee, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseEmployee, 'id' | 'created_at' | 'updated_at'>>;
      };
      announcements: {
        Row: DatabaseAnnouncement;
        Insert: Omit<DatabaseAnnouncement, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseAnnouncement, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

class SupabaseService {
  private supabase: SupabaseClient<Database> | null = null;
  private isInitialized = false;

  // Inicializar conexão com Supabase
  initialize() {
    // Evitar múltiplas inicializações
    if (this.isInitialized && this.supabase) {
      console.log('✅ Supabase já inicializado, reutilizando instância existente');
      return true;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Variáveis do Supabase não configuradas. Usando modo offline.');
        return false;
      }

      this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
      this.isInitialized = true;
      console.log('✅ Supabase inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar Supabase:', error);
      return false;
    }
  }

  // Verificar se está conectado
  isConnected(): boolean {
    return this.isInitialized && this.supabase !== null;
  }

  // === OPERAÇÕES DE FUNCIONÁRIOS ===

  // Buscar todos os funcionários
  async getEmployees(): Promise<Employee[]> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    try {
      const { data, error } = await this.supabase!
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;

      // Converter formato do banco para formato da aplicação
      return data.map(emp => ({
        id: emp.id,
        name: emp.name,
        extension: emp.extension,
        email: emp.email,
        department: emp.department,
        lunchTime: emp.lunch_time
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar funcionários:', error);
      throw error;
    }
  }

  // Adicionar funcionário
  async addEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    try {
      const { data, error } = await this.supabase!
        .from('employees')
        .insert({
          id: crypto.randomUUID(),
          name: employee.name,
          extension: employee.extension,
          email: employee.email,
          department: employee.department,
          lunch_time: employee.lunchTime
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        extension: data.extension,
        email: data.email,
        department: data.department,
        lunchTime: data.lunch_time
      };
    } catch (error) {
      console.error('❌ Erro ao adicionar funcionário:', error);
      throw error;
    }
  }

  // Atualizar funcionário
  async updateEmployee(id: string, updates: Partial<Omit<Employee, 'id'>>): Promise<Employee> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    try {
      const { data, error } = await this.supabase!
        .from('employees')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.extension && { extension: updates.extension }),
          ...(updates.email && { email: updates.email }),
          ...(updates.department && { department: updates.department }),
          ...(updates.lunchTime !== undefined && { lunch_time: updates.lunchTime })
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        extension: data.extension,
        email: data.email,
        department: data.department,
        lunchTime: data.lunch_time
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar funcionário:', error);
      throw error;
    }
  }

  // Remover funcionário
  async deleteEmployee(id: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    try {
      const { error } = await this.supabase!
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erro ao remover funcionário:', error);
      throw error;
    }
  }

  // === OPERAÇÕES DE COMUNICADOS ===

  // Buscar todos os comunicados
  async getAnnouncements(): Promise<Announcement[]> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    try {
      const { data, error } = await this.supabase!
        .from('announcements')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      return data.map(ann => ({
        id: ann.id,
        title: ann.title,
        content: ann.content,
        priority: ann.priority,
        date: ann.date,
        createdAt: ann.created_at,
        updatedAt: ann.updated_at
      }));
    } catch (error) {
      console.error('❌ Erro ao buscar comunicados:', error);
      throw error;
    }
  }

  // Adicionar comunicado
  async addAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    try {
      const { data, error } = await this.supabase!
        .from('announcements')
        .insert({
          id: crypto.randomUUID(),
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          date: announcement.date
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        priority: data.priority,
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('❌ Erro ao adicionar comunicado:', error);
      throw error;
    }
  }

  // Atualizar comunicado
  async updateAnnouncement(id: string, updates: Partial<Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Announcement> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    try {
      const { data, error } = await this.supabase!
        .from('announcements')
        .update({
          ...(updates.title && { title: updates.title }),
          ...(updates.content && { content: updates.content }),
          ...(updates.priority && { priority: updates.priority }),
          ...(updates.date && { date: updates.date })
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        priority: data.priority,
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar comunicado:', error);
      throw error;
    }
  }

  // Remover comunicado
  async deleteAnnouncement(id: string): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    try {
      const { error } = await this.supabase!
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erro ao remover comunicado:', error);
      throw error;
    }
  }

  // === OPERAÇÕES DE SINCRONIZAÇÃO ===

  // Sincronizar dados locais com Supabase
  async syncEmployeesToSupabase(localEmployees: Employee[]): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    try {
      console.log('🔄 Sincronizando funcionários com Supabase...');
      
      // Buscar funcionários existentes
      const { data: existingEmployees } = await this.supabase!
        .from('employees')
        .select('id');

      const existingIds = new Set(existingEmployees?.map(emp => emp.id) || []);

      // Inserir apenas funcionários que não existem
      const newEmployees = localEmployees.filter(emp => !existingIds.has(emp.id));

      if (newEmployees.length > 0) {
        const { error } = await this.supabase!
          .from('employees')
          .insert(newEmployees.map(emp => ({
            id: emp.id,
            name: emp.name,
            extension: emp.extension,
            email: emp.email,
            department: emp.department,
            lunch_time: emp.lunchTime
          })));

        if (error) throw error;
        console.log(`✅ ${newEmployees.length} funcionários sincronizados`);
      } else {
        console.log('✅ Todos os funcionários já estão sincronizados');
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar funcionários:', error);
      throw error;
    }
  }

  // Sincronizar comunicados locais com Supabase
  async syncAnnouncementsToSupabase(localAnnouncements: Announcement[]): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    try {
      console.log('🔄 Sincronizando comunicados com Supabase...');
      
      // Buscar comunicados existentes
      const { data: existingAnnouncements } = await this.supabase!
        .from('announcements')
        .select('id');

      const existingIds = new Set(existingAnnouncements?.map(ann => ann.id) || []);

      // Inserir apenas comunicados que não existem
      const newAnnouncements = localAnnouncements.filter(ann => !existingIds.has(ann.id));

      if (newAnnouncements.length > 0) {
        const { error } = await this.supabase!
          .from('announcements')
          .insert(newAnnouncements.map(ann => ({
            id: ann.id,
            title: ann.title,
            content: ann.content,
            priority: ann.priority,
            date: ann.date
          })));

        if (error) throw error;
        console.log(`✅ ${newAnnouncements.length} comunicados sincronizados`);
      } else {
        console.log('✅ Todos os comunicados já estão sincronizados');
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar comunicados:', error);
      throw error;
    }
  }
}

// Instância singleton
export const supabaseService = new SupabaseService();