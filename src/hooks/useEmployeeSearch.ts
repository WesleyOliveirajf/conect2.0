import { useState, useMemo } from "react";

export interface Employee {
  id?: string;
  name: string;
  extension: string;
  email?: string;
  department: string;
  lunchTime?: string; // Horário de almoço no formato "12:00-13:00"
}

// Mapa de sinônimos para melhorar a busca por termos comuns
// Mantemos o foco em termos relevantes para o caso reportado (Portaria)
export const TERM_SYNONYMS: Record<string, string[]> = {
  // Portaria frequentemente é referenciada como Recepção ou Entrada
  "portaria": ["recepção", "recepcao", "entrada", "porteiro", "portaria principal"],
};

export function useEmployeeSearch(employees: Employee[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("todos");

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const synonyms = TERM_SYNONYMS[term] || [];

    return employees.filter((employee) => {
      const nameLower = employee.name.toLowerCase();
      const deptLower = employee.department.toLowerCase();
      const emailLower = employee.email ? employee.email.toLowerCase() : "";

      const matchesSearch = 
        nameLower.includes(term) ||
        emailLower.includes(term) ||
        deptLower.includes(term) ||
        employee.extension.includes(searchTerm) ||
        // Busca por sinônimos quando aplicável
        synonyms.some((syn) =>
          nameLower.includes(syn) ||
          emailLower.includes(syn) ||
          deptLower.includes(syn)
        );

      const matchesDepartment = 
        departmentFilter === "todos" || 
        deptLower.includes(departmentFilter.toLowerCase());

      return matchesSearch && matchesDepartment;
    });
  }, [employees, searchTerm, departmentFilter]);

  const departments = useMemo(() => {
    const unique = new Set(employees.map(emp => emp.department));
    return Array.from(unique).sort();
  }, [employees]);

  return {
    searchTerm,
    setSearchTerm,
    departmentFilter,
    setDepartmentFilter,
    filteredEmployees,
    departments,
    totalResults: filteredEmployees.length,
    totalEmployees: employees.length
  };
}
