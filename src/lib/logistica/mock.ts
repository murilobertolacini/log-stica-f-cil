import type { Client, Driver, Service, ServiceStatus, Vehicle } from "./types";

const d = (offset: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().slice(0, 10);
};

const ts = (dayOffset: number, hour: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + dayOffset);
  dt.setHours(hour, 15, 0, 0);
  return dt.toISOString();
};

export const CLIENTES: Client[] = [
  {
    id: "c1",
    nome: "Indústria Ferrari Ltda",
    documento: "12.345.678/0001-90",
    telefone: "(11) 3344-5566",
    email: "logistica@ferrariltda.com.br",
    endereco: "Av. das Indústrias, 1200 - Galpão 4",
    cidade: "São Paulo",
    estado: "SP",
    cep: "04710-000",
    observacoes: "Recebe carga somente até as 16h.",
  },
  {
    id: "c2",
    nome: "Supermercados Bonanza S/A",
    documento: "98.765.432/0001-10",
    telefone: "(11) 2222-8080",
    email: "compras@bonanza.com.br",
    endereco: "Rua Vergueiro, 900",
    cidade: "Campinas",
    estado: "SP",
    cep: "13010-100",
  },
  {
    id: "c3",
    nome: "TecnoParts Distribuidora",
    documento: "44.555.666/0001-77",
    telefone: "(21) 3555-1010",
    email: "expedicao@tecnoparts.com",
    endereco: "Rod. Presidente Dutra, km 210",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    cep: "21040-360",
  },
  {
    id: "c4",
    nome: "Agro Vale Verde",
    documento: "33.221.100/0001-05",
    telefone: "(31) 3777-4040",
    email: "contato@valeverde.agr.br",
    endereco: "Estrada do Vale, s/n",
    cidade: "Uberlândia",
    estado: "MG",
    cep: "38400-000",
  },
];

export const MOTORISTAS: Driver[] = [
  { id: "m1", nome: "Carlos Andrade", telefone: "(11) 98888-1122", documento: "123.456.789-00", ativo: true },
  { id: "m2", nome: "Rafael Souza", telefone: "(11) 97777-3344", documento: "234.567.890-11", ativo: true },
  { id: "m3", nome: "João Peixoto", telefone: "(21) 96666-5566", documento: "345.678.901-22", ativo: true },
  { id: "m4", nome: "Marcos Lima", telefone: "(31) 95555-7788", documento: "456.789.012-33", ativo: false, observacoes: "Afastado — férias" },
];

export const VEICULOS: Vehicle[] = [
  { id: "v1", placa: "ABC-1D23", modelo: "Mercedes Accelo", tipo: "Truck", capacidade: "8.000 kg", ativo: true },
  { id: "v2", placa: "EFG-4H56", modelo: "VW Delivery", tipo: "3/4", capacidade: "3.500 kg", ativo: true },
  { id: "v3", placa: "IJK-7L89", modelo: "Fiat Fiorino", tipo: "Utilitário", capacidade: "650 kg", ativo: true },
  { id: "v4", placa: "MNO-0P12", modelo: "Scania R450", tipo: "Carreta", capacidade: "27.000 kg", ativo: false, observacoes: "Em manutenção" },
];

type Seed = {
  numero: string;
  dias: number;
  hora: string;
  clienteId: string;
  tipo: string;
  status: ServiceStatus;
  responsavel: string;
  motoristaId: string | null;
  veiculoId: string | null;
  cidade: string;
  estado: string;
  valor: number;
};

const SEEDS: Seed[] = [
  { numero: "SRV-2601", dias: 0, hora: "08:00", clienteId: "c1", tipo: "Coleta", status: "em_transito", responsavel: "Ana Paula", motoristaId: "m1", veiculoId: "v1", cidade: "São Paulo", estado: "SP", valor: 1850 },
  { numero: "SRV-2602", dias: 0, hora: "09:30", clienteId: "c2", tipo: "Entrega", status: "em_coleta", responsavel: "Ana Paula", motoristaId: "m2", veiculoId: "v2", cidade: "Campinas", estado: "SP", valor: 970 },
  { numero: "SRV-2603", dias: 0, hora: "11:00", clienteId: "c3", tipo: "Transferência", status: "programado", responsavel: "Bruno Dias", motoristaId: "m3", veiculoId: "v3", cidade: "Rio de Janeiro", estado: "RJ", valor: 3200 },
  { numero: "SRV-2604", dias: 0, hora: "14:00", clienteId: "c4", tipo: "Dedicado", status: "solicitado", responsavel: "Bruno Dias", motoristaId: null, veiculoId: null, cidade: "Uberlândia", estado: "MG", valor: 5400 },
  { numero: "SRV-2605", dias: -1, hora: "07:30", clienteId: "c1", tipo: "Entrega", status: "entregue", responsavel: "Ana Paula", motoristaId: "m1", veiculoId: "v1", cidade: "São Paulo", estado: "SP", valor: 1240 },
  { numero: "SRV-2606", dias: -1, hora: "13:00", clienteId: "c2", tipo: "Coleta", status: "finalizado", responsavel: "Camila Reis", motoristaId: "m2", veiculoId: "v2", cidade: "Campinas", estado: "SP", valor: 780 },
  { numero: "SRV-2607", dias: -2, hora: "10:00", clienteId: "c3", tipo: "Devolução", status: "cancelado", responsavel: "Camila Reis", motoristaId: null, veiculoId: null, cidade: "Rio de Janeiro", estado: "RJ", valor: 640 },
  { numero: "SRV-2608", dias: -2, hora: "16:00", clienteId: "c4", tipo: "Entrega", status: "finalizado", responsavel: "Bruno Dias", motoristaId: "m3", veiculoId: "v3", cidade: "Uberlândia", estado: "MG", valor: 2100 },
  { numero: "SRV-2609", dias: -3, hora: "08:45", clienteId: "c1", tipo: "Mudança", status: "em_entrega", responsavel: "Ana Paula", motoristaId: "m1", veiculoId: "v2", cidade: "São Paulo", estado: "SP", valor: 4300 },
  { numero: "SRV-2610", dias: -4, hora: "09:00", clienteId: "c2", tipo: "Entrega", status: "aguardando_programacao", responsavel: "Camila Reis", motoristaId: null, veiculoId: null, cidade: "Campinas", estado: "SP", valor: 1520 },
  { numero: "SRV-2611", dias: 1, hora: "07:00", clienteId: "c3", tipo: "Coleta", status: "programado", responsavel: "Bruno Dias", motoristaId: "m3", veiculoId: "v1", cidade: "Rio de Janeiro", estado: "RJ", valor: 2650 },
  { numero: "SRV-2612", dias: 1, hora: "15:30", clienteId: "c4", tipo: "Transferência", status: "solicitado", responsavel: "Ana Paula", motoristaId: null, veiculoId: null, cidade: "Uberlândia", estado: "MG", valor: 3890 },
  { numero: "SRV-2613", dias: 2, hora: "10:15", clienteId: "c1", tipo: "Entrega", status: "programado", responsavel: "Camila Reis", motoristaId: "m2", veiculoId: "v3", cidade: "São Paulo", estado: "SP", valor: 1130 },
  { numero: "SRV-2614", dias: -6, hora: "12:00", clienteId: "c2", tipo: "Dedicado", status: "finalizado", responsavel: "Bruno Dias", motoristaId: "m1", veiculoId: "v1", cidade: "Campinas", estado: "SP", valor: 6120 },
  { numero: "SRV-2615", dias: -7, hora: "08:20", clienteId: "c3", tipo: "Coleta", status: "coletado", responsavel: "Ana Paula", motoristaId: "m3", veiculoId: "v2", cidade: "Rio de Janeiro", estado: "RJ", valor: 940 },
];

const ordem: ServiceStatus[] = [
  "solicitado",
  "aguardando_programacao",
  "programado",
  "em_coleta",
  "coletado",
  "em_transito",
  "em_entrega",
  "entregue",
  "finalizado",
];

function historicoDe(status: ServiceStatus, dias: number, responsavel: string) {
  const eventos = [] as Service["historico"];
  let anterior: ServiceStatus | null = null;
  const caminho =
    status === "cancelado"
      ? (["solicitado", "cancelado"] as ServiceStatus[])
      : ordem.slice(0, ordem.indexOf(status) + 1);
  caminho.forEach((s, i) => {
    eventos.push({ de: anterior, para: s, em: ts(dias, 7 + i), usuario: responsavel });
    anterior = s;
  });
  return eventos;
}

export const SERVICOS: Service[] = SEEDS.map((s, i) => {
  const cliente = CLIENTES.find((c) => c.id === s.clienteId)!;
  return {
    id: `s${i + 1}`,
    numero: s.numero,
    criadoEm: ts(s.dias - 1, 9),
    dataServico: d(s.dias),
    horario: s.hora,
    clienteId: s.clienteId,
    tipo: s.tipo,
    status: s.status,
    responsavel: s.responsavel,
    localColeta: "CD Matriz",
    enderecoOrigem: "Av. Logística, 500 - Galpão 2",
    localEntrega: cliente.nome,
    enderecoDestino: cliente.endereco,
    cidade: s.cidade,
    estado: s.estado,
    cep: cliente.cep,
    motoristaId: s.motoristaId,
    veiculoId: s.veiculoId,
    volumes: 4 + (i % 9),
    peso: 250 + i * 130,
    observacoes: i % 3 === 0 ? "Carga frágil, exige paletização." : "",
    valorServico: s.valor,
    valorFrete: Math.round(s.valor * 0.35),
    custosAdicionais: i % 4 === 0 ? 180 : 0,
    formaPagamento: "Faturado 30d",
    observacoesFinanceiras: "",
    historico: historicoDe(s.status, s.dias, s.responsavel),
  };
});