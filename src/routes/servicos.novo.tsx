import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/logistica/AppShell";
import { ServiceForm } from "@/components/logistica/ServiceForm";
import { Button } from "@/components/ui/button";
import { useLogistica } from "@/lib/logistica/store";

export const Route = createFileRoute("/servicos/novo")({
  head: () => ({
    meta: [
      { title: "Novo serviço | LogControl" },
      {
        name: "description",
        content: "Cadastre um novo serviço de logística em etapas: dados gerais, rota, operação e financeiro.",
      },
      { property: "og:title", content: "Novo serviço | LogControl" },
      { property: "og:description", content: "Cadastro rápido de serviços de logística em poucos cliques." },
    ],
  }),
  component: NovoServico,
});

function NovoServico() {
  const { pode } = useLogistica();

  return (
    <AppShell
      titulo="Novo serviço"
      descricao="Preencha as seções abaixo — o número é gerado automaticamente"
      acoes={
        <Button asChild variant="outline" size="sm">
          <Link to="/servicos">
            <ArrowLeft className="size-4" /> Voltar
          </Link>
        </Button>
      }
    >
      {pode("criar") ? (
        <ServiceForm />
      ) : (
        <p className="surface-card p-6 text-sm text-muted-foreground">
          Seu perfil (consulta) não tem permissão para criar serviços.
        </p>
      )}
    </AppShell>
  );
}