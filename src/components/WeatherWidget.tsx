import { useWeather } from "@/hooks/useWeather";
import { getWmoInfo } from "@/lib/weatherWmo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, Droplets, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const cityLabel = "Juiz de Fora, MG";

function formatShortWeekday(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short" });
}

const WeatherWidget = () => {
  const { current, days, isLoading, error, source, refetch } = useWeather();

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="h-14 w-14 rounded-2xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-8 w-24 rounded bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {error ?? "Previsão indisponível no momento."}
          </p>
          <Button variant="outline" size="sm" onClick={refetch} className="shrink-0">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar de novo
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { Icon, label } = getWmoInfo(current.code);

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-br from-card to-muted/20">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 sm:gap-6">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div
              className={cn(
                "flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl",
                "bg-primary/10 text-primary"
              )}
              aria-hidden
            >
              <Icon className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate font-medium text-foreground">{cityLabel}</span>
              </div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold tabular-nums tracking-tight">
                  {Math.round(current.temp)}°C
                </span>
                <span className="text-sm text-muted-foreground line-clamp-2" title={label}>
                  {label}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Droplets className="h-3.5 w-3.5" />
                  {Math.round(current.humidity)}% umidade
                </span>
                <span className="inline-flex items-center gap-1">
                  <Wind className="h-3.5 w-3.5" />
                  {Math.round(current.windKmh)} km/h
                </span>
              </div>
            </div>
          </div>

          {days.length > 0 && (
            <div className="sm:border-l sm:border-border/60 sm:pl-6 flex flex-col gap-2 sm:min-w-[220px]">
              <p className="text-xs text-muted-foreground">Próximos dias</p>
              <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible sm:pb-0 sm:gap-1.5">
                {days.slice(0, 5).map((d) => {
                  const dInfo = getWmoInfo(d.code);
                  const DayIcon = dInfo.Icon;
                  return (
                    <div
                      key={d.date}
                      className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5 sm:py-1.5 min-w-[108px] sm:min-w-0 sm:justify-between"
                    >
                      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground capitalize w-9 shrink-0">
                        {formatShortWeekday(d.date)}
                      </span>
                      <DayIcon className="h-4 w-4 sm:h-4 sm:w-4 text-primary shrink-0" aria-hidden />
                      <span className="text-xs tabular-nums text-foreground sm:ml-auto">
                        {Math.round(d.min)}° / {Math.round(d.max)}°
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Fonte: {source === "climatempo" ? "Climatempo" : "Open-Meteo"} — atualizado em{" "}
              {new Date(current.time).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {error && (
              <p className="mt-1 text-[10px] sm:text-xs text-amber-600 dark:text-amber-400">
                {error}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={refetch}
            title="Atualizar previsão"
            aria-label="Atualizar previsão"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
