import { Card } from "@/components/ui/card";
import { Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useEmployeeManager } from "@/hooks/useEmployeeManager";
import { type Employee } from "@/hooks/useEmployeeSearch";

// Função para verificar se um funcionário está em horário de almoço
export const isEmployeeOnLunch = (lunchTime?: string) => {
  if (!lunchTime) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [start, end] = lunchTime.split('-');
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  return currentTime >= startTime && currentTime <= endTime;
};

const LunchHours = () => {
  const { formatCurrentTime } = useCurrentTime();

  // Obter funcionários do sistema principal (sincronizado com o diretório)
  const { employees } = useEmployeeManager();

  // Contar quantos funcionários estão em almoço
  const employeesOnLunch = employees.filter(employee => 
    employee.lunchTime && isEmployeeOnLunch(employee.lunchTime)
  ).length;
  
  // Função para obter os funcionários em almoço
  const getEmployeesOnLunch = () => {
    return employees.filter(emp => emp.lunchTime && isEmployeeOnLunch(emp.lunchTime));
  };

  // Função para obter os nomes dos funcionários em almoço (para tooltip)
  const getEmployeesOnLunchNames = () => {
    const employeesInLunch = getEmployeesOnLunch().map(emp => emp.name);
    
    return employeesInLunch.length > 0 ? employeesInLunch.join(', ') : 'Nenhum funcionário em almoço no momento';
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="gradient-card shadow-card hover:shadow-hover hover:shadow-glow transition-all duration-500 p-6 group animate-slide-up">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300" 
                 style={{ 
                   background: `linear-gradient(135deg, hsl(var(--lunch-accent) / 0.1) 0%, hsl(var(--lunch-accent) / 0.05) 100%)`,
                   border: `1px solid hsl(var(--lunch-accent) / 0.2)`
                 }}>
              <Users className="h-6 w-6" style={{ color: 'hsl(var(--lunch-accent))' }} />
            </div>
            <div className="absolute -inset-1 rounded-xl opacity-30 blur-sm" 
                 style={{ background: `hsl(var(--lunch-accent))` }}></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Funcionários em Almoço</h2>
            <p className="text-sm text-muted-foreground">Quantidade atual</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold transition-colors ${
              employeesOnLunch > 0 
                ? 'text-green-600 dark:text-green-400'
                : 'text-muted-foreground'
            }`}>
              {employeesOnLunch}
            </div>
            <p className="text-xs text-muted-foreground">
              {employeesOnLunch === 1 ? 'pessoa' : 'pessoas'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="font-mono text-sm">
              {formatCurrentTime()}
            </Badge>
          </div>
        </div>
      </div>
      
      {employeesOnLunch > 0 && (
        <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              {employeesOnLunch} {employeesOnLunch === 1 ? 'funcionário está' : 'funcionários estão'} em horário de almoço:
            </span>
          </div>
          <div className="space-y-2">
            {getEmployeesOnLunch().map((employee, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0"></div>
                <span className="text-green-700 dark:text-green-300 font-medium">
                  {employee.name}
                </span>
                <span className="text-green-600 dark:text-green-400 text-xs font-mono ml-auto">
                  {employee.lunchTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      </Card>
    </TooltipProvider>
  );
};

export default LunchHours;