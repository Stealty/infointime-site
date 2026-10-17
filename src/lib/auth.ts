import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Login unico do /admin (decisao do Biel: ele e a loja usam o mesmo).
// Usuario e senha ficam nas variaveis de ambiente da Vercel; o cookie e assinado
// com ADMIN_SECRET e vale 12 horas.

const COOKIE = "iit_admin";
const DURACAO_MS = 12 * 60 * 60 * 1000;

function segredo() {
  const s = process.env.ADMIN_SECRET || "";
  if (s.length < 20) throw new Error("ADMIN_SECRET precisa ter pelo menos 20 caracteres");
  return s;
}

function assinar(valor: string) {
  return createHmac("sha256", segredo()).update(valor).digest("base64url");
}

function iguais(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function credenciaisValidas(usuario: string, senha: string) {
  const u = process.env.ADMIN_USER || "";
  const p = process.env.ADMIN_PASSWORD || "";
  if (!u || !p) return false;
  // compara sempre os dois, para o tempo de resposta nao revelar qual errou
  const okU = iguais(assinar(usuario.trim().toLowerCase()), assinar(u.trim().toLowerCase()));
  const okP = iguais(assinar(senha), assinar(p));
  return okU && okP;
}

export async function criarSessao() {
  const exp = String(Date.now() + DURACAO_MS);
  const jar = await cookies();
  jar.set(COOKIE, `${exp}.${assinar(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && !(process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("http://"),
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_MS / 1000,
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(COOKIE);
}

export async function sessaoValida() {
  const v = (await cookies()).get(COOKIE)?.value || "";
  const [exp, sig] = v.split(".");
  if (!exp || !sig) return false;
  try {
    if (!iguais(sig, assinar(exp))) return false;
  } catch {
    return false;
  }
  return Number(exp) > Date.now();
}

export async function exigirSessao() {
  if (!(await sessaoValida())) redirect("/admin/login");
}
