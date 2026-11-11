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
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseHrQuestion {
  id: string;
  name: string;
  question: string;
  status: 'nova' | 'visualizada' | 'resolvida';
  created_at: string;
  updated_at: string;
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
      hr_questions: {
        Row: DatabaseHrQuestion;
        Insert: Pick<DatabaseHrQuestion, 'name' | 'question'> & {
          id?: string;
          status?: DatabaseHrQuestion['status'];
        };
        Update: Partial<Pick<DatabaseHrQuestion, 'status'>>;
      };
    };
  };
}

class SupabaseService {
  private static readonly ANNOUNCEMENT_IMAGES_BUCKET = 'announcement-images';
  private supabase: SupabaseClient<Database> | null = null;
  private isInitialized = false;

  /**
   * Converte uma data no formato brasileiro (dd/mm/aa ou dd/mm/yyyy) para o formato ISO (YYYY-MM-DD)
   * Também aceita strings ISO ou objetos Date
   */
  private convertDateToISO(dateStr: string): string {
    // Se já está no formato ISO (YYYY-MM-DD), retorna como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    // Se está no formato ISO completo (com horário), extrai apenas a data
    if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
      return dateStr.split('T')[0];
    }

    // Se está no formato brasileiro dd/mm/aa ou dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{2,4}$/.test(dateStr)) {
      const [day, month, yearStr] = dateStr.split('/');
      
      // Se o ano tem 2 dígitos, assumir que é 20xx
      let year = yearStr;
      if (yearStr.length === 2) {
        year = `20${yearStr}`;
      }
      
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Tentar fazer parse como Date
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.error('Erro ao converter data:', e);
    }

    // Se tudo falhar, retorna a data atual
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Inicializar conexão com Supabase
  initialize() {
    // Evitar múltiplas inicializações
    if (this.isInitialized && this.supabase) {
      console.log('✅ Supabase já inicializado, reutilizando instância existente');
      return true;
    }

    try {
      console.log('🔧 SupabaseService: Iniciando inicialização...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      console.log('🔍 Verificando variáveis de ambiente:');
      console.log('- VITE_SUPABASE_URL:', supabaseUrl ? 'DEFINIDA' : 'NÃO DEFINIDA');
      console.log('- VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'DEFINIDA' : 'NÃO DEFINIDA');
      console.log('- URL completa:', supabaseUrl);

      if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️ Variáveis do Supabase não configuradas. Usando modo offline.');
        console.warn('⚠️ URL:', supabaseUrl);
        console.warn('⚠️ KEY:', supabaseKey ? 'PRESENTE' : 'AUSENTE');
        return false;
      }

      console.log('🚀 Criando cliente Supabase...');
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
      // Payload completo evita .update({}) (rejeitado) e trata extensão "0" / email vazio
      const { data, error } = await this.supabase!
        .from('employees')
        .update({
          name: updates.name!,
          extension: updates.extension!,
          email: updates.email && updates.email.trim() !== '' ? updates.email : null,
          department: updates.department!,
          lunch_time:
            updates.lunchTime !== undefined && updates.lunchTime !== null && String(updates.lunchTime).trim() !== ''
              ? updates.lunchTime
              : null
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
        image: ann.image_url || undefined,
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
      // Converter a data para o formato ISO esperado pelo Supabase
      const dateISO = this.convertDateToISO(announcement.date);

      console.log('📅 Convertendo data:', announcement.date, '->', dateISO);

      const { data, error } = await this.supabase!
        .from('announcements')
        .insert({
          id: crypto.randomUUID(),
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          date: dateISO,
          image_url: announcement.image || null
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase ao inserir comunicado:', error);
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        priority: data.priority,
        date: data.date,
        image: data.image_url || undefined,
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
      const updateData: Record<string, unknown> = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.image !== undefined) updateData.image_url = updates.image || null;
      if (updates.date !== undefined && updates.date !== null && updates.date !== '') {
        updateData.date = this.convertDateToISO(updates.date);
        console.log('📅 Convertendo data na atualização:', updates.date, '->', updateData.date);
      }

      if (Object.keys(updateData).length === 0) {
        throw new Error('Nenhum campo para atualizar no comunicado');
      }

      const { data, error } = await this.supabase!
        .from('announcements')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro do Supabase ao atualizar comunicado:', error);
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        priority: data.priority,
        date: data.date,
        image: data.image_url || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar comunicado:', error);
      throw error;
    }
  }

  async uploadAnnouncementImage(file: File): Promise<string> {
    if (!this.isConnected()) {
      throw new Error('Supabase não inicializado');
    }

    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
    };
    const extension = extensions[file.type];

    if (!extension) {
      throw new Error('Formato não permitido. Use PNG ou JPG.');
    }

    if (file.size > 3 * 1024 * 1024) {
      throw new Error('A imagem deve ter no máximo 3 MB.');
    }

    const filePath = `${crypto.randomUUID()}.${extension}`;
    const { error } = await this.supabase!.storage
      .from(SupabaseService.ANNOUNCEMENT_IMAGES_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      throw new Error(`Falha ao enviar imagem: ${error.message}`);
    }

    const { data } = this.supabase!.storage
      .from(SupabaseService.ANNOUNCEMENT_IMAGES_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
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
            date: this.convertDateToISO(ann.date),
            image_url: ann.image?.startsWith('http') ? ann.image : null
          })));

        if (error) {
          console.error('❌ Erro do Supabase ao sincronizar:', error);
          throw error;
        }
        console.log(`✅ ${newAnnouncements.length} comunicados sincronizados`);
      } else {
        console.log('✅ Todos os comunicados já estão sincronizados');
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar comunicados:', error);
      throw error;
    }
  }

  // === OPERAÇÕES DE RH/DP ===

  async addHrQuestion(name: string, question: string): Promise<void> {
    if (!this.initialize()) throw new Error('Supabase não inicializado');

    const { error } = await this.supabase!
      .from('hr_questions')
      .insert({ name, question });

    if (error) throw error;
  }

  async getHrQuestions(): Promise<DatabaseHrQuestion[]> {
    if (!this.initialize()) throw new Error('Supabase não inicializado');

    const { data, error } = await this.supabase!
      .from('hr_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateHrQuestionStatus(
    id: string,
    status: DatabaseHrQuestion['status'],
  ): Promise<void> {
    if (!this.initialize()) throw new Error('Supabase não inicializado');

    const { error } = await this.supabase!
      .from('hr_questions')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  }
}

// Instância singleton
export const supabaseService = new SupabaseService();
