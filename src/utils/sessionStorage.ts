import { setEncryptedStorage, getEncryptedStorage, removeEncryptedStorage } from './encryption';

interface AdminSession {
  isAuthenticated: boolean;
  loginTime: string;
  lastActivity: string;
  sessionId: string;
}

const SESSION_KEY = 'torp_admin_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos em milliseconds

export class SecureSessionManager {
  private static activeSessionId: string | null = null;

  /**
   * Gera um ID de sessão único
   */
  private static generateSessionId(): string {
    return crypto.randomUUID ? 
      crypto.randomUUID() : 
      Date.now().toString(36) + Math.random().toString(36);
  }

  /**
   * Cria uma nova sessão administrativa
   */
  static createSession(): AdminSession {
    const session: AdminSession = {
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      sessionId: this.generateSessionId()
    };

    setEncryptedStorage(SESSION_KEY, session);
    this.activeSessionId = session.sessionId;
    console.log('🔐 Nova sessão administrativa criada');
    return session;
  }

  /**
   * Verifica se a sessão atual é válida
   */
  static isValidSession(): boolean {
    try {
      const session = getEncryptedStorage<AdminSession>(SESSION_KEY);
      
      if (!session || !session.isAuthenticated || session.sessionId !== this.activeSessionId) {
        return false;
      }

      const lastActivity = new Date(session.lastActivity);
      const now = new Date();
      const timeDiff = now.getTime() - lastActivity.getTime();

      if (timeDiff > SESSION_TIMEOUT) {
        console.log('⏰ Sessão expirada');
        this.destroySession();
        return false;
      }

      // Atualizar última atividade
      this.updateActivity();
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
      // Limpa dados corrompidos em caso de erro
      this.destroySession();
      return false;
    }
  }

  /**
   * Atualiza o timestamp da última atividade
   */
  static updateActivity(): void {
    try {
      const session = getEncryptedStorage<AdminSession>(SESSION_KEY);
      if (session) {
        session.lastActivity = new Date().toISOString();
        setEncryptedStorage(SESSION_KEY, session);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade da sessão:', error);
    }
  }

  /**
   * Obtém informações da sessão atual
   */
  static getSessionInfo(): AdminSession | null {
    try {
      const session = getEncryptedStorage<AdminSession>(SESSION_KEY);
      return session?.sessionId === this.activeSessionId ? session : null;
    } catch (error) {
      console.error('❌ Erro ao obter informações da sessão:', error);
      return null;
    }
  }

  /**
   * Destrói a sessão atual
   */
  static destroySession(): void {
    this.activeSessionId = null;
    removeEncryptedStorage(SESSION_KEY);
    console.log('🔓 Sessão administrativa destruída');
  }

  /**
   * Verifica o tempo restante da sessão em minutos
   */
  static getRemainingTime(): number {
    try {
      const session = getEncryptedStorage<AdminSession>(SESSION_KEY);
      if (!session || session.sessionId !== this.activeSessionId) return 0;

      const lastActivity = new Date(session.lastActivity);
      const now = new Date();
      const timeDiff = now.getTime() - lastActivity.getTime();
      const remaining = SESSION_TIMEOUT - timeDiff;

      return Math.max(0, Math.floor(remaining / (1000 * 60))); // Retorna em minutos
    } catch (error) {
      console.error('❌ Erro ao calcular tempo restante:', error);
      return 0;
    }
  }

  /**
   * Renova a sessão (estende o timeout)
   */
  static renewSession(): boolean {
    try {
      if (this.isValidSession()) {
        this.updateActivity();
        console.log('🔄 Sessão renovada');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao renovar sessão:', error);
      return false;
    }
  }
}

/**
 * Hook para gerenciar sessão administrativa
 */
export const useSecureSession = () => {
  const login = () => {
    return SecureSessionManager.createSession();
  };

  const logout = () => {
    SecureSessionManager.destroySession();
  };

  const isAuthenticated = () => {
    return SecureSessionManager.isValidSession();
  };

  const getSessionInfo = () => {
    return SecureSessionManager.getSessionInfo();
  };

  const getRemainingTime = () => {
    return SecureSessionManager.getRemainingTime();
  };

  const renewSession = () => {
    return SecureSessionManager.renewSession();
  };

  return {
    login,
    logout,
    isAuthenticated,
    getSessionInfo,
    getRemainingTime,
    renewSession
  };
};
