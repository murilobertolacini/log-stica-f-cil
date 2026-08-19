import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogistica } from "@/lib/logistica/store";
import {
  ALL_STATUS,
  FORMAS_PAGAMENTO,
  STATUS_LABEL,
  TIPOS_SERVICO,
  type Service,
  type ServiceStatus,
} from "@/lib/logistica/types";
import { hojeISO } from "@/lib/logistica/format";

type Form = Omit<Service, "id" | "numero" | "criadoEm" | "historico">;

const vazio = (): Form => ({
  dataServico: hojeISO(),
  horario: "08:00",
  clienteId: "",
  tipo: "Coleta",
  status: "solicitado",
  responsavel: "",
  localColeta: "",
  enderecoOrigem: "",
  localEntrega: "",
  enderecoDestino: "",
  cidade: "",
  estado: "",
  cep: "",
  motoristaId: null,
  veiculoId: null,
  volumes: 1,
  peso: 0,
  observacoes: "",
  valorServico: 0,
  valorFrete: 0,
  custosAdicionais: 0,
  formaPagamento: "Faturado 30d",
  observacoesFinanceiras: "",
});

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {titulo}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function Campo({
  label,
  erro,
  children,
  full,
}: {
  label: string;
  erro?: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2 lg:col-span-3" : undefined}>
      <Label className="mb-1.5 block text-xs font-medium">{label}</Label>
      {children}
      {erro ? <p className="mt-1 text-xs text-destructive">{erro}</p> : null}
    </div>
  );
}

export function ServiceForm({ servico }: { servico?: Service }) {
  const { clientes, motoristas, veiculos, criarServico, atualizarServico } = useLogistica();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form>(servico ? { ...servico } : vazio());
  const [erros, setErros] = useState<Record<string, string>>({});

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const escolherCliente = (id: string) => {
    const c = clientes.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      clienteId: id,
      localEntrega: f.localEntrega || (c?.nome ?? ""),
      enderecoDestino: f.enderecoDestino || (c?.endereco ?? ""),
      cidade: f.cidade || (c?.cidade ?? ""),
      estado: f.estado || (c?.estado ?? ""),
      cep: f.cep || (c?.cep ?? ""),
    }));
  };

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.clienteId) e['clienteId'] = "Selecione um cliente";
    if (!form.dataServico) e['dataServico'] = "Informe a data do serviço";
    if (!form.responsavel.trim()) e['responsavel'] = "Informe o responsável interno";
    if (!form.localColeta.trim()) e['localColeta'] = "Informe o local de coleta";
    if (!form.enderecoDestino.trim()) e['enderecoDestino'] = "Informe o endereço de destino";
    if (form.volumes < 1) e['volumes'] = "Mínimo de 1 volume";
    if (form.valorServico < 0) e['valorServico'] = "Valor inválido";
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const salvar = () => {
    if (!validar()) {
      toast.error("Verifique os campos destacados antes de salvar.");
      return;
    }
    if (servico) {
      atualizarServico(servico.id, form);
      toast.success(`Serviço ${servico.numero} atualizado.`);
      navigate({ to: "/servicos/$id", params: { id: servico.id } });
    } else {
      const novo = criarServico(form);
      toast.success(`Serviço ${novo.numero} criado com sucesso.`);
      navigate({ to: "/servicos/$id", params: { id: novo.id } });
    }
  };

  return (
    <div className="space-y-5">
      <Secao titulo="Dados gerais">
        <Campo label="Número do serviço">
          <Input value={servico?.numero ?? "Gerado automaticamente"} readOnly className="bg-muted" />
        </Campo>
        <Campo label="Data do serviço" erro={erros['dataServico']}>
          <Input type="date" value={form.dataServico} onChange={(e) => set("dataServico", e.target.value)} />
        </Campo>
        <Campo label="Horário">
          <Input type="time" value={form.horario} onChange={(e) => set("horario", e.target.value)} />
        </Campo>
        <Campo label="Cliente" erro={erros['clienteId']}>
          <Select value={form.clienteId} onValueChange={escolherCliente}>
            <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo label="Tipo de serviço">
          <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIPOS_SERVICO.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo label="Status">
          <Select value={form.status} onValueChange={(v) => set("status", v as ServiceStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL_STATUS.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo label="Responsável interno" erro={erros['responsavel']}>
          <Input value={form.responsavel} onChange={(e) => set("responsavel", e.target.value)} placeholder="Ex.: Ana Paula" maxLength={80} />
        </Campo>
      </Secao>

      <Secao titulo="Origem e destino">
        <Campo label="Local de coleta" erro={erros['localColeta']}>
          <Input value={form.localColeta} onChange={(e) => set("localColeta", e.target.value)} maxLength={120} />
        </Campo>
        <Campo label="Endereço de origem">
          <Input value={form.enderecoOrigem} onChange={(e) => set("enderecoOrigem", e.target.value)} maxLength={160} />
        </Campo>
        <Campo label="Local de entrega">
          <Input value={form.localEntrega} onChange={(e) => set("localEntrega", e.target.value)} maxLength={120} />
        </Campo>
        <Campo label="Endereço de destino" erro={erros['enderecoDestino']}>
          <Input value={form.enderecoDestino} onChange={(e) => set("enderecoDestino", e.target.value)} maxLength={160} />
        </Campo>
        <Campo label="Cidade">
          <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)} maxLength={80} />
        </Campo>
        <Campo label="Estado">
          <Input value={form.estado} onChange={(e) => set("estado", e.target.value.toUpperCase().slice(0, 2))} placeholder="SP" />
        </Campo>
        <Campo label="CEP">
          <Input value={form.cep} onChange={(e) => set("cep", e.target.value)} placeholder="00000-000" maxLength={9} />
        </Campo>
      </Secao>

      <Secao titulo="Dados da operação">
        <Campo label="Motorista">
          <Select value={form.motoristaId ?? "nenhum"} onValueChange={(v) => set("motoristaId", v === "nenhum" ? null : v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">A definir</SelectItem>
              {motoristas.filter((m) => m.ativo).map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo label="Veículo / placa">
          <Select value={form.veiculoId ?? "nenhum"} onValueChange={(v) => set("veiculoId", v === "nenhum" ? null : v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">A definir</SelectItem>
              {veiculos.filter((v) => v.ativo).map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.placa} · {v.modelo} ({v.tipo})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo label="Quantidade de volumes" erro={erros['volumes']}>
          <Input type="number" min={1} value={form.volumes} onChange={(e) => set("volumes", Number(e.target.value))} />
        </Campo>
        <Campo label="Peso (kg)">
          <Input type="number" min={0} value={form.peso} onChange={(e) => set("peso", Number(e.target.value))} />
        </Campo>
        <Campo label="Observações operacionais" full>
          <Textarea value={form.observacoes ?? ""} onChange={(e) => set("observacoes", e.target.value)} maxLength={1000} rows={3} />
        </Campo>
      </Secao>

      <Secao titulo="Informações financeiras">
        <Campo label="Valor do serviço (R$)" erro={erros['valorServico']}>
          <Input type="number" min={0} step="0.01" value={form.valorServico} onChange={(e) => set("valorServico", Number(e.target.value))} />
        </Campo>
        <Campo label="Valor do frete (R$)">
          <Input type="number" min={0} step="0.01" value={form.valorFrete} onChange={(e) => set("valorFrete", Number(e.target.value))} />
        </Campo>
        <Campo label="Custos adicionais (R$)">
          <Input type="number" min={0} step="0.01" value={form.custosAdicionais} onChange={(e) => set("custosAdicionais", Number(e.target.value))} />
        </Campo>
        <Campo label="Forma de pagamento">
          <Select value={form.formaPagamento} onValueChange={(v) => set("formaPagamento", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FORMAS_PAGAMENTO.map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Campo>
        <Campo label="Observações financeiras" full>
          <Textarea value={form.observacoesFinanceiras ?? ""} onChange={(e) => set("observacoesFinanceiras", e.target.value)} maxLength={1000} rows={3} />
        </Campo>
      </Secao>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => navigate({ to: "/servicos" })}>Cancelar</Button>
        <Button onClick={salvar}>{servico ? "Salvar alterações" : "Criar serviço"}</Button>
      </div>
    </div>
  );
}