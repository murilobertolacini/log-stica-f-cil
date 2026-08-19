import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/logistica/AppShell";
import { ServiceForm } from "@/components/logistica/ServiceForm";
import { Button } from "@/components/ui/button";
import { useLogistica } from "@/lib/logistica/store";

export const Route = createFileRoute("/servicos/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar serviço | LogControl" },
      { name: "description", content: "Edite os dados do serviço de logística com validação de campos obrigatórios." },
      { property: "og:title", content: "Editar serviço | LogControl" },
      { property: "og:description", content: "Ajuste rota, operação e financeiro do serviço em poucos cliques." },
    ],
  }),
  component: EditarServico,
});

function EditarServico() {
  const { id } = Route.useParams();
  const { servicos, pode } = useLogistica();
  const servico = servicos.find((s) => s.id === id);

  return (
    <AppShell
      titulo={servico ? `Editar ${servico.numero}` : "Serviço não encontrado"}
      descricao="As alterações são registradas no histórico do serviço"
      acoes={
        <Button asChild variant="outline" size="sm">
          <Link to="/servicos"><ArrowLeft className="size-4" /> Voltar</Link>
        </Button>
      }
    >
      {!servico ? (
        <p className="surface-card p-6 text-sm text-muted-foreground">Serviço inexistente.</p>
      ) : pode("editar") ? (
        <ServiceForm servico={servico} />
      ) : (
        <p className="surface-card p-6 text-sm text-muted-foreground">
          Seu perfil (consulta) não tem permissão para editar serviços.
        </p>
      )}
    </AppShell>
  );
}