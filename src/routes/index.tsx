import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Plus,
  Truck,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/logistica/AppShell";
import { StatusChip } from "@/components/logistica/StatusChip";
import { Button } from "@/components/ui/button";
import { useAlertas, useLogistica, useNomes } from "@/lib/logistica/store";
import { brl, dataBR, hojeISO } from "@/lib/logistica/format";
import { STATUS_LABEL } from "@/lib/logistica/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard operacional | LogControl" },
      {
        name: "description",
        content:
          "Painel de controle de serviços de logística: status, alertas, indicadores e últimos serviços cadastrados.",
      },
      { property: "og:title", content: "Dashboard operacional | LogControl" },
      {
        property: "og:description",
        content: "Acompanhe serviços de logística do pedido à finalização em um só painel.",
      },
    ],
  }),
  component: Dashboard,
});

function Kpi({
  titulo,
  valor,
  icone: Icone,
  destaque,
}: {
  titulo: string;
  valor: number;
  icone: typeof Clock;
  destaque?: boolean;
}) {
  return (
    <div className="surface-card flex items-center gap-3 p-4">
      <div
        className={
          destaque
            ? "grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive"
            : "grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground"
        }
      >
        <Icone className="size-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{titulo}</p>
        <p className="text-2xl font-semibold leading-tight">{valor}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const { servicos, pode } = useLogistica();
  const nomes = useNomes();
  const alertas = useAlertas();
  const hoje = hojeISO();

  const resumo = useMemo(() => {
    const emAndamento = ["em_coleta", "coletado", "em_transito", "em_entrega"];
    const pendente = ["solicitado", "aguardando_programacao", "programado"];
    return {
      hoje: servicos.filter((s) => s.dataServico === hoje).length,
      pendentes: servicos.filter((s) => pendente.includes(s.status)).length,
      andamento: servicos.filter((s) => emAndamento.includes(s.status)).length,
      concluidos: servicos.filter((s) => ["entregue", "finalizado"].includes(s.status)).length,
      cancelados: servicos.filter((s) => s.status === "cancelado").length,
      atrasados: servicos.filter(
        (s) => s.dataServico < hoje && !["finalizado", "cancelado", "entregue"].includes(s.status),
      ).length,
    };
  }, [servicos, hoje]);

  const porStatus = useMemo(() => {
    const mapa = new Map<string, number>();
    servicos.forEach((s) => mapa.set(s.status, (mapa.get(s.status) ?? 0) + 1));
    return [...mapa].map(([k, v]) => ({ nome: STATUS_LABEL[k as keyof typeof STATUS_LABEL], total: v }));
  }, [servicos]);

  const porCliente = useMemo(() => {
    const mapa = new Map<string, number>();
    servicos.forEach((s) => mapa.set(s.clienteId, (mapa.get(s.clienteId) ?? 0) + 1));
    return [...mapa].map(([k, v]) => ({ nome: nomes.cliente(k), total: v }));
  }, [servicos, nomes]);

  const porTipo = useMemo(() => {
    const mapa = new Map<string, number>();
    servicos.forEach((s) => mapa.set(s.tipo, (mapa.get(s.tipo) ?? 0) + 1));
    return [...mapa].map(([k, v]) => ({ nome: k, total: v }));
  }, [servicos]);

  const porPeriodo = useMemo(() => {
    const mapa = new Map<string, number>();
    servicos.forEach((s) => mapa.set(s.dataServico, (mapa.get(s.dataServico) ?? 0) + 1));
    return [...mapa]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => ({ dia: dataBR(k).slice(0, 5), total: v }));
  }, [servicos]);

  const recentes = useMemo(
    () => [...servicos].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 6),
    [servicos],
  );

  const cores = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

  return (
    <AppShell
      titulo="Dashboard"
      descricao="Visão geral da operação de hoje"
      acoes={
        pode("criar") ? (
          <Button asChild size="sm">
            <Link to="/servicos/novo">
              <Plus className="size-4" /> Novo serviço
            </Link>
          </Button>
        ) : null
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Kpi titulo="Serviços de hoje" valor={resumo.hoje} icone={CalendarClock} />
        <Kpi titulo="Pendentes" valor={resumo.pendentes} icone={Clock} />
        <Kpi titulo="Em andamento" valor={resumo.andamento} icone={Truck} />
        <Kpi titulo="Concluídos" valor={resumo.concluidos} icone={CheckCircle2} />
        <Kpi titulo="Cancelados" valor={resumo.cancelados} icone={XCircle} />
        <Kpi titulo="Atrasados" valor={resumo.atrasados} icone={AlertTriangle} destaque />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold">Serviços por status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={porStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" name="Serviços" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Serviços por tipo</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={porTipo} dataKey="total" nameKey="nome" outerRadius={80} label>
                {porTipo.map((_, i) => (
                  <Cell key={i} fill={cores[i % cores.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Serviços por cliente</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={porCliente} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="nome" width={110} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="total" name="Serviços" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold">Serviços por período</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={porPeriodo}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" name="Serviços" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Serviços recentes</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/servicos">Ver todos</Link>
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {recentes.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <Link
                    to="/servicos/$id"
                    params={{ id: s.id }}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {s.numero}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {nomes.cliente(s.clienteId)} · {dataBR(s.dataServico)} {s.horario} · {s.cidade}/{s.estado}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{brl(s.valorServico)}</span>
                  <StatusChip status={s.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-3 text-sm font-semibold">Alertas ({alertas.length})</h2>
          <ul className="space-y-2">
            {alertas.slice(0, 8).map((a) => (
              <li
                key={a.id}
                className={
                  a.nivel === "alto"
                    ? "rounded-md border border-destructive/30 bg-destructive/5 p-2.5"
                    : "rounded-md border border-border bg-muted/50 p-2.5"
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{a.tipo}</span>
                  <Link
                    to="/servicos/$id"
                    params={{ id: a.servico.id }}
                    className="text-xs text-primary hover:underline"
                  >
                    {a.servico.numero}
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">{a.descricao}</p>
              </li>
            ))}
            {alertas.length === 0 ? (
              <li className="text-xs text-muted-foreground">Nenhum alerta no momento.</li>
            ) : null}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
