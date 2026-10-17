import "server-only";

// Acesso ao Supabase do Info In Time pelo PostgREST, sempre no servidor.
// A service key nunca chega ao navegador: este arquivo so roda em Server Components,
// Server Actions e Route Handlers.

const URL_BASE = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const KEY = process.env.SUPABASE_SERVICE_KEY || "";

export const TAG_SITE = "site";
export const TAG_CATALOGO = "catalogo";

export function dbConfigurado() {
  return Boolean(URL_BASE && KEY);
}

function headers(extra?: Record<string, string>) {
  return {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

type Cache = { revalidate?: number | false; tags?: string[] } | "no-store";

function cacheInit(cache: Cache): RequestInit {
  if (cache === "no-store") return { cache: "no-store" };
  return { next: { revalidate: cache.revalidate ?? 300, tags: cache.tags } } as RequestInit;
}

export async function rpc<T>(fn: string, args: Record<string, unknown>, cache: Cache): Promise<T> {
  if (!dbConfigurado()) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY nao configurados");
  const res = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(args),
    ...cacheInit(cache),
  });
  if (!res.ok) throw new Error(`rpc ${fn} falhou (${res.status}): ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<T>;
}

export async function select<T>(path: string, cache: Cache): Promise<T> {
  if (!dbConfigurado()) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY nao configurados");
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: headers(), ...cacheInit(cache) });
  if (!res.ok) throw new Error(`select ${path} falhou (${res.status}): ${(await res.text()).slice(0, 300)}`);
  return res.json() as Promise<T>;
}

export async function mutate(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  prefer = "return=minimal",
) {
  if (!dbConfigurado()) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY nao configurados");
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    method,
    headers: headers({ Prefer: prefer }),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${method} ${path} falhou (${res.status}): ${(await res.text()).slice(0, 300)}`);
}

const BUCKET = "it_site";

export async function uploadImagem(file: File, pasta: string): Promise<string> {
  if (!dbConfigurado()) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY nao configurados");
  if (!file.type.startsWith("image/")) throw new Error("O arquivo precisa ser uma imagem.");
  const ext = (file.type.split("/")[1] || "jpg").replace("jpeg", "jpg").replace(/[^a-z0-9]/g, "");
  const nome = `${pasta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${nome}`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": file.type,
      "Cache-Control": "31536000",
      "x-upsert": "true",
    },
    body: Buffer.from(await file.arrayBuffer()),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upload falhou (${res.status}): ${(await res.text()).slice(0, 200)}`);
  return `${URL_BASE}/storage/v1/object/public/${BUCKET}/${nome}`;
}

export async function apagarImagem(url: string | null | undefined) {
  if (!url) return;
  const prefixo = `${URL_BASE}/storage/v1/object/public/${BUCKET}/`;
  if (!url.startsWith(prefixo)) return; // so apaga o que o proprio site subiu
  const nome = url.slice(prefixo.length);
  await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}`, {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({ prefixes: [nome] }),
    cache: "no-store",
  }).catch(() => undefined);
}
