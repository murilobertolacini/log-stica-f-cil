import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Truck,
  Users,
  IdCard,
  BarChart3,
  Package,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLogistica } from "@/lib/logistica/store";
import type { Role } from "@/lib/logistica/types";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/servicos", label: "Serviços", icon: Package },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/motoristas", label: "Motoristas", icon: IdCard },
  { to: "/veiculos", label: "Veículos", icon: Truck },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map((item) => {
        const ativo = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              ativo && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-2 px-5 py-5">
      <div className="grid size-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Truck className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-sidebar-foreground">LogControl</p>
        <p className="text-xs text-sidebar-foreground/60">Gestão de serviços</p>
      </div>
    </div>
  );
}

export function AppShell({
  titulo,
  descricao,
  acoes,
  children,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  children: ReactNode;
}) {
  const { usuario, setPapel } = useLogistica();
  const [aberto, setAberto] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Marca />
        <NavLinks />
        <div className="mt-auto border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/70">
          <p className="font-medium text-sidebar-foreground">{usuario.nome}</p>
          <p className="capitalize">{usuario.papel}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-card/90 px-4 py-3 backdrop-blur md:px-6">
          <Sheet open={aberto} onOpenChange={setAberto}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-sidebar p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Marca />
              <NavLinks onNavigate={() => setAberto(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold tracking-tight">{titulo}</h1>
            {descricao ? (
              <p className="truncate text-xs text-muted-foreground">{descricao}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Select value={usuario.papel} onValueChange={(v) => setPapel(v as Role)}>
              <SelectTrigger className="h-9 w-[168px]" aria-label="Perfil de acesso">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrador">Administrador</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
                <SelectItem value="consulta">Consulta</SelectItem>
              </SelectContent>
            </Select>
            {acoes}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}