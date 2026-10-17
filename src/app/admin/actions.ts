"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { updateTag } from "next/cache";
import { credenciaisValidas, criarSessao, encerrarSessao, exigirSessao } from "@/lib/auth";
import { apagarImagem, mutate, select, TAG_CATALOGO, TAG_SITE, uploadImagem } from "@/lib/db";

// ---------- helpers ----------

function texto(fd: FormData, k: string, max = 500) {
  return String(fd.get(k) ?? "").trim().slice(0, max);
}

function arquivo(fd: FormData, k: string): File | null {
  const f = fd.get(k);
  return f instanceof File && f.size > 0 ? f : null;
}

// Datas do formulario sao dias no horario de Brasilia.
function inicioDoDia(d: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00-03:00` : null;
}
function fimDoDia(d: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T23:59:59-03:00` : null;
}

function linkSeguro(l: string) {
  if (!l) return null;
  if (l.startsWith("/") && !l.startsWith("//")) return l;
  if (/^https?:\/\//i.test(l)) return l;
  return null;
}

function voltar(aba: string, msg: string, erro = false): never {
  const p = new URLSearchParams({ aba, [erro ? "erro" : "ok"]: msg });
  redirect(`/admin?${p.toString()}`);
}

// ---------- sessao ----------

export async function entrar(_: unknown, fd: FormData) {
  const usuario = texto(fd, "usuario", 100);
  const senha = String(fd.get("senha") ?? "");
  if (!credenciaisValidas(usuario, senha)) {
    await new Promise((r) => setTimeout(r, 800));
    return { erro: "Usuário ou senha incorretos.", usuario };
  }
  await criarSessao();
  redirect("/admin");
}

export async function sair() {
  await encerrarSessao();
  redirect("/admin/login");
}

// ---------- banners ----------

export async function criarBanner(fd: FormData) {
  await exigirSessao();
  const desktop = arquivo(fd, "imagem_desktop");
  if (!desktop) voltar("banners", "Escolha a imagem do banner para computador.", true);
  let urlDesktop = "";
  let urlMobile: string | null = null;
  try {
    urlDesktop = await uploadImagem(desktop!, "banners");
    const mobile = arquivo(fd, "imagem_mobile");
    if (mobile) urlMobile = await uploadImagem(mobile, "banners");
    const atuais = await select<{ ordem: number }[]>("it_site_banners?select=ordem&order=ordem.desc&limit=1", "no-store");
    await mutate("POST", "it_site_banners", {
      titulo: texto(fd, "titulo", 120) || null,
      link: linkSeguro(texto(fd, "link", 400)),
      imagem_desktop: urlDesktop,
      imagem_mobile: urlMobile,
      inicio: inicioDoDia(texto(fd, "inicio", 10)),
      fim: fimDoDia(texto(fd, "fim", 10)),
      ordem: (atuais[0]?.ordem ?? 0) + 1,
      ativo: true,
    });
  } catch (e) {
    unstable_rethrow(e);
    console.error(e);
    voltar("banners", "Não foi possível salvar o banner. Tente uma imagem menor.", true);
  }
  updateTag(TAG_SITE);
  voltar("banners", "Banner publicado.");
}

export async function editarBanner(fd: FormData) {
  await exigirSessao();
  const id = Number(fd.get("id"));
  if (!id) voltar("banners", "Banner não encontrado.", true);
  try {
    const [atual] = await select<{ imagem_desktop: string; imagem_mobile: string | null }[]>(
      `it_site_banners?select=imagem_desktop,imagem_mobile&id=eq.${id}`,
      "no-store",
    );
    if (!atual) voltar("banners", "Banner não encontrado.", true);
    const patch: Record<string, unknown> = {
      titulo: texto(fd, "titulo", 120) || null,
      link: linkSeguro(texto(fd, "link", 400)),
      inicio: inicioDoDia(texto(fd, "inicio", 10)),
      fim: fimDoDia(texto(fd, "fim", 10)),
      atualizado_em: new Date().toISOString(),
    };
    const desktop = arquivo(fd, "imagem_desktop");
    if (desktop) {
      patch.imagem_desktop = await uploadImagem(desktop, "banners");
      await apagarImagem(atual.imagem_desktop);
    }
    const mobile = arquivo(fd, "imagem_mobile");
    if (mobile) {
      patch.imagem_mobile = await uploadImagem(mobile, "banners");
      await apagarImagem(atual.imagem_mobile);
    } else if (fd.get("remover_mobile") === "1") {
      patch.imagem_mobile = null;
      await apagarImagem(atual.imagem_mobile);
    }
    await mutate("PATCH", `it_site_banners?id=eq.${id}`, patch);
  } catch (e) {
    unstable_rethrow(e);
    console.error(e);
    voltar("banners", "Não foi possível salvar as alterações.", true);
  }
  updateTag(TAG_SITE);
  voltar("banners", "Banner atualizado.");
}

export async function alternarBanner(fd: FormData) {
  await exigirSessao();
  const id = Number(fd.get("id"));
  const ativo = fd.get("ativo") === "1";
  await mutate("PATCH", `it_site_banners?id=eq.${id}`, { ativo, atualizado_em: new Date().toISOString() });
  updateTag(TAG_SITE);
  voltar("banners", ativo ? "Banner voltou ao ar." : "Banner pausado.");
}

export async function excluirBanner(fd: FormData) {
  await exigirSessao();
  const id = Number(fd.get("id"));
  const [b] = await select<{ imagem_desktop: string; imagem_mobile: string | null }[]>(
    `it_site_banners?select=imagem_desktop,imagem_mobile&id=eq.${id}`,
    "no-store",
  );
  await mutate("DELETE", `it_site_banners?id=eq.${id}`);
  if (b) {
    await apagarImagem(b.imagem_desktop);
    await apagarImagem(b.imagem_mobile);
  }
  updateTag(TAG_SITE);
  voltar("banners", "Banner excluído.");
}

async function trocarOrdem(tabela: string, chave: string, valor: string, direcao: "cima" | "baixo") {
  const lista = await select<Record<string, unknown>[]>(`${tabela}?select=${chave},ordem&order=ordem.asc,${chave}.asc`, "no-store");
  const i = lista.findIndex((x) => String(x[chave]) === valor);
  const j = direcao === "cima" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= lista.length) return;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  // renumera tudo: corrige empates antigos de ordem
  await Promise.all(
    lista.map((x, n) =>
      mutate("PATCH", `${tabela}?${chave}=eq.${encodeURIComponent(String(x[chave]))}`, { ordem: n + 1 }),
    ),
  );
}

export async function moverBanner(fd: FormData) {
  await exigirSessao();
  await trocarOrdem("it_site_banners", "id", String(fd.get("id")), fd.get("direcao") === "cima" ? "cima" : "baixo");
  updateTag(TAG_SITE);
  voltar("banners", "Ordem atualizada.");
}

// ---------- destaques ----------

export async function adicionarDestaque(fd: FormData) {
  await exigirSessao();
  const codigo = texto(fd, "codigo", 40);
  const q = texto(fd, "q", 80);
  if (!codigo) voltar("destaques", "Produto inválido.", true);
  const atuais = await select<{ ordem: number }[]>("it_site_destaques?select=ordem&order=ordem.desc&limit=1", "no-store");
  await mutate(
    "POST",
    "it_site_destaques?on_conflict=codigo",
    { codigo, ordem: (atuais[0]?.ordem ?? 0) + 1, ativo: true },
    "resolution=merge-duplicates,return=minimal",
  );
  updateTag(TAG_SITE);
  const p = new URLSearchParams({ aba: "destaques", ok: "Produto adicionado aos destaques." });
  if (q) p.set("q", q);
  redirect(`/admin?${p.toString()}`);
}

export async function removerDestaque(fd: FormData) {
  await exigirSessao();
  await mutate("DELETE", `it_site_destaques?codigo=eq.${encodeURIComponent(texto(fd, "codigo", 40))}`);
  updateTag(TAG_SITE);
  voltar("destaques", "Produto removido dos destaques.");
}

export async function moverDestaque(fd: FormData) {
  await exigirSessao();
  await trocarOrdem("it_site_destaques", "codigo", texto(fd, "codigo", 40), fd.get("direcao") === "cima" ? "cima" : "baixo");
  updateTag(TAG_SITE);
  voltar("destaques", "Ordem atualizada.");
}

export async function salvarRotulo(fd: FormData) {
  await exigirSessao();
  await mutate("PATCH", `it_site_destaques?codigo=eq.${encodeURIComponent(texto(fd, "codigo", 40))}`, {
    rotulo: texto(fd, "rotulo", 24) || null,
  });
  updateTag(TAG_SITE);
  voltar("destaques", "Selo salvo.");
}

// ---------- conteudo da loja ----------

async function gravarConteudo(chave: string, valor: string) {
  await mutate(
    "POST",
    "it_site_conteudo?on_conflict=chave",
    { chave, valor, atualizado_em: new Date().toISOString() },
    "resolution=merge-duplicates,return=minimal",
  );
}

export async function salvarHistoria(fd: FormData) {
  await exigirSessao();
  try {
    await gravarConteudo("historia_titulo", texto(fd, "historia_titulo", 140));
    await gravarConteudo("historia_texto", texto(fd, "historia_texto", 6000));
    const foto = arquivo(fd, "foto_familia");
    if (foto) {
      const [atual] = await select<{ valor: string }[]>("it_site_conteudo?select=valor&chave=eq.foto_familia_url", "no-store");
      await gravarConteudo("foto_familia_url", await uploadImagem(foto, "loja"));
      await apagarImagem(atual?.valor);
    }
  } catch (e) {
    unstable_rethrow(e);
    console.error(e);
    voltar("loja", "Não foi possível salvar. Tente uma foto menor.", true);
  }
  updateTag(TAG_SITE);
  voltar("loja", "Página Nossa história atualizada.");
}

export async function salvarGeral(fd: FormData) {
  await exigirSessao();
  try {
    const zap = texto(fd, "whatsapp", 20).replace(/\D/g, "");
    if (zap.length < 12) voltar("loja", "WhatsApp precisa ter DDI e DDD, ex.: 5524988138858.", true);
    await gravarConteudo("whatsapp", zap);
    const logo = arquivo(fd, "logo");
    if (logo) {
      const [atual] = await select<{ valor: string }[]>("it_site_conteudo?select=valor&chave=eq.logo_url", "no-store");
      await gravarConteudo("logo_url", await uploadImagem(logo, "loja"));
      await apagarImagem(atual?.valor);
    }
  } catch (e) {
    unstable_rethrow(e);
    console.error(e);
    voltar("loja", "Não foi possível salvar.", true);
  }
  updateTag(TAG_SITE);
  voltar("loja", "Dados gerais atualizados.");
}

export async function salvarOcultos(fd: FormData) {
  await exigirSessao();
  const codigos = texto(fd, "produtos_ocultos", 4000)
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  await gravarConteudo("produtos_ocultos", Array.from(new Set(codigos)).join(", "));
  updateTag(TAG_SITE);
  updateTag(TAG_CATALOGO);
  voltar("ocultos", codigos.length ? `${codigos.length} produto(s) ocultos do site.` : "Nenhum produto oculto.");
}
