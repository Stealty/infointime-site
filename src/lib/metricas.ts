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
  // clique fora de links e botoes: so entra no mapa de cliques
  "area",
] as const;
export type TipoClique = (typeof TIPOS_CLIQUE)[number];

export const DISPOSITIVOS = ["Celular", "Tablet", "Computador"] as const;

export type EventoMetrica =
  | { t: "pv"; id: string; c: string; o: string; r?: string; cp?: string; d: string }
  | { t: "tempo"; id: string; seg: number; rol: number }
  | {
      t: "clique";
      pg?: string;
      c: string;
      tipo: string;
      alvo: string;
      sec?: string;
      /** px a partir do centro da tela */
      x?: number;
      /** altura na pagina, em milesimos (0-1000) */
      y?: number;
      /** largura da janela */
      w?: number;
    };

export type LoteMetricas = { v: string; s: string; e: EventoMetrica[] };

/**
 * A pagina esta aberta dentro de um iframe (ex.: mapa de cliques do portal da TaskMind).
 * Nesse caso nada e contado: nem as metricas proprias, nem GTM/Google Ads, nem o pixel da Meta.
 */
export function emIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Altura do conteudo da pagina (ate o fim do rodape). Nao usa scrollHeight porque o body tem
 * min-h-screen: dentro do iframe do mapa a altura da janela inflaria a medida.
 * O clique (Metricas) e o mapa (AlturaMapa) usam a mesma medida, para os pontos baterem.
 */
export function alturaPagina() {
  const rodape = document.querySelector("body > footer, footer");
  const fim = rodape ? rodape.getBoundingClientRect().bottom + window.scrollY : 0;
  return Math.max(1, Math.round(fim || document.documentElement.scrollHeight));
}
