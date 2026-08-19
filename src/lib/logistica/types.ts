export const STATUS_FLOW = [
  "solicitado",
  "aguardando_programacao",
  "programado",
  "em_coleta",
  "coletado",
  "em_transito",
  "em_entrega",
  "entregue",
  "finalizado",
] as const;

export type ServiceStatus = (typeof STATUS_FLOW)[number] | "cancelado";

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  solicitado: "Solicitado",
  aguardando_programacao: "Aguardando programação",
  programado: "Programado",
  em_coleta: "Em coleta",
  coletado: "Coletado",
  em_transito: "Em trânsito",
  em_entrega: "Em entrega",
  entregue: "Entregue",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export const ALL_STATUS: ServiceStatus[] = [...STATUS_FLOW, "cancelado"];

export type Role = "administrador" | "operacional" | "consulta";

export type Client = {
  id: string;
  nome: string;
  documento: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  observacoes?: string;
};

export type Driver = {
  id: string;
  nome: string;
  telefone: string;
  documento: string;
  ativo: boolean;
  observacoes?: string;
};

export type Vehicle = {
  id: string;
  placa: string;
  modelo: string;
  tipo: string;
  capacidade: string;
  ativo: boolean;
  observacoes?: string;
};

export type StatusEvent = {
  de: ServiceStatus | null;
  para: ServiceStatus;
  em: string;
  usuario: string;
};

export type Service = {
  id: string;
  numero: string;
  criadoEm: string;
  dataServico: string;
  horario: string;
  clienteId: string;
  tipo: string;
  status: ServiceStatus;
  responsavel: string;
  localColeta: string;
  enderecoOrigem: string;
  localEntrega: string;
  enderecoDestino: string;
  cidade: string;
  estado: string;
  cep: string;
  motoristaId: string | null;
  veiculoId: string | null;
  volumes: number;
  peso: number;
  observacoes?: string;
  valorServico: number;
  valorFrete: number;
  custosAdicionais: number;
  formaPagamento: string;
  observacoesFinanceiras?: string;
  historico: StatusEvent[];
};

export const TIPOS_SERVICO = [
  "Coleta",
  "Entrega",
  "Transferência",
  "Dedicado",
  "Mudança",
  "Devolução",
];

export const FORMAS_PAGAMENTO = ["Faturado 30d", "Boleto", "PIX", "Cartão", "À vista"];