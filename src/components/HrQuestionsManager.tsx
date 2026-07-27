import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  supabaseService,
  type DatabaseHrQuestion,
} from "@/utils/supabaseService";

type QuestionStatus = "nova" | "visualizada" | "resolvida";

const statusLabels: Record<QuestionStatus, string> = {
  nova: "Nova",
  visualizada: "Visualizada",
  resolvida: "Resolvida",
};

const HrQuestionsManager = () => {
  const [questions, setQuestions] = useState<DatabaseHrQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      setQuestions(await supabaseService.getHrQuestions());
    } catch (error) {
      toast({
        title: "Não foi possível carregar as dúvidas",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const updateStatus = async (id: string, status: QuestionStatus) => {
    try {
      await supabaseService.updateHrQuestionStatus(id, status);

      setQuestions((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );
    } catch (error) {
      toast({
        title: "Não foi possível atualizar",
        description:
          error instanceof Error ? error.message : "Tente novamente em instantes.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Dúvidas para RH/DP</h3>
          <p className="text-sm text-muted-foreground">
            Mensagens enviadas pelo formulário da página inicial.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadQuestions()}
          disabled={isLoading}
        >
          <RefreshCw className={isLoading ? "animate-spin" : ""} />
          Atualizar
        </Button>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Carregando dúvidas...
        </p>
      ) : questions.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nenhuma dúvida recebida até o momento.
        </p>
      ) : (
        <div className="space-y-3">
          {questions.map((item) => (
            <Card key={item.id}>
              <CardHeader className="space-y-2 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                  <Badge variant={item.status === "resolvida" ? "secondary" : "default"}>
                    {statusLabels[item.status]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(item.created_at))}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-wrap text-sm">{item.question}</p>
                <div className="flex flex-wrap justify-end gap-2">
                  {item.status === "nova" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void updateStatus(item.id, "visualizada")}
                    >
                      <Clock3 />
                      Marcar visualizada
                    </Button>
                  )}
                  {item.status !== "resolvida" && (
                    <Button
                      size="sm"
                      onClick={() => void updateStatus(item.id, "resolvida")}
                    >
                      <CheckCircle2 />
                      Marcar resolvida
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HrQuestionsManager;
