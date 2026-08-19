import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/logistica/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Client } from "@/lib/logistica/types";

export const Route = createFileRoute("/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes | LogControl" },
      { name: "description", content: "Cadastro de clientes com CNPJ/CPF, contato e endereço para preenchimento automático." },
      { property: "og:title", content: "Clientes | LogControl" },
      { property: "og:description", content: "Gerencie a base de clientes usada nos serviços de logística." },
    ],
  }),
  component: Clientes,
});

const vazio = (): Client => ({
  id: `c${Date.now()}`,
  nome: "",
  documento: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  observacoes: "",
});

function Clientes() {
  const { clientes, salvarCliente, servicos, pode } = useLogistica();
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<Client>(vazio());

  const lista = clientes.filter((c) =>
    `${c.nome} ${c.documento} ${c.cidade}`.toLowerCase().includes(busca.trim().toLowerCase()),
  );

  const salvar = () => {
    if (!form.nome.trim() || !form.documento.trim()) {
      toast.error("Nome e CNPJ/CPF são obrigatórios.");
      return;
    }
    salvarCliente(form);
    toast.success("Cliente salvo com sucesso.");
    setAberto(false);
    setForm(vazio());
  };

  const campo = (label: string, key: keyof Client, tipo = "text") => (
    <div>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      <Input
        type={tipo}
        value={String(form[key] ?? "")}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        maxLength={160}
      />
    </div>
  );

  return (
    <AppShell
      titulo="Clientes"
      descricao={`${clientes.length} cliente(s) cadastrados`}
      acoes={
        pode("criar") ? (
          <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setForm(vazio())}>
                <Plus className="size-4" /> Novo cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader><DialogTitle>Novo cliente</DialogTitle></DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                {campo("Nome / Razão social", "nome")}
                {campo("CNPJ / CPF", "documento")}
                {campo("Telefone", "telefone")}
                {campo("E-mail", "email", "email")}
                {campo("Endereço", "endereco")}
                {campo("Cidade", "cidade")}
                {campo("Estado", "estado")}
                {campo("CEP", "cep")}
                <div className="sm:col-span-2">
                  <Label className="mb-1.5 block text-xs">Observações</Label>
                  <Textarea
                    rows={3}
                    maxLength={1000}
                    value={form.observacoes ?? ""}
                    onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
                <Button onClick={salvar}>Salvar cliente</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null
      }
    >
      <div className="surface-card mb-4 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((c) => (
          <article key={c.id} className="surface-card p-4">
            <h2 className="text-sm font-semibold">{c.nome}</h2>
            <p className="text-xs text-muted-foreground">{c.documento}</p>
            <dl className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Telefone</dt><dd>{c.telefone || "—"}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">E-mail</dt><dd className="truncate">{c.email || "—"}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Cidade</dt><dd>{c.cidade}/{c.estado}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Serviços</dt><dd>{servicos.filter((s) => s.clienteId === c.id).length}</dd></div>
            </dl>
            {c.observacoes ? <p className="mt-3 rounded-md bg-muted p-2 text-xs">{c.observacoes}</p> : null}
          </article>
        ))}
      </div>
    </AppShell>
  );
}