import type { LucideIcon } from "lucide-react";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
} from "lucide-react";

/**
 * Códigos WMO (Open-Meteo) — resumo em português.
 * @see https://open-meteo.com/en/docs
 */
export function getWmoInfo(code: number): { label: string; Icon: LucideIcon } {
  if (code === 0) return { label: "Céu limpo", Icon: Sun };
  if (code === 1) return { label: "Predominantemente claro", Icon: CloudSun };
  if (code === 2) return { label: "Parcialmente nublado", Icon: CloudSun };
  if (code === 3) return { label: "Nublado", Icon: Cloud };
  if (code === 45 || code === 48) return { label: "Neblina", Icon: CloudFog };
  if (code >= 51 && code <= 55) return { label: "Garoa", Icon: CloudDrizzle };
  if (code >= 61 && code <= 65) return { label: "Chuva", Icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: "Neve", Icon: Snowflake };
  if (code >= 80 && code <= 82) return { label: "Pancadas de chuva", Icon: CloudRain };
  if (code >= 85 && code <= 86) return { label: "Pancadas de neve", Icon: Snowflake };
  if (code >= 95 && code <= 99) return { label: "Trovoadas", Icon: CloudLightning };
  return { label: "Condição variável", Icon: Cloud };
}
