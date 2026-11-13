// Metricas proprias do site (visitas, tempo, rolagem e cliques), mostradas ao cliente
// no portal da TaskMind. Sem cookies de terceiros e sem guardar IP: o navegador manda
// os eventos para /api/m (este site), que repassa ao banco do portal.
// Este arquivo e compartilhado entre o navegador (components/Metricas.tsx) e a rota.

export const ENDPOINT_METRICAS = "/api/m";

export const ORIGENS = [
  "Direto",
  "Google (busca)",
  "Google Ads",
  "Meta Ads",
  "Instagram",
  "Facebook",
  "Instagram/Facebook",
  "WhatsApp",
  "Outras buscas",
  "Outros sites",
  "Campanha",
] as const;
export type Origem = (typeof ORIGENS)[number];

export const TIPOS_CLIQUE = [
  "whatsapp",
  "loja",
  "telefone",
  "mapa",
  "produto",
  "categoria",
  "banner",
  "rede_social",
  "link",
  "link_externo",
  "botao",
] as const;
export type TipoClique = (typeof TIPOS_CLIQUE)[number];

export const DISPOSITIVOS = ["Celular", "Tablet", "Computador"] as const;

export type EventoMetrica =
  | { t: "pv"; id: string; c: string; o: string; r?: string; cp?: string; d: string }
  | { t: "tempo"; id: string; seg: number; rol: number }
  | { t: "clique"; pg?: string; c: string; tipo: string; alvo: string; sec?: string };

export type LoteMetricas = { v: string; s: string; e: EventoMetrica[] };
