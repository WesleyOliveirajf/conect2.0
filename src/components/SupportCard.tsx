import { ExternalLink, Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SUPPORT_URL = "https://chamado2026torp.lovable.app/";

const SupportCard = () => (
  <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5">
    <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
      <CardHeader className="flex-row items-start gap-4 space-y-0 p-0">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Headset className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <CardTitle className="text-xl">Precisa de ajuda?</CardTitle>
          <CardDescription className="max-w-2xl text-sm sm:text-base">
            Abra um chamado para solicitar suporte à equipe de TI.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">
            Abrir chamado
            <ExternalLink aria-hidden="true" />
          </a>
        </Button>
      </CardContent>
    </div>
  </Card>
);

export default SupportCard;
