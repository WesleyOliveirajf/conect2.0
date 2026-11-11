/**
 * Serviço de busca simples e eficaz para funcionários
 * Substituindo RAG complexo por busca direta nos dados locais
 */

export interface Employee {
  id: string;
  name: string;
  extension: string;
  email?: string;
  department: string;
  lunchTime?: string;
}

export interface EmployeeSearchResult {
  employees: Employee[];
  totalCount: number;
  departmentCounts: Record<string, number>;
  searchType: 'name' | 'department' | 'extension' | 'email' | 'count' | 'general';
  searchTerm: string;
}

class EmployeeSearchService {
  private employees: Employee[] = [];

  /**
   * Carrega funcionários do localStorage
   */
  loadEmployees(): void {
    try {
      const stored = localStorage.getItem('torp_employees');
      if (stored) {
        this.employees = JSON.parse(stored);
        console.log(`[EmployeeSearch] ✅ Carregados ${this.employees.length} funcionários`);
      } else {
        console.warn('[EmployeeSearch] ⚠️ Nenhum funcionário encontrado no localStorage');
        this.employees = [];
      }
    } catch (error) {
      console.error('[EmployeeSearch] ❌ Erro ao carregar funcionários:', error);
      this.employees = [];
    }
  }

  /**
   * Busca inteligente de funcionários com análise de consulta
   */
  search(query: string): EmployeeSearchResult {
    this.loadEmployees(); // Sempre carregar dados atualizados

    if (!query.trim()) {
      return this.getAllEmployees();
    }

    const queryLower = query.toLowerCase().trim();
    console.log(`[EmployeeSearch] 🔍 Buscando: "${queryLower}"`);

    // Análise do tipo de consulta
    const searchType = this.analyzeQuery(queryLower);
    let filteredEmployees: Employee[] = [];

    switch (searchType) {
      case 'count':
        filteredEmployees = this.handleCountQuery(queryLower);
        break;
      case 'department':
        filteredEmployees = this.searchByDepartment(queryLower);
        break;
      case 'extension':
        filteredEmployees = this.searchByExtension(queryLower);
        break;
      case 'email':
        filteredEmployees = this.searchByEmail(queryLower);
        break;
      case 'name':
        filteredEmployees = this.searchByName(queryLower);
        break;
      default:
        filteredEmployees = this.searchGeneral(queryLower);
    }

    const result = this.formatResult(filteredEmployees, searchType, query);
    console.log(`[EmployeeSearch] ✅ Encontrados ${result.totalCount} funcionários (${searchType})`);

    return result;
  }

  /**
   * Analisa o tipo de consulta para otimizar a busca
   */
  private analyzeQuery(query: string): EmployeeSearchResult['searchType'] {
    // Consultas sobre quantidade/contagem
    if (/\b(quantos?|quantidade|total|número|conta)\b/.test(query)) {
      return 'count';
    }

    // Consultas sobre departamentos específicos
    if (/\b(ti|comercial|administrativo|gente\s+e\s+gestão|marketing|controladoria|compras|prefeitura|salas?)\b/.test(query)) {
      return 'department';
    }

    // Consultas sobre ramais (números de 4 dígitos começando com 4)
    if (/\b4\d{3}\b/.test(query)) {
      return 'extension';
    }

    // Consultas sobre email
    if (/@|email|e-mail/.test(query)) {
      return 'email';
    }

    // Consultas por nome específico
    if (this.employees.some(emp =>
      emp.name.toLowerCase().includes(query) &&
      emp.name.toLowerCase().split(' ').some(part => part.startsWith(query))
    )) {
      return 'name';
    }

    return 'general';
  }

  /**
   * Manipula consultas sobre contagem
   */
  private handleCountQuery(query: string): Employee[] {
    const departmentMatch = query.match(/\b(ti|comercial|administrativo|gente\s+e\s+gestão|marketing|controladoria|compras|prefeitura|salas?)\b/);

    if (departmentMatch) {
      return this.searchByDepartment(departmentMatch[0]);
    }

    // Retorna todos para contagem geral
    return this.employees;
  }

  /**
   * Busca por departamento
   */
  private searchByDepartment(query: string): Employee[] {
    const departmentMap: Record<string, string[]> = {
      'ti': ['ti', 'tecnologia'],
      'comercial': ['comercial'],
      'administrativo': ['administrativo'],
      'gente e gestão': ['gente e gestão', 'gente', 'gestão', 'rh'],
      'marketing': ['marketing'],
      'controladoria': ['controladoria'],
      'compras': ['compras', 'prefeitura', 'compras/prefeitura'],
      'prefeitura': ['prefeitura', 'compras', 'compras/prefeitura'],
      'salas': ['salas', 'sala'],
      'pcp': ['pcp', 'planejamento', 'controle', 'produção'],
      'almoxarifado': ['almoxarifado', 'estoque', 'armazém', 'depósito'],
      // Inclusão de variações para 'Portaria'
      'portaria': ['portaria', 'porteiro', 'portaria principal', 'entrada', 'recepção']
    };

    let targetDepts: string[] = [];

    for (const [key, variations] of Object.entries(departmentMap)) {
      if (variations.some(variation => query.includes(variation))) {
        targetDepts = variations;
        break;
      }
    }

    return this.employees.filter(emp => {
      const empDept = emp.department.toLowerCase();
      return targetDepts.some(dept => empDept.includes(dept));
    });
  }

  /**
   * Busca por ramal/extensão
   */
  private searchByExtension(query: string): Employee[] {
    const extensionMatch = query.match(/\b4\d{3}\b/);
    if (!extensionMatch) return [];

    const targetExtension = extensionMatch[0];
    return this.employees.filter(emp => emp.extension === targetExtension);
  }

  /**
   * Busca por email
   */
  private searchByEmail(query: string): Employee[] {
    return this.employees.filter(emp =>
      emp.email && (
        emp.email.toLowerCase().includes(query.replace(/@.*$/, '')) ||
        emp.email.toLowerCase().includes(query)
      )
    );
  }

  /**
   * Busca por nome
   */
  private searchByName(query: string): Employee[] {
    return this.employees.filter(emp => {
      const name = emp.name.toLowerCase();
      const words = query.split(/\s+/);

      // Busca exata por palavra completa tem prioridade
      if (name.includes(query)) {
        return true;
      }

      // Busca por todas as palavras da consulta
      return words.every(word => name.includes(word));
    });
  }

  /**
   * Busca geral (fallback)
   */
  private searchGeneral(query: string): Employee[] {
    return this.employees.filter(emp => {
      const searchableText = [
        emp.name,
        emp.department,
        emp.email,
        emp.extension,
        emp.lunchTime || ''
      ].join(' ').toLowerCase();

      return searchableText.includes(query);
    });
  }

  /**
   * Retorna todos os funcionários
   */
  private getAllEmployees(): EmployeeSearchResult {
    this.loadEmployees();
    return this.formatResult(this.employees, 'general', '');
  }

  /**
   * Formata o resultado da busca
   */
  private formatResult(
    employees: Employee[],
    searchType: EmployeeSearchResult['searchType'],
    searchTerm: string
  ): EmployeeSearchResult {
    // Contar por departamento
    const departmentCounts: Record<string, number> = {};
    employees.forEach(emp => {
      const dept = emp.department || 'Não informado';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    return {
      employees,
      totalCount: employees.length,
      departmentCounts,
      searchType,
      searchTerm
    };
  }

  /**
   * Busca especial para o chatbot (formato otimizado)
   */
  searchForChatbot(query: string): {
    hasResults: boolean;
    summary: string;
    employees: Employee[];
    departmentBreakdown: string;
  } {
    const result = this.search(query);

    if (result.totalCount === 0) {
      return {
        hasResults: false,
        summary: `Nenhum funcionário encontrado para "${query}"`,
        employees: [],
        departmentBreakdown: ''
      };
    }

    // Gerar resumo baseado no tipo de busca
    let summary = '';
    switch (result.searchType) {
      case 'count':
        summary = `Encontrados ${result.totalCount} funcionários`;
        if (query.includes('departamento') || Object.keys(result.departmentCounts).length === 1) {
          const dept = Object.keys(result.departmentCounts)[0];
          summary += ` no departamento de ${dept}`;
        }
        break;

      case 'department': {
        const dept = Object.keys(result.departmentCounts)[0];
        summary = `${result.totalCount} funcionários no departamento de ${dept}`;
        break;
      }

      case 'name': {
        if (result.totalCount === 1) {
          const emp = result.employees[0];
          summary = `Funcionário encontrado: ${emp.name} - ${emp.department} (Ramal: ${emp.extension})`;
        } else {
          summary = `${result.totalCount} funcionários encontrados com nome similar`;
        }
        break;
      }

      case 'extension':
        if (result.totalCount === 1) {
          const emp = result.employees[0];
          summary = `Ramal ${emp.extension}: ${emp.name} - ${emp.department}`;
        } else {
          summary = `${result.totalCount} funcionários encontrados`;
        }
        break;

      default:
        summary = `${result.totalCount} funcionários encontrados`;
    }

    // Breakdown por departamento
    const departmentBreakdown = Object.entries(result.departmentCounts)
      .map(([dept, count]) => `${dept}: ${count}`)
      .join(', ');

    return {
      hasResults: true,
      summary,
      employees: result.employees,
      departmentBreakdown: departmentBreakdown ? `Distribuição: ${departmentBreakdown}` : ''
    };
  }

  /**
   * Obtém estatísticas gerais
   */
  getStats(): {
    totalEmployees: number;
    departmentCounts: Record<string, number>;
    lastUpdate: string;
  } {
    this.loadEmployees();

    const departmentCounts: Record<string, number> = {};
    this.employees.forEach(emp => {
      const dept = emp.department || 'Não informado';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });

    return {
      totalEmployees: this.employees.length,
      departmentCounts,
      lastUpdate: new Date().toISOString()
    };
  }
}

// Instância singleton
const employeeSearchService = new EmployeeSearchService();
export default employeeSearchService;
export { EmployeeSearchService };
