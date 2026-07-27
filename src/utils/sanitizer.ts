import DOMPurify from 'dompurify';

/**
 * Utilitário para sanitização segura de inputs
 * Previne XSS, injection attacks e garante dados limpos
 */

// Configurações de sanitização por contexto
const SANITIZE_CONFIGS = {
  // Para textos simples (nomes, títulos)
  text: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  },
  
  // Para conteúdo com formatação básica (comunicados)
  richText: {
    ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  },
  
  // Para URLs (validação rigorosa)
  url: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  }
};

const removeControlCharacters = (value: string): string =>
  Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return !((code >= 0 && code <= 31) || (code >= 127 && code <= 159));
    })
    .join('');

export class InputSanitizer {
  /**
   * Sanitiza texto simples removendo todas as tags HTML
   */
  static sanitizeText(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove caracteres de controle
    let cleaned = removeControlCharacters(input);
    
    // Sanitiza com DOMPurify
    cleaned = DOMPurify.sanitize(cleaned, SANITIZE_CONFIGS.text);
    
    // Remove espaços extras e trim
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Limita tamanho (proteção contra DoS)
    return cleaned.substring(0, 1000);
  }

  /**
   * Sanitiza conteúdo com formatação básica permitida
   */
  static sanitizeRichText(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove caracteres de controle
    let cleaned = removeControlCharacters(input);
    
    // Sanitiza permitindo tags básicas
    cleaned = DOMPurify.sanitize(cleaned, SANITIZE_CONFIGS.richText);
    
    // Remove espaços extras em HTML
    cleaned = cleaned.replace(/>\s+</g, '><').trim();
    
    // Limita tamanho
    return cleaned.substring(0, 5000);
  }

  /**
   * Valida e sanitiza email
   */
  static sanitizeEmail(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove espaços e converte para lowercase
    let cleaned = input.trim().toLowerCase();
    
    // Sanitiza completamente
    cleaned = DOMPurify.sanitize(cleaned, SANITIZE_CONFIGS.text);
    
    // Validação básica de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleaned)) {
      return '';
    }
    
    return cleaned;
  }

  /**
   * Valida e sanitiza URL
   */
  static sanitizeURL(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove espaços
    let cleaned = input.trim();
    
    // Sanitiza completamente
    cleaned = DOMPurify.sanitize(cleaned, SANITIZE_CONFIGS.url);
    
    try {
      // Tenta criar URL para validação
      const url = new URL(cleaned);
      
      // Permite apenas HTTP/HTTPS
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }
      
      return url.toString();
    } catch {
      return '';
    }
  }

  /**
   * Sanitiza número de telefone/ramal
   */
  static sanitizePhone(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove tudo exceto números, espaços, parênteses e hífens
    let cleaned = input.replace(/[^\d\s()+-]/g, '');
    
    // Sanitiza
    cleaned = DOMPurify.sanitize(cleaned, SANITIZE_CONFIGS.text);
    
    // Remove espaços extras
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned.substring(0, 50);
  }

  /**
   * Sanitiza nome (pessoa, departamento, etc)
   */
  static sanitizeName(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove caracteres especiais, mantém letras, números, espaços e acentos
    let cleaned = input.replace(/[^\w\sÀ-ÿ]/g, '');
    
    // Sanitiza
    cleaned = DOMPurify.sanitize(cleaned, SANITIZE_CONFIGS.text);
    
    // Capitaliza palavras (primeira letra maiúscula)
    cleaned = cleaned.replace(/\b\w/g, l => l.toUpperCase());
    
    // Remove espaços extras
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned.substring(0, 100);
  }

  /**
   * Sanitização genérica para qualquer input
   */
  static sanitizeGeneric(input: unknown): string {
    if (input === null || input === undefined) {
      return '';
    }

    const str = String(input);
    return this.sanitizeText(str);
  }

  /**
   * Sanitiza objeto recursivamente
   */
  static sanitizeObject<T extends Record<string, unknown>>(obj: T, rules?: Record<keyof T, 'text' | 'richText' | 'email' | 'url' | 'phone' | 'name'>): T {
    const sanitized = {} as T;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        
        if (typeof value === 'string') {
          const rule = rules?.[key] || 'text';
          
          switch (rule) {
            case 'richText':
              sanitized[key] = this.sanitizeRichText(value) as T[Extract<keyof T, string>];
              break;
            case 'email':
              sanitized[key] = this.sanitizeEmail(value) as T[Extract<keyof T, string>];
              break;
            case 'url':
              sanitized[key] = this.sanitizeURL(value) as T[Extract<keyof T, string>];
              break;
            case 'phone':
              sanitized[key] = this.sanitizePhone(value) as T[Extract<keyof T, string>];
              break;
            case 'name':
              sanitized[key] = this.sanitizeName(value) as T[Extract<keyof T, string>];
              break;
            default:
              sanitized[key] = this.sanitizeText(value) as T[Extract<keyof T, string>];
          }
        } else {
          sanitized[key] = value as T[Extract<keyof T, string>];
        }
      }
    }

    return sanitized;
  }

  /**
   * Detecta possíveis tentativas de XSS
   */
  static detectXSS(input: string): { isXSS: boolean; patterns: string[] } {
    if (typeof input !== 'string') {
      return { isXSS: false, patterns: [] };
    }

    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:.*base64/i
    ];

    const detectedPatterns: string[] = [];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        detectedPatterns.push(pattern.toString());
      }
    }

    if (detectedPatterns.length > 0) {
      console.warn('🚨 Possível tentativa de XSS detectada:', {
        input: input.substring(0, 100) + '...',
        patterns: detectedPatterns,
        timestamp: new Date().toISOString()
      });
    }

    return {
      isXSS: detectedPatterns.length > 0,
      patterns: detectedPatterns
    };
  }
}

/**
 * Hook para sanitização de inputs
 */
export const useSanitizer = () => {
  const sanitizeText = (input: string) => InputSanitizer.sanitizeText(input);
  const sanitizeRichText = (input: string) => InputSanitizer.sanitizeRichText(input);
  const sanitizeEmail = (input: string) => InputSanitizer.sanitizeEmail(input);
  const sanitizeURL = (input: string) => InputSanitizer.sanitizeURL(input);
  const sanitizePhone = (input: string) => InputSanitizer.sanitizePhone(input);
  const sanitizeName = (input: string) => InputSanitizer.sanitizeName(input);
  const detectXSS = (input: string) => InputSanitizer.detectXSS(input);

  return {
    sanitizeText,
    sanitizeRichText,
    sanitizeEmail,
    sanitizeURL,
    sanitizePhone,
    sanitizeName,
    detectXSS
  };
};
