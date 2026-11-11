import { useState, type FormEvent } from "react";
import { MessageSquareText, Send, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/utils/supabaseService";

const HrContactCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (website) return;
      await supabaseService.addHrQuestion(name.trim(), question.trim());

      setName("");
      setQuestion("");
      setWebsite("");
      setIsOpen(false);
      toast({
        title: "Dúvida enviada",
        description: "O RH/DP recebeu sua mensagem.",
      });
    } catch (error) {
      toast({
        title: "Não foi possível enviar",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="h-full overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <div className="flex h-full flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <CardHeader className="flex-row items-start gap-4 space-y-0 p-0">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <UsersRound className="h-6 w-6" />
          </div>

          <div className="space-y-1.5">
            <CardTitle className="text-xl">Falar com RH/DP</CardTitle>
            <CardDescription className="max-w-2xl text-sm sm:text-base">
              Envie sua dúvida diretamente para a equipe de Recursos Humanos.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto">
                Enviar dúvida
                <MessageSquareText aria-hidden="true" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Falar com RH/DP</DialogTitle>
                <DialogDescription>
                  Informe seu nome e descreva sua dúvida. A equipe responderá pelos
                  canais internos.
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="hr-name">Nome</Label>
                  <Input
                    id="hr-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={120}
                    required
                    autoComplete="name"
                    placeholder="Digite seu nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hr-question">Qual é a sua dúvida?</Label>
                  <Textarea
                    id="hr-question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    required
                    rows={6}
                    placeholder="Descreva sua dúvida com os detalhes necessários"
                  />
                </div>

                <div className="hidden" aria-hidden="true">
                  <Label htmlFor="hr-website">Website</Label>
                  <Input
                    id="hr-website"
                    name="website"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Send aria-hidden="true" />
                    {isSubmitting ? "Enviando..." : "Enviar dúvida"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </div>
    </Card>
  );
};

export default HrContactCard;
