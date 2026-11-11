import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data para o padrão brasileiro dd/mm/aa
 * @param date - Data a ser formatada (Date, string ou timestamp)
 * @returns String formatada no padrão dd/mm/aa
 */
export function formatDateBR(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString().slice(-2); // Pega apenas os 2 últimos dígitos
  
  return `${day}/${month}/${year}`;
}

/**
 * Formata uma data para o padrão brasileiro dd/mm/aa com horário HH:mm
 * @param date - Data a ser formatada (Date, string ou timestamp)
 * @returns String formatada no padrão dd/mm/aa HH:mm
 */
export function formatDateTimeBR(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }
  
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear().toString().slice(-2);
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
