import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CLIENTES, MOTORISTAS, SERVICOS, VEICULOS } from "./mock";
import type { Client, Driver, Role, Service, ServiceStatus, Vehicle } from "./types";

export type Filtros = {
  busca: string;
  status: string;
  cliente: string;
  motorista: string;
  cidade: string;
  de: string;
  ate: string;
};

export const FILTROS_VAZIOS: Filtros = {
  busca: "",
  status: "todos",
  cliente: "todos",
  motorista: "todos",
  cidade: "todas",
  de: "",
  ate: "",
};

type Ctx = {
  usuario: { nome: string; papel: Role };
  setPapel: (p: Role) => void;
  pode: (acao: "criar" | "editar" | "status" | "gerenciar") => boolean;
  servicos: Service[];
  clientes: Client[];
  motoristas: Driver[];
  veiculos: Vehicle[];
  filtros: Filtros;
  setFiltros: (f: Filtros) => void;
  criarServico: (dados: Omit<Service, "id" | "numero" | "criadoEm" | "historico">) => Service;
  atualizarServico: (id: string, dados: Partial<Service>) => void;
  alterarStatus: (id: string, novo: ServiceStatus) => void;
  duplicarServico: (id: string) => Service | undefined;
  salvarCliente: (c: Client) => void;
  salvarMotorista: (m: Driver) => void;
  salvarVeiculo: (v: Vehicle) => void;
};

const LogisticaContext = createContext<Ctx | null>(null);

export function LogisticaProvider({ children }: { children: ReactNode }) {
  const [papel, setPapel] = useState<Role>("administrador");
  const [servicos, setServicos] = useState<Service[]>(SERVICOS);
  const [clientes, setClientes] = useState<Client[]>(CLIENTES);
  const [motoristas, setMotoristas] = useState<Driver[]>(MOTORISTAS);
  const [veiculos, setVeiculos] = useState<Vehicle[]>(VEICULOS);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VAZIOS);

  const pode = useCallback(
    (acao: "criar" | "editar" | "status" | "gerenciar") => {
      if (papel === "administrador") return true;
      if (papel === "operacional") return acao !== "gerenciar";
      return false;
    },
    [papel],
  );

  const proximoNumero = useCallback(() => {
    const nums = servicos.map((s) => Number(s.numero.replace("SRV-", "")) || 0);
    return `SRV-${Math.max(2600, ...nums) + 1}`;
  }, [servicos]);

  const criarServico: Ctx["criarServico"] = useCallback(
    (dados) => {
      const agora = new Date().toISOString();
      const novo: Service = {
        ...dados,
        id: `s${Date.now()}`,
        numero: proximoNumero(),
        criadoEm: agora,
        historico: [{ de: null, para: dados.status, em: agora, usuario: "Você" }],
      };
      setServicos((prev) => [novo, ...prev]);
      return novo;
    },
    [proximoNumero],
  );

  const atualizarServico: Ctx["atualizarServico"] = useCallback((id, dados) => {
    setServicos((prev) => prev.map((s) => (s.id === id ? { ...s, ...dados } : s)));
  }, []);

  const alterarStatus: Ctx["alterarStatus"] = useCallback((id, novo) => {
    setServicos((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: novo,
              historico: [
                ...s.historico,
                { de: s.status, para: novo, em: new Date().toISOString(), usuario: "Você" },
              ],
            }
          : s,
      ),
    );
  }, []);

  const duplicarServico: Ctx["duplicarServico"] = useCallback(
    (id) => {
      const base = servicos.find((s) => s.id === id);
      if (!base) return undefined;
      const agora = new Date().toISOString();
      const copia: Service = {
        ...base,
        id: `s${Date.now()}`,
        numero: proximoNumero(),
        criadoEm: agora,
        status: "solicitado",
        historico: [{ de: null, para: "solicitado", em: agora, usuario: "Você" }],
      };
      setServicos((prev) => [copia, ...prev]);
      return copia;
    },
    [servicos, proximoNumero],
  );

  const salvarCliente = useCallback((c: Client) => {
    setClientes((prev) => (prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, c]));
  }, []);
  const salvarMotorista = useCallback((m: Driver) => {
    setMotoristas((prev) => (prev.some((x) => x.id === m.id) ? prev.map((x) => (x.id === m.id ? m : x)) : [...prev, m]));
  }, []);
  const salvarVeiculo = useCallback((v: Vehicle) => {
    setVeiculos((prev) => (prev.some((x) => x.id === v.id) ? prev.map((x) => (x.id === v.id ? v : x)) : [...prev, v]));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      usuario: { nome: "Murilo Ferrari", papel },
      setPapel,
      pode,
      servicos,
      clientes,
      motoristas,
      veiculos,
      filtros,
      setFiltros,
      criarServico,
      atualizarServico,
      alterarStatus,
      duplicarServico,
      salvarCliente,
      salvarMotorista,
      salvarVeiculo,
    }),
    [
      papel,
      pode,
      servicos,
      clientes,
      motoristas,
      veiculos,
      filtros,
      criarServico,
      atualizarServico,
      alterarStatus,
      duplicarServico,
      salvarCliente,
      salvarMotorista,
      salvarVeiculo,
    ],
  );

  return <LogisticaContext.Provider value={value}>{children}</LogisticaContext.Provider>;
}

export function useLogistica() {
  const ctx = useContext(LogisticaContext);
  if (!ctx) throw new Error("useLogistica precisa estar dentro de LogisticaProvider");
  return ctx;
}

export function useNomes() {
  const { clientes, motoristas, veiculos } = useLogistica();
  return useMemo(
    () => ({
      cliente: (id: string) => clientes.find((c) => c.id === id)?.nome ?? "—",
      motorista: (id: string | null) => (id ? (motoristas.find((m) => m.id === id)?.nome ?? "—") : "—"),
      veiculo: (id: string | null) => {
        const v = id ? veiculos.find((x) => x.id === id) : undefined;
        return v ? `${v.placa} · ${v.modelo}` : "—";
      },
    }),
    [clientes, motoristas, veiculos],
  );
}

export type Alerta = { id: string; tipo: string; servico: Service; descricao: string; nivel: "alto" | "medio" };

export function useAlertas(): Alerta[] {
  const { servicos } = useLogistica();
  return useMemo(() => {
    const hoje = new Date().toISOString().slice(0, 10);
    const abertos = servicos.filter((s) => !["finalizado", "cancelado", "entregue"].includes(s.status));
    const lista: Alerta[] = [];
    for (const s of abertos) {
      if (s.dataServico < hoje)
        lista.push({ id: `${s.id}-atraso`, tipo: "Atrasado", servico: s, descricao: `Data do serviço venceu em ${s.dataServico.split("-").reverse().join("/")}`, nivel: "alto" });
      if (!s.motoristaId)
        lista.push({ id: `${s.id}-mot`, tipo: "Sem motorista", servico: s, descricao: "Nenhum motorista atribuído", nivel: "medio" });
      if (!s.veiculoId)
        lista.push({ id: `${s.id}-vei`, tipo: "Sem veículo", servico: s, descricao: "Nenhum veículo atribuído", nivel: "medio" });
      const ultimo = s.historico[s.historico.length - 1];
      if (ultimo && Date.now() - new Date(ultimo.em).getTime() > 1000 * 60 * 60 * 72)
        lista.push({ id: `${s.id}-parado`, tipo: "Parado há muito tempo", servico: s, descricao: "Sem mudança de status há mais de 72h", nivel: "medio" });
    }
    return lista;
  }, [servicos]);
}