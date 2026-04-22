import { createContext, useContext, type ReactNode } from "react";
import { useEmployeeManager } from "@/hooks/useEmployeeManager";

type EmployeeDataContextValue = ReturnType<typeof useEmployeeManager>;

const EmployeeDataContext = createContext<EmployeeDataContextValue | null>(null);

export function EmployeeDataProvider({ children }: { children: ReactNode }) {
  const value = useEmployeeManager();
  return (
    <EmployeeDataContext.Provider value={value}>
      {children}
    </EmployeeDataContext.Provider>
  );
}

export function useEmployeeData(): EmployeeDataContextValue {
  const ctx = useContext(EmployeeDataContext);
  if (!ctx) {
    throw new Error(
      "useEmployeeData deve ser usado dentro de EmployeeDataProvider (ex.: Index)."
    );
  }
  return ctx;
}
