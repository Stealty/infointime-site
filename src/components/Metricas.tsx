"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOJAS } from "@/lib/lojas";
import { ENDPOINT_METRICAS, alturaPagina, emIframe, type EventoMetrica } from "@/lib/metricas";

// Metricas do site para o painel do cliente no portal da TaskMind (ver lib/metricas.ts).
// - visitante: id aleatorio guardado no navegador; nao identifica a pessoa.
// - visita (sessao): termina depois de 30 min sem atividade.
// - tempo: so conta com a aba visivel e alguem mexendo nos ultimos 60 s (ate 30 min por pagina).
// - cliques: links e botoes. Para dar nome melhor a um clique, use data-metrica="tipo:nome"
//   (ex.: data-metrica="banner:Black Friday") e, para a secao, data-secao="Nome".
//   Todo clique (mesmo fora de links) guarda a posicao na pagina para o mapa de cliques.
// - Dentro de iframe (o proprio mapa de cliques do portal) nada e contado.

const CHAVE_VISITANTE = "iit_v";
const CHAVE_SESSAO = "iit_s";
const SESSAO_MS = 30 * 60 * 1000;
const OCIOSO_MS = 60 * 1000;
const ID_VALIDO = /^[A-Za-z0-9-]{8,40}$/;

type Sessao = { id: string; ultimo: number; o: string; r?: string; cp?: string };
type Pagina = {
  id: string;
  caminho: string;
  inicio: number;
  ativoMs: number;
  tick: number;
  acao: number;
  rolagem: number;
  enviadoSeg: number;
  enviadoRol: number;
};

let pagina: Pagina | null = null;
const memoria: Record<string, string> = {};

function novoId() {
  try {
    return crypto.randomUUID();
  } catch {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

function ler(chave: string) {
  try {
    return localStorage.getItem(chave);
  } catch {
    return memoria[chave] ?? null;
  }
}

function gravar(chave: string, valor: string) {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    memoria[chave] = valor;
  }
}

function visitante() {
  let v = ler(CHAVE_VISITANTE);
  if (!v || !ID_VALIDO.test(v)) {
    v = novoId();
    gravar(CHAVE_VISITANTE, v);
  }
  return v;
}

/** De onde a pessoa veio, olhando o endereco de entrada (utm, gclid) e a pagina anterior. */
function origemDaEntrada(): Pick<Sessao, "o" | "r" | "cp"> {
  const q = new URLSearchParams(location.search);
  const cp = q.get("utm_campaign")?.slice(0, 120) || undefined;
  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
  } catch {}
  if (host && host === location.hostname.replace(/^www\./, "")) host = "";
  const r = host || undefined;

  if (q.has("gclid") || q.has("gbraid") || q.has("wbraid")) return { o: "Google Ads", r, cp };

  const fonte = (q.get("utm_source") || "").toLowerCase();
  const meio = (q.get("utm_medium") || "").toLowerCase();
  const pago = /cpc|ppc|paid|pago|ads?$/.test(meio);
  if (/facebook|instagram|^ig$|^fb$|meta/.test(fonte)) {
    const o = pago ? "Meta Ads" : /insta|^ig$/.test(fonte) ? "Instagram" : "Facebook";
    return { o, r, cp };
  }
  if (fonte.includes("google")) return { o: pago ? "Google Ads" : "Google (busca)", r, cp };
  if (fonte.includes("whats")) return { o: "WhatsApp", r, cp };
  if (fonte) return { o: "Campanha", r: r ?? fonte.slice(0, 120), cp };

  if (host) {
    if (/(^|\.)google\.[a-z.]+$/.test(host)) return { o: "Google (busca)", r, cp };
    if (/(^|\.)instagram\.com$/.test(host)) return { o: "Instagram", r, cp };
    if (/(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(host)) return { o: "Facebook", r, cp };
    if (/whatsapp|(^|\.)wa\.me$/.test(host)) return { o: "WhatsApp", r, cp };
    if (/(^|\.)(bing|yahoo|duckduckgo|ecosia|yandex)\./.test(host)) return { o: "Outras buscas", r, cp };
    return { o: "Outros sites", r, cp };
  }
  // Links do Instagram/Facebook costumam chegar sem pagina anterior, so com o fbclid.
  if (q.has("fbclid")) return { o: "Instagram/Facebook", cp };
  return { o: "Direto", cp };
}

function sessaoAtual(): Sessao {
  const agora = Date.now();
  let s: Sessao | null = null;
  try {
    s = JSON.parse(ler(CHAVE_SESSAO) || "null") as Sessao | null;
  } catch {}
  if (!s || typeof s.id !== "string" || !ID_VALIDO.test(s.id) || agora - Number(s.ultimo) > SESSAO_MS) {
    s = { id: novoId(), ultimo: agora, ...origemDaEntrada() };
  }
  s.ultimo = agora;
  gravar(CHAVE_SESSAO, JSON.stringify(s));
  return s;
}

function dispositivo() {
  const toque = window.matchMedia?.("(pointer: coarse)").matches;
  const largura = window.innerWidth;
  if (largura < 768) return "Celular";
  if (toque && largura < 1280) return "Tablet";
  return "Computador";
}

function enviar(eventos: EventoMetrica[]) {
  if (!eventos.length) return;
  const corpo = JSON.stringify({ v: visitante(), s: sessaoAtual().id, e: eventos });
  try {
    if (navigator.sendBeacon?.(ENDPOINT_METRICAS, new Blob([corpo], { type: "application/json" }))) return;
  } catch {}
  fetch(ENDPOINT_METRICAS, {
    method: "POST",
    body: corpo,
    keepalive: true,
    headers: { "Content-Type": "application/json" },
  }).catch(() => {});
}

function rolagemAtual() {
  const doc = document.documentElement;
  const altura = Math.max(doc.scrollHeight, 1);
  return Math.min(100, Math.round(((window.scrollY + window.innerHeight) / altura) * 100));
}

/** Soma o tempo desde o ultimo tique, se a aba esta visivel e houve atividade recente. */
function contar() {
  if (!pagina) return;
  const agora = Date.now();
  if (document.visibilityState === "visible" && agora - pagina.acao < OCIOSO_MS) {
    pagina.ativoMs += Math.min(agora - pagina.tick, 15_000);
  }
  pagina.tick = agora;
}

function marcarAcao() {
  contar();
  if (pagina) pagina.acao = Date.now();
}

function enviarTempo() {
  if (!pagina) return;
  contar();
  const seg = Math.min(1800, Math.round(pagina.ativoMs / 1000));
  if (seg <= pagina.enviadoSeg && pagina.rolagem <= pagina.enviadoRol) return;
  pagina.enviadoSeg = seg;
  pagina.enviadoRol = pagina.rolagem;
  enviar([{ t: "tempo", id: pagina.id, seg, rol: pagina.rolagem }]);
}

// ── Cliques ─────────────────────────────────────────────
const SELETOR = "a[href], button, [role='button'], [data-metrica], summary";

function textoDe(el: HTMLElement) {
  const t = (el.getAttribute("aria-label") || el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  if (t) return t.slice(0, 80);
  return el.querySelector("img[alt]")?.getAttribute("alt")?.trim().slice(0, 80) || "";
}

function lojaPorNumero(texto: string) {
  const digitos = texto.replace(/\D/g, "");
  if (digitos.length < 8) return undefined;
  return LOJAS.find((l) => l.whatsapp.endsWith(digitos.slice(-8)));
}

type Clique = { tipo: string; alvo: string };

function classificar(el: HTMLElement): Clique[] {
  const marcado = el.closest("[data-metrica]")?.getAttribute("data-metrica");
  if (marcado) {
    const i = marcado.indexOf(":");
    if (i > 0) return [{ tipo: marcado.slice(0, i), alvo: marcado.slice(i + 1) || textoDe(el) }];
  }

  const rotulo = textoDe(el) || "(sem texto)";
  if (!(el instanceof HTMLAnchorElement)) return [{ tipo: "botao", alvo: rotulo }];

  const href = el.getAttribute("href") || "";
  let url: URL | null = null;
  try {
    url = new URL(el.href);
  } catch {}

  if (el.hasAttribute("data-escolher-loja")) return [{ tipo: "whatsapp", alvo: rotulo }];

  if (url && /(^|\.)wa\.me$|whatsapp\.com$/.test(url.hostname)) {
    const loja = lojaPorNumero(url.pathname + (url.searchParams.get("phone") ?? ""));
    const zap = { tipo: "whatsapp", alvo: rotulo };
    return loja ? [zap, { tipo: "loja", alvo: loja.nome }] : [zap];
  }
  if (href.startsWith("tel:")) {
    return [{ tipo: "telefone", alvo: lojaPorNumero(href)?.nome ?? href.slice(4) }];
  }
  if (url && /google\.[a-z.]+\/maps|maps\.google\.|goo\.gl\/maps|maps\.app\.goo\.gl/.test(url.href)) {
    return [{ tipo: "mapa", alvo: LOJAS.find((l) => l.mapa === el.href)?.nome ?? rotulo }];
  }
  if (url && /(^|\.)(instagram|facebook|tiktok|youtube)\.com$/.test(url.hostname)) {
    return [{ tipo: "rede_social", alvo: url.hostname.replace(/^www\./, "").split(".")[0] }];
  }
  if (url && url.origin === location.origin) {
    if (/^\/produtos\/[^/]+/.test(url.pathname)) return [{ tipo: "produto", alvo: rotulo }];
    if (url.pathname === "/produtos" && url.searchParams.get("cat")) return [{ tipo: "categoria", alvo: rotulo }];
    return [{ tipo: "link", alvo: rotulo }];
  }
  if (url) return [{ tipo: "link_externo", alvo: url.hostname.replace(/^www\./, "") }];
  return [{ tipo: "link", alvo: rotulo }];
}

function secaoDe(el: Element) {
  const marcada = el.closest("[data-secao]")?.getAttribute("data-secao");
  if (marcada) return marcada.slice(0, 80);
  const janela = el.closest("[role='dialog']");
  if (janela) {
    const nome = janela.getAttribute("aria-label") || janela.querySelector("h1, h2, h3")?.textContent;
    return (nome || "Janela").replace(/\s+/g, " ").trim().slice(0, 80);
  }
  if (el.closest("header")) return "Cabeçalho";
  if (el.closest("footer")) return "Rodapé";
  const secao = el.closest("section");
  if (secao) {
    const nome = secao.getAttribute("aria-label") || secao.querySelector("h1, h2")?.textContent;
    if (nome) return nome.replace(/\s+/g, " ").trim().slice(0, 80);
  }
  return "Página";
}

/** Posicao do clique: px a partir do centro da tela, milesimos da altura da pagina e largura. */
function posicao(ev: MouseEvent) {
  const doc = document.documentElement;
  const altura = alturaPagina();
  return {
    x: Math.max(-2000, Math.min(2000, Math.round(ev.pageX - doc.clientWidth / 2))),
    y: Math.max(0, Math.min(1000, Math.round((ev.pageY / altura) * 1000))),
    w: Math.round(window.innerWidth),
  };
}

function descreverArea(alvo: Element | null) {
  if (!alvo) return "Área da página";
  if (alvo.closest("img, picture, svg")) return "Imagem";
  const t = (alvo.textContent || "").replace(/\s+/g, " ").trim();
  return t ? `Texto: ${t.slice(0, 60)}` : "Área da página";
}

function aoClicar(ev: MouseEvent) {
  if (!pagina || ev.button !== 0) return;
  const alvo = ev.target as Element | null;
  const el = alvo?.closest?.(SELETOR) as HTMLElement | null;
  marcarAcao();
  const pg = pagina;
  const pos = posicao(ev);
  const cliques: Clique[] = el ? classificar(el) : [{ tipo: "area", alvo: descreverArea(alvo) }];
  const sec = alvo ? secaoDe(el ?? alvo) : "Página";
  enviar(
    cliques.map((c, i) => ({
      t: "clique" as const,
      pg: pg.id,
      c: pg.caminho,
      tipo: c.tipo,
      alvo: c.alvo.slice(0, 120),
      sec,
      // a posicao vai so no primeiro registro do clique (um clique = um ponto no mapa)
      ...(i === 0 ? pos : {}),
    })),
  );
}

export default function Metricas() {
  const pathname = usePathname();

  useEffect(() => {
    // robos, navegadores automatizados e o mapa de cliques (iframe) nao contam
    if (navigator.webdriver || emIframe()) return;
    const aoRolar = () => {
      marcarAcao();
      if (pagina) pagina.rolagem = Math.max(pagina.rolagem, rolagemAtual());
    };
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "hidden") enviarTempo();
      else if (pagina) pagina.tick = pagina.acao = Date.now();
    };
    const intervalo = window.setInterval(contar, 5000);
    document.addEventListener("click", aoClicar, true);
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("keydown", marcarAcao);
    window.addEventListener("pointermove", marcarAcao, { passive: true });
    window.addEventListener("touchstart", marcarAcao, { passive: true });
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    window.addEventListener("pagehide", enviarTempo);
    return () => {
      window.clearInterval(intervalo);
      document.removeEventListener("click", aoClicar, true);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("keydown", marcarAcao);
      window.removeEventListener("pointermove", marcarAcao);
      window.removeEventListener("touchstart", marcarAcao);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      window.removeEventListener("pagehide", enviarTempo);
    };
  }, []);

  useEffect(() => {
    if (navigator.webdriver || emIframe()) return;
    const caminho = pathname || "/";
    // Em desenvolvimento o React roda o efeito duas vezes; nao contar a mesma pagina de novo.
    if (pagina && pagina.caminho === caminho && Date.now() - pagina.inicio < 1500) return;
    enviarTempo();
    const s = sessaoAtual();
    const agora = Date.now();
    pagina = {
      id: novoId(),
      caminho,
      inicio: agora,
      ativoMs: 0,
      tick: agora,
      acao: agora,
      rolagem: 0,
      enviadoSeg: 0,
      enviadoRol: 0,
    };
    const atual = pagina;
    requestAnimationFrame(() => {
      atual.rolagem = Math.max(atual.rolagem, rolagemAtual());
    });
    enviar([{ t: "pv", id: atual.id, c: caminho, o: s.o, r: s.r, cp: s.cp, d: dispositivo() }]);
  }, [pathname]);

  return null;
}
