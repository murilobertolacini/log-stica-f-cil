import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/logistica/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLogistica } from "@/lib/logistica/store";
import type { Vehicle } from "@/lib/logistica/types";

export const Route = createFileRoute("/veiculos")({
  head: () => ({
    meta: [
      { title: "Veículos | LogControl" },
      { name: "description", content: "Frota cadastrada: placa, modelo, tipo, capacidade e disponibilidade." },
      { property: "og:title", content: "Veículos | LogControl" },
      { property: "og:description", content: "Saiba quais veículos estão disponíveis para alocar nos serviços." },
    ],
  }),
  component: Veiculos,
});

const vazio = (): Vehicle => ({ id: `v${Date.now()}`, placa: "", modelo: "", tipo: "3/4", capacidade: "", ativo: true, observacoes: "" });

function Veiculos() {
  const { veiculos, salvarVeiculo, servicos, pode } = useLogistica();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<Vehicle>(vazio());

  const salvar = () => {
    if (!form.placa.trim() || !form.modelo.trim()) {
      toast.error("Placa e modelo são obrigatórios.");
      return;
    }
    salvarVeiculo(form);
    toast.success("Veículo salvo.");
    setAberto(false);
    setForm(vazio());
  };

  return (
    <AppShell
      titulo="Veículos"
      descricao={`${veiculos.filter((v) => v.ativo).length} disponível(is) de ${veiculos.length}`}
      acoes={
        pode("criar") ? (
          <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setForm(vazio())}><Plus className="size-4" /> Novo veículo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo veículo</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label className="mb-1.5 block text-xs">Placa</Label><Input value={form.placa} onChange={(e) => setForm({ ...form, placa: e.target.value.toUpperCase() })} maxLength={8} /></div>
                <div><Label className="mb-1.5 block text-xs">Modelo</Label><Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} maxLength={60} /></div>
                <div><Label className="mb-1.5 block text-xs">Tipo</Label><Input value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} maxLength={40} /></div>
                <div><Label className="mb-1.5 block text-xs">Capacidade</Label><Input value={form.capacidade} onChange={(e) => setForm({ ...form, capacidade: e.target.value })} maxLength={30} /></div>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <Switch id="v-ativo" checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
                  <Label htmlFor="v-ativo" className="text-xs">Veículo disponível</Label>
                </div>
                <div className="sm:col-span-2"><Label className="mb-1.5 block text-xs">Observações</Label><Textarea rows={3} maxLength={500} value={form.observacoes ?? ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
                <Button onClick={salvar}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null
      }
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {veiculos.map((v) => (
          <article key={v.id} className="surface-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{v.placa}</h2>
              <span className="status-chip" data-status={v.ativo ? "entregue" : "cancelado"}>
                {v.ativo ? "Disponível" : "Indisponível"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{v.modelo}</p>
            <dl className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between"><dt className="text-muted-foreground">Tipo</dt><dd>{v.tipo}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Capacidade</dt><dd>{v.capacidade}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Serviços</dt><dd>{servicos.filter((s) => s.veiculoId === v.id).length}</dd></div>
            </dl>
            {v.observacoes ? <p className="mt-3 rounded-md bg-muted p-2 text-xs">{v.observacoes}</p> : null}
          </article>
        ))}
      </div>
    </AppShell>
  );
}