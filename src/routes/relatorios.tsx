import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/logistica/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogistica, useNomes } from "@/lib/logistica/store";
import { brl } from "@/lib/logistica/format";
import { STATUS_LABEL } from "@/lib/logistica/types";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios | LogControl" },
      { name: "description", content: "Relatórios de serviços por cliente, motorista, veículo e status, com faturamento e custos." },
      { property: "og:title", content: "Relatórios | LogControl" },
      { property: "og:description", content: "Analise faturamento, custos e desempenho da operação por período." },
    ],
  }),
  component: Relatorios,
});

type Linha = { chave: string; qtd: number; faturamento: number; custos: number };

function Tabela({ titulo, linhas }: { titulo: string; linhas: Linha[] }) {
  return (
    <div className="surface-card overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-medium">{titulo}</th>
            <th className="px-3 py-2 text-right font-medium">Serviços</th>
            <th className="px-3 py-2 text-right font-medium">Faturamento</th>
            <th className="px-3 py-2 text-right font-medium">Custos</th>
            <th className="px-3 py-2 text-right font-medium">Margem</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.chave} className="border-b border-border last:border-0">
              <td className="px-3 py-2">{l.chave}</td>
              <td className="px-3 py-2 text-right">{l.qtd}</td>
              <td className="px-3 py-2 text-right">{brl(l.faturamento)}</td>
              <td className="px-3 py-2 text-right">{brl(l.custos)}</td>
              <td className="px-3 py-2 text-right font-medium">{brl(l.faturamento - l.custos)}</td>
            </tr>
          ))}
          {linhas.length === 0 ? (
            <tr><td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">Sem dados no período.</td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function Relatorios() {
  const { servicos } = useLogistica();
  const nomes = useNomes();
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const periodo = useMemo(
    () => servicos.filter((s) => (!de || s.dataServico >= de) && (!ate || s.dataServico <= ate)),
    [servicos, de, ate],
  );

  const agrupar = (fn: (s: (typeof periodo)[number]) => string): Linha[] => {
    const mapa = new Map<string, Linha>();
    periodo.forEach((s) => {
      const chave = fn(s);
      const atual = mapa.get(chave) ?? { chave, qtd: 0, faturamento: 0, custos: 0 };
      atual.qtd += 1;
      atual.faturamento += s.valorServico;
      atual.custos += s.valorFrete + s.custosAdicionais;
      mapa.set(chave, atual);
    });
    return [...mapa.values()].sort((a, b) => b.faturamento - a.faturamento);
  };

  const totais = periodo.reduce(
    (acc, s) => ({
      qtd: acc.qtd + 1,
      faturamento: acc.faturamento + s.valorServico,
      custos: acc.custos + s.valorFrete + s.custosAdicionais,
      cancelados: acc.cancelados + (s.status === "cancelado" ? 1 : 0),
    }),
    { qtd: 0, faturamento: 0, custos: 0, cancelados: 0 },
  );

  const exportar = () => {
    const linhas = [
      ["ID", "Data", "Cliente", "Motorista", "Veículo", "Status", "Valor", "Frete", "Custos"],
      ...periodo.map((s) => [
        s.numero,
        s.dataServico,
        nomes.cliente(s.clienteId),
        nomes.motorista(s.motoristaId),
        nomes.veiculo(s.veiculoId),
        STATUS_LABEL[s.status],
        String(s.valorServico).replace(".", ","),
        String(s.valorFrete).replace(".", ","),
        String(s.custosAdicionais).replace(".", ","),
      ]),
    ];
    const csv = linhas.map((l) => l.map((c) => `"${c}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio-servicos.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado em CSV.");
  };

  return (
    <AppShell
      titulo="Relatórios"
      descricao="Análise da operação por período"
      acoes={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportar}><Download className="size-4" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>PDF</Button>
        </div>
      }
    >
      <div className="surface-card mb-4 flex flex-wrap items-end gap-3 p-4">
        <div>
          <Label className="mb-1.5 block text-xs">De</Label>
          <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs">Até</Label>
          <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
        </div>
        <Button variant="ghost" onClick={() => { setDe(""); setAte(""); }}>Limpar período</Button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface-card p-4"><p className="text-xs text-muted-foreground">Serviços realizados</p><p className="text-2xl font-semibold">{totais.qtd}</p></div>
        <div className="surface-card p-4"><p className="text-xs text-muted-foreground">Faturamento</p><p className="text-2xl font-semibold">{brl(totais.faturamento)}</p></div>
        <div className="surface-card p-4"><p className="text-xs text-muted-foreground">Custos</p><p className="text-2xl font-semibold">{brl(totais.custos)}</p></div>
        <div className="surface-card p-4"><p className="text-xs text-muted-foreground">Cancelados</p><p className="text-2xl font-semibold">{totais.cancelados}</p></div>
      </div>

      <Tabs defaultValue="cliente">
        <TabsList className="mb-3 flex-wrap">
          <TabsTrigger value="cliente">Por cliente</TabsTrigger>
          <TabsTrigger value="motorista">Por motorista</TabsTrigger>
          <TabsTrigger value="veiculo">Por veículo</TabsTrigger>
          <TabsTrigger value="status">Por status</TabsTrigger>
        </TabsList>
        <TabsContent value="cliente"><Tabela titulo="Cliente" linhas={agrupar((s) => nomes.cliente(s.clienteId))} /></TabsContent>
        <TabsContent value="motorista"><Tabela titulo="Motorista" linhas={agrupar((s) => nomes.motorista(s.motoristaId))} /></TabsContent>
        <TabsContent value="veiculo"><Tabela titulo="Veículo" linhas={agrupar((s) => nomes.veiculo(s.veiculoId))} /></TabsContent>
        <TabsContent value="status"><Tabela titulo="Status" linhas={agrupar((s) => STATUS_LABEL[s.status])} /></TabsContent>
      </Tabs>
    </AppShell>
  );
}