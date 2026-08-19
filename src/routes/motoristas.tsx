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
import type { Driver } from "@/lib/logistica/types";

export const Route = createFileRoute("/motoristas")({
  head: () => ({
    meta: [
      { title: "Motoristas | LogControl" },
      { name: "description", content: "Cadastro de motoristas com contato, documento e status ativo/inativo." },
      { property: "og:title", content: "Motoristas | LogControl" },
      { property: "og:description", content: "Controle quais motoristas estão disponíveis para os serviços." },
    ],
  }),
  component: Motoristas,
});

const vazio = (): Driver => ({ id: `m${Date.now()}`, nome: "", telefone: "", documento: "", ativo: true, observacoes: "" });

function Motoristas() {
  const { motoristas, salvarMotorista, servicos, pode } = useLogistica();
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<Driver>(vazio());

  const salvar = () => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do motorista.");
      return;
    }
    salvarMotorista(form);
    toast.success("Motorista salvo.");
    setAberto(false);
    setForm(vazio());
  };

  return (
    <AppShell
      titulo="Motoristas"
      descricao={`${motoristas.filter((m) => m.ativo).length} ativo(s) de ${motoristas.length}`}
      acoes={
        pode("criar") ? (
          <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setForm(vazio())}><Plus className="size-4" /> Novo motorista</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo motorista</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div><Label className="mb-1.5 block text-xs">Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} maxLength={100} /></div>
                <div><Label className="mb-1.5 block text-xs">Telefone</Label><Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} maxLength={20} /></div>
                <div><Label className="mb-1.5 block text-xs">Documento</Label><Input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} maxLength={20} /></div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.ativo} onCheckedChange={(v) => setForm({ ...form, ativo: v })} id="ativo" />
                  <Label htmlFor="ativo" className="text-xs">Motorista ativo</Label>
                </div>
                <div><Label className="mb-1.5 block text-xs">Observações</Label><Textarea rows={3} maxLength={500} value={form.observacoes ?? ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
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
      <div className="surface-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Nome</th>
              <th className="px-3 py-2 text-left font-medium">Telefone</th>
              <th className="px-3 py-2 text-left font-medium">Documento</th>
              <th className="px-3 py-2 text-left font-medium">Serviços</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Observações</th>
            </tr>
          </thead>
          <tbody>
            {motoristas.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-medium">{m.nome}</td>
                <td className="px-3 py-2">{m.telefone}</td>
                <td className="px-3 py-2">{m.documento}</td>
                <td className="px-3 py-2">{servicos.filter((s) => s.motoristaId === m.id).length}</td>
                <td className="px-3 py-2">
                  <span className="status-chip" data-status={m.ativo ? "entregue" : "cancelado"}>
                    {m.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{m.observacoes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}