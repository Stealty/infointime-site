import { dbConfigurado, select } from "@/lib/db";
import { DISPOSITIVOS, ORIGENS, TIPOS_CLIQUE, type EventoMetrica } from "@/lib/metricas";

// Recebe os eventos de metricas do navegador (components/Metricas.tsx) e repassa ao banco
// do portal da TaskMind (projeto taskmind-portal, funcao public.svc_iit_coletar).
// - Chave da coleta: env METRICAS_TOKEN ou, sem ela, a linha metricas_token da tabela
//   it_site_conteudo (banco do site, lida com a service key; nunca vai ao navegador).
//   Sem chave, nao faz nada (responde 204).
// - O IP nao e enviado nem guardado. Robos conhecidos sao ignorados.
// - Sempre responde 204: o visitante nunca ve erro de metrica.

export const dynamic = "force-dynamic";

// URL e chave publica (publishable) do projeto do portal; nao sao segredo.
const URL_PORTAL = (process.env.METRICAS_SUPABASE_URL || "https://yoqpzgxcjjyvmmeqmjlp.supabase.co").replace(/\/+$/, "");
const CHAVE_PUBLICA = process.env.METRICAS_SUPABASE_KEY || "sb_publishable_yloLaMi7LN318WNJQ-DiEw_GkTJ_Sgf";

const ROBO =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\//i;
const ID = /^[A-Za-z0-9-]{8,40}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const vazio = () => new Response(null, { status: 204 });

function texto(x: unknown, max: number) {
  return typeof x === "string" ? x.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max) : "";
}

function caminho(x: unknown) {
  const c = texto(x, 200);
  return c.startsWith("/") && !c.startsWith("//") ? c : "";
}

function numero(x: unknown, max: number) {
  const n = Math.round(Number(x));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
}

const dentro = (lista: readonly string[], x: unknown) => typeof x === "string" && lista.includes(x);

function limpar(x: unknown): EventoMetrica | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const id = texto(o.id, 36);

  if (o.t === "pv") {
    const c = caminho(o.c);
    if (!UUID.test(id) || !c) return null;
    return {
      t: "pv",
      id,
      c,
      o: dentro(ORIGENS, o.o) ? (o.o as string) : "Direto",
      r: texto(o.r, 120) || undefined,
      cp: texto(o.cp, 120) || undefined,
      d: dentro(DISPOSITIVOS, o.d) ? (o.d as string) : "Computador",
    };
  }
  if (o.t === "tempo") {
    if (!UUID.test(id)) return null;
    return { t: "tempo", id, seg: numero(o.seg, 1800), rol: numero(o.rol, 100) };
  }
  if (o.t === "clique") {
    const c = caminho(o.c);
    const alvo = texto(o.alvo, 120);
    if (!c || !alvo || !dentro(TIPOS_CLIQUE, o.tipo)) return null;
    const pg = texto(o.pg, 36);
    return {
      t: "clique",
      pg: UUID.test(pg) ? pg : undefined,
      c,
      tipo: o.tipo as string,
      alvo,
      sec: texto(o.sec, 80) || undefined,
      ...(o.x !== undefined && o.y !== undefined && o.w !== undefined
        ? { x: Math.round(Math.max(-2000, Math.min(2000, Number(o.x) || 0))), y: numero(o.y, 1000), w: numero(o.w, 4000) }
        : {}),
    };
  }
  return null;
}

async function chaveDaColeta(): Promise<string> {
  if (process.env.METRICAS_TOKEN) return process.env.METRICAS_TOKEN;
  if (!dbConfigurado()) return "";
  try {
    const [linha] = await select<{ valor: string | null }[]>(
      "it_site_conteudo?select=valor&chave=eq.metricas_token",
      { revalidate: 600, tags: ["metricas"] },
    );
    return linha?.valor?.trim() ?? "";
  } catch {
    return "";
  }
}

export async function POST(req: Request) {
  const token = await chaveDaColeta();
  if (!token) return vazio();

  const ua = req.headers.get("user-agent") || "";
  if (!ua || ROBO.test(ua)) return vazio();
  const origemPedido = req.headers.get("sec-fetch-site");
  if (origemPedido && origemPedido !== "same-origin") return vazio();

  const corpo = await req.text();
  if (!corpo || corpo.length > 20_000) return vazio();

  let lote: unknown;
  try {
    lote = JSON.parse(corpo);
  } catch {
    return vazio();
  }
  const { v, s, e } = (lote ?? {}) as { v?: unknown; s?: unknown; e?: unknown };
  if (typeof v !== "string" || !ID.test(v) || typeof s !== "string" || !ID.test(s) || !Array.isArray(e)) {
    return vazio();
  }
  const eventos = e.slice(0, 30).map(limpar).filter((x): x is EventoMetrica => x !== null);
  if (!eventos.length) return vazio();

  try {
    const res = await fetch(`${URL_PORTAL}/rest/v1/rpc/svc_iit_coletar`, {
      method: "POST",
      headers: { apikey: CHAVE_PUBLICA, "Content-Type": "application/json" },
      body: JSON.stringify({ p_token: token, p_visitante: v, p_sessao: s, p_eventos: eventos }),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) console.error("[metricas] coleta falhou", res.status, (await res.text()).slice(0, 200));
  } catch (err) {
    console.error("[metricas] coleta falhou", err);
  }
  return vazio();
}
