import { ThemeToggle } from "./ThemeToggle";
import WeatherWidget from "./WeatherWidget";

const Header = () => {
  return (
    <header className="w-full border-b border-border/60 bg-background/95">
      <div className="container mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight torp-text-brand">Torp Connect</h1>
            <p className="mt-1 text-sm text-muted-foreground">Comunicados, pessoas e atendimento em um só lugar</p>
          </div>
          <div className="flex items-center gap-2">
            <WeatherWidget variant="header" />
            <ThemeToggle />
          </div>
        </div>
        <nav aria-label="Navegação principal" className="mt-5 flex gap-2 overflow-x-auto pb-1">
          <a href="#atendimento" className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Suporte e RH</a>
          <a href="#comunicados" className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Comunicados</a>
          <a href="#pessoas" className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Diretório</a>
          <a href="#almoco" className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Horários de almoço</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
