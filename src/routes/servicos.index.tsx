import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Ban,
  Copy,
  Download,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/logistica/AppShell";
import { StatusChip } from "@/components/logistica/StatusChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FILTROS_VAZIOS, useLogistica, useNomes } from "@/lib/logistica/store";
import { brl, dataBR } from "@/lib/logistica/format";
import { ALL_STATUS, STATUS_LABEL, type ServiceStatus } from "@/lib/logistica/types";

export const Route = createFileRoute("/servicos/")({
  head: () => ({
    meta: [
      { title: "Serviços | LogControl" },
      {
        name: "description",
        content: "Lista completa de serviços de logística com busca, filtros, ordenação e ações rápidas.",
      },
      { property: "og:title", content: "Serviços | LogControl" },
      { property: "og:description", content: "Busque, filtre e gerencie todos os serviços de logística." },
    ],
  }),
  component: ListaServicos,
});

type Coluna = "numero" | "dataServico" | "cliente" | "cidade" | "motorista" | "status" | "valorServico";

const POR_PAGINA = 8;

function ListaServicos() {
  const { servicos, clientes, motoristas, filtros, setFiltros, pode, duplicarServico, alterarStatus } =
    useLogistica();
  const nomes = useNomes();
  const navigate = useNavigate();
  const [ordem, setOrdem] = useState<{ col: Coluna; asc: boolean }>({ col: "dataServico", asc: false });
  const [pagina, setPagina] = useState(1);
  const [cancelarId, setCancelarId] = useState<string | null>(null);

  const cidades = useMemo(
    () => [...new Set(servicos.map((s) => s.cidade))].sort((a, b) => a.localeCompare(b)),
    [servicos],
  );

  const filtrados = useMemo(() => {
    const termo = filtros.busca.trim().toLowerCase();
    const lista = servicos.filter((s) => {
      if (filtros.status !== "todos" && s.status !== filtros.status) return false;
      if (filtros.cliente !== "todos" && s.clienteId !== filtros.cliente) return false;
      if (filtros.motorista !== "todos" && s.motoristaId !== filtros.motorista) return false;
      if (filtros.cidade !== "todas" && s.cidade !== filtros.cidade) return false;
      if (filtros.de && s.dataServico < filtros.de) return false;
      if (filtros.ate && s.dataServico > filtros.ate) return false;
      if (!termo) return true;
      return [
        s.numero,
        nomes.cliente(s.clienteId),
        s.localColeta,
        s.localEntrega,
        s.cidade,
        s.responsavel,
        nomes.motorista(s.motoristaId),
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo);
    });

    const valor = (s: (typeof lista)[number]) => {
      switch (ordem.col) {
        case "cliente":
          return nomes.cliente(s.clienteId);
        case "motorista":
          return nomes.motorista(s.motoristaId);
        case "status":
          return STATUS_LABEL[s.status];
        case "valorServico":
          return s.valorServico;
        case "cidade":
          return s.cidade;
        case "numero":
          return s.numero;
        default:
          return s.dataServico;
      }
    };

    return [...lista].sort((a, b) => {
      const va = valor(a);
      const vb = valor(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return ordem.asc ? cmp : -cmp;
    });
  }, [servicos, filtros, ordem, nomes]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const visiveis = filtrados.slice((paginaAtual - 1) * POR_PAGINA, paginaAtual * POR_PAGINA);

  const ordenar = (col: Coluna) =>
    setOrdem((o) => ({ col, asc: o.col === col ? !o.asc : true }));

  const exportarCsv = () => {
    const linhas = [
      ["ID", "Data", "Cliente", "Origem", "Destino", "Motorista", "Veículo", "Status", "Valor", "Responsável"],
      ...filtrados.map((s) => [
        s.numero,
        dataBR(s.dataServico),
        nomes.cliente(s.clienteId),
        s.localColeta,
        s.localEntrega,
        nomes.motorista(s.motoristaId),
        nomes.veiculo(s.veiculoId),
        STATUS_LABEL[s.status],
        String(s.valorServico).replace(".", ","),
        s.responsavel,
      ]),
    ];
    const csv = linhas.map((l) => l.map((c) => `"${c}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "servicos.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exportação concluída (CSV).");
  };

  const th = (label: string, col: Coluna, extra?: string) => (
    <th className={`px-3 py-2 text-left font-medium ${extra ?? ""}`}>
      <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => ordenar(col)}>
        {label}
        <ArrowUpDown className="size-3 opacity-60" />
      </button>
    </th>
  );

  return (
    <AppShell
      titulo="Serviços"
      descricao={`${filtrados.length} serviço(s) encontrados`}
      acoes={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCsv}>
            <Download className="size-4" /> Exportar
          </Button>
          {pode("criar") ? (
            <Button asChild size="sm">
              <Link to="/servicos/novo">
                <Plus className="size-4" /> Novo
              </Link>
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="surface-card mb-4 grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative xl:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por número, cliente, cidade, motorista..."
            value={filtros.busca}
            onChange={(e) => {
              setFiltros({ ...filtros, busca: e.target.value });
              setPagina(1);
            }}
          />
        </div>
        <Select value={filtros.status} onValueChange={(v) => setFiltros({ ...filtros, status: v })}>
          <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {ALL_STATUS.map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtros.cliente} onValueChange={(v) => setFiltros({ ...filtros, cliente: v })}>
          <SelectTrigger aria-label="Cliente"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os clientes</SelectItem>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtros.motorista} onValueChange={(v) => setFiltros({ ...filtros, motorista: v })}>
          <SelectTrigger aria-label="Motorista"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os motoristas</SelectItem>
            {motoristas.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filtros.cidade} onValueChange={(v) => setFiltros({ ...filtros, cidade: v })}>
          <SelectTrigger aria-label="Cidade"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as cidades</SelectItem>
            {cidades.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input type="date" value={filtros.de} onChange={(e) => setFiltros({ ...filtros, de: e.target.value })} />
          <span className="text-xs text-muted-foreground">até</span>
          <Input type="date" value={filtros.ate} onChange={(e) => setFiltros({ ...filtros, ate: e.target.value })} />
        </div>
        <Button variant="ghost" onClick={() => setFiltros(FILTROS_VAZIOS)} className="justify-self-start">
          <X className="size-4" /> Limpar filtros
        </Button>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
            <tr>
              {th("ID", "numero")}
              {th("Data", "dataServico")}
              {th("Cliente", "cliente")}
              <th className="px-3 py-2 text-left font-medium">Origem → Destino</th>
              {th("Motorista", "motorista")}
              <th className="px-3 py-2 text-left font-medium">Veículo</th>
              {th("Status", "status")}
              {th("Valor", "valorServico")}
              <th className="px-3 py-2 text-left font-medium">Responsável</th>
              <th className="px-3 py-2 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-3 py-2 font-medium">
                  <Link to="/servicos/$id" params={{ id: s.id }} className="text-primary hover:underline">
                    {s.numero}
                  </Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{dataBR(s.dataServico)} {s.horario}</td>
                <td className="px-3 py-2">{nomes.cliente(s.clienteId)}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {s.localColeta} → {s.localEntrega}
                  <br />
                  {s.cidade}/{s.estado}
                </td>
                <td className="px-3 py-2">{nomes.motorista(s.motoristaId)}</td>
                <td className="px-3 py-2 text-xs">{nomes.veiculo(s.veiculoId)}</td>
                <td className="px-3 py-2"><StatusChip status={s.status} /></td>
                <td className="px-3 py-2 whitespace-nowrap font-medium">{brl(s.valorServico)}</td>
                <td className="px-3 py-2 text-xs">{s.responsavel}</td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" aria-label="Visualizar">
                      <Link to="/servicos/$id" params={{ id: s.id }}><Eye className="size-4" /></Link>
                    </Button>
                    {pode("editar") ? (
                      <Button asChild variant="ghost" size="icon" aria-label="Editar">
                        <Link to="/servicos/$id/editar" params={{ id: s.id }}><Pencil className="size-4" /></Link>
                      </Button>
                    ) : null}
                    {pode("status") ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Alterar status">
                            <RefreshCw className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {ALL_STATUS.map((st) => (
                            <DropdownMenuItem
                              key={st}
                              onSelect={() => {
                                alterarStatus(s.id, st as ServiceStatus);
                                toast.success(`${s.numero}: status alterado para ${STATUS_LABEL[st]}.`);
                              }}
                            >
                              {STATUS_LABEL[st]}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                    {pode("criar") ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Duplicar"
                        onClick={() => {
                          const novo = duplicarServico(s.id);
                          if (novo) toast.success(`Serviço duplicado como ${novo.numero}.`);
                        }}
                      >
                        <Copy className="size-4" />
                      </Button>
                    ) : null}
                    {pode("status") && s.status !== "cancelado" ? (
                      <Button variant="ghost" size="icon" aria-label="Cancelar" onClick={() => setCancelarId(s.id)}>
                        <Ban className="size-4 text-destructive" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {visiveis.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Nenhum serviço encontrado com os filtros atuais.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Página {paginaAtual} de {totalPaginas}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={paginaAtual <= 1} onClick={() => setPagina(paginaAtual - 1)}>
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={paginaAtual >= totalPaginas}
            onClick={() => setPagina(paginaAtual + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>

      <AlertDialog open={cancelarId !== null} onOpenChange={(o) => !o && setCancelarId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar este serviço?</AlertDialogTitle>
            <AlertDialogDescription>
              O serviço não será excluído: ele passa para o status “Cancelado” e o histórico é preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (cancelarId) {
                  alterarStatus(cancelarId, "cancelado");
                  toast.success("Serviço cancelado.");
                }
                setCancelarId(null);
                navigate({ to: "/servicos" });
              }}
            >
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}