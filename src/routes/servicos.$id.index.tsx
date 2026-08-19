import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Ban, Copy, Pencil, Printer, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/logistica/AppShell";
import { StatusChip } from "@/components/logistica/StatusChip";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLogistica, useNomes } from "@/lib/logistica/store";
import { brl, dataBR, dataHoraBR } from "@/lib/logistica/format";
import { ALL_STATUS, STATUS_LABEL, type ServiceStatus } from "@/lib/logistica/types";

export const Route = createFileRoute("/servicos/$id/")({
  head: () => ({
    meta: [
      { title: "Detalhes do serviço | LogControl" },
      {
        name: "description",
        content: "Todos os dados do serviço, histórico de status com data, hora e usuário responsável.",
      },
      { property: "og:title", content: "Detalhes do serviço | LogControl" },
      { property: "og:description", content: "Acompanhe a linha do tempo completa do serviço de logística." },
    ],
  }),
  component: DetalheServico,
});

function Bloco({ titulo, itens }: { titulo: string; itens: [string, string][] }) {
  return (
    <section className="surface-card p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        {itens.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-muted-foreground">{k}</dt>
            <dd className="text-sm font-medium">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function DetalheServico() {
  const { id } = Route.useParams();
  const { servicos, pode, alterarStatus, duplicarServico } = useLogistica();
  const nomes = useNomes();
  const navigate = useNavigate();
  const servico = servicos.find((s) => s.id === id);

  if (!servico) {
    return (
      <AppShell titulo="Serviço não encontrado">
        <p className="surface-card p-6 text-sm text-muted-foreground">
          Este serviço não existe ou foi removido.{" "}
          <Link to="/servicos" className="text-primary hover:underline">Voltar para a lista</Link>
        </p>
      </AppShell>
    );
  }

  const total = servico.valorServico + servico.valorFrete + servico.custosAdicionais;

  return (
    <AppShell
      titulo={`Serviço ${servico.numero}`}
      descricao={`${nomes.cliente(servico.clienteId)} · ${dataBR(servico.dataServico)} às ${servico.horario}`}
      acoes={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/servicos"><ArrowLeft className="size-4" /> Lista</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" /> Imprimir
          </Button>
          {pode("criar") ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const novo = duplicarServico(servico.id);
                if (novo) {
                  toast.success(`Duplicado como ${novo.numero}.`);
                  navigate({ to: "/servicos/$id", params: { id: novo.id } });
                }
              }}
            >
              <Copy className="size-4" /> Duplicar
            </Button>
          ) : null}
          {pode("editar") ? (
            <Button asChild size="sm">
              <Link to="/servicos/$id/editar" params={{ id: servico.id }}>
                <Pencil className="size-4" /> Editar
              </Link>
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="surface-card mb-4 flex flex-wrap items-center gap-3 p-4">
        <StatusChip status={servico.status} />
        {pode("status") ? (
          <>
            <div className="flex items-center gap-2">
              <RefreshCw className="size-4 text-muted-foreground" />
              <Select
                value={servico.status}
                onValueChange={(v) => {
                  alterarStatus(servico.id, v as ServiceStatus);
                  toast.success(`Status alterado para ${STATUS_LABEL[v as ServiceStatus]}.`);
                }}
              >
                <SelectTrigger className="w-[220px]" aria-label="Alterar status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {servico.status !== "cancelado" ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">
                    <Ban className="size-4" /> Cancelar serviço
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar {servico.numero}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      O serviço permanece no sistema com histórico completo, apenas marcado como cancelado.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        alterarStatus(servico.id, "cancelado");
                        toast.success("Serviço cancelado.");
                      }}
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">Perfil consulta: alterações desabilitadas.</span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Bloco
            titulo="Dados gerais"
            itens={[
              ["Número", servico.numero],
              ["Criado em", dataHoraBR(servico.criadoEm)],
              ["Data do serviço", `${dataBR(servico.dataServico)} às ${servico.horario}`],
              ["Cliente", nomes.cliente(servico.clienteId)],
              ["Tipo de serviço", servico.tipo],
              ["Responsável interno", servico.responsavel],
            ]}
          />
          <Bloco
            titulo="Origem e destino"
            itens={[
              ["Local de coleta", servico.localColeta],
              ["Endereço de origem", servico.enderecoOrigem],
              ["Local de entrega", servico.localEntrega],
              ["Endereço de destino", servico.enderecoDestino],
              ["Cidade / Estado", `${servico.cidade}/${servico.estado}`],
              ["CEP", servico.cep],
            ]}
          />
          <Bloco
            titulo="Operação"
            itens={[
              ["Motorista", nomes.motorista(servico.motoristaId)],
              ["Veículo", nomes.veiculo(servico.veiculoId)],
              ["Volumes", String(servico.volumes)],
              ["Peso", `${servico.peso} kg`],
              ["Observações", servico.observacoes ?? ""],
            ]}
          />
          <Bloco
            titulo="Financeiro"
            itens={[
              ["Valor do serviço", brl(servico.valorServico)],
              ["Valor do frete", brl(servico.valorFrete)],
              ["Custos adicionais", brl(servico.custosAdicionais)],
              ["Total", brl(total)],
              ["Forma de pagamento", servico.formaPagamento],
              ["Observações financeiras", servico.observacoesFinanceiras ?? ""],
            ]}
          />
        </div>

        <div className="surface-card h-fit p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Linha do tempo
          </h2>
          <ol className="relative space-y-5 border-l border-border pl-5">
            {servico.historico.map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[26px] top-1 size-3 rounded-full bg-primary ring-4 ring-card" />
                <p className="text-sm font-medium">
                  {h.de ? STATUS_LABEL[h.para] : "Serviço criado"}
                </p>
                {h.de ? (
                  <p className="text-xs text-muted-foreground">de {STATUS_LABEL[h.de]}</p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {dataHoraBR(h.em)} · {h.usuario}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AppShell>
  );
}