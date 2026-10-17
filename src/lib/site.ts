import "server-only";
import { rpc, select, TAG_CATALOGO, TAG_SITE } from "./db";

export type Produto = {
  codigo: string;
  nome: string;
  marca: string | null;
  preco: number;
  categoria: string;
  foto_url: string | null;
  total: number;
};

export type Banner = {
  id: number;
  titulo: string | null;
  imagem_desktop: string;
  imagem_mobile: string | null;
  link: string | null;
  ordem: number;
  ativo: boolean;
  inicio: string | null;
  fim: string | null;
};

export type Destaque = { codigo: string; ordem: number; rotulo: string | null; ativo: boolean };

export type Conteudo = {
  logo_url: string;
  foto_familia_url: string;
  historia_titulo: string;
  historia_texto: string;
  whatsapp: string;
  produtos_ocultos: string;
};

const CONTEUDO_PADRAO: Conteudo = {
  logo_url: "",
  foto_familia_url: "",
  historia_titulo: "Há 30 anos cuidando da informática do Sul Fluminense",
  historia_texto: "",
  whatsapp: "5524988138858",
  produtos_ocultos: "",
};

// Catalogo: cache de 5 min. A carga do Shop 9 e diaria, entao 5 min nao muda nada
// para o cliente e poupa o banco.
const CACHE_CATALOGO = { revalidate: 300, tags: [TAG_CATALOGO] };
const CACHE_SITE = { revalidate: 300, tags: [TAG_SITE] };

export async function getConteudo(): Promise<Conteudo> {
  try {
    const rows = await select<{ chave: string; valor: string | null }[]>(
      "it_site_conteudo?select=chave,valor",
      CACHE_SITE,
    );
    const c = { ...CONTEUDO_PADRAO };
    for (const r of rows) {
      if (r.chave in c && r.valor != null) (c as Record<string, string>)[r.chave] = r.valor;
    }
    return c;
  } catch {
    return CONTEUDO_PADRAO;
  }
}

export async function getBannersAtivos(): Promise<Banner[]> {
  try {
    const rows = await select<Banner[]>("it_site_banners?select=*&ativo=eq.true&order=ordem.asc,id.asc", CACHE_SITE);
    const agora = Date.now();
    return rows.filter(
      (b) => (!b.inicio || Date.parse(b.inicio) <= agora) && (!b.fim || Date.parse(b.fim) > agora),
    );
  } catch {
    return [];
  }
}

export async function buscarProdutos(opts: {
  busca?: string;
  categoria?: string;
  pagina?: number;
  porPagina?: number;
  ordem?: string;
}): Promise<{ itens: Produto[]; total: number }> {
  const porPagina = opts.porPagina ?? 24;
  const pagina = Math.max(1, opts.pagina ?? 1);
  const termo = opts.busca?.trim();
  if (termo) {
    // Com busca: primeiro o que a busca da Bianca acha (relevancia, sinonimos,
    // "sem fio"), depois o que so a busca por palavra acha. Pagina em memoria.
    const [viaBianca, simples] = await Promise.all([
      buscarComoBianca(termo, opts.categoria),
      rpc<Produto[]>(
        "it_site_catalogo",
        { p_busca: termo, p_categoria: opts.categoria || null, p_limite: 300, p_offset: 0, p_codigos: null, p_ordem: "relevancia" },
        CACHE_CATALOGO,
      ).catch(() => [] as Produto[]),
    ]);
    const vistos = new Set<string>();
    let todos = [...(viaBianca ?? []), ...simples].filter((p) => !vistos.has(p.codigo) && vistos.add(p.codigo));
    if (opts.ordem === "menor_preco") todos = todos.sort((a, b) => a.preco - b.preco);
    if (opts.ordem === "maior_preco") todos = todos.sort((a, b) => b.preco - a.preco);
    const ini = (pagina - 1) * porPagina;
    return { itens: todos.slice(ini, ini + porPagina), total: todos.length };
  }
  try {
    const itens = await rpc<Produto[]>(
      "it_site_catalogo",
      {
        p_busca: opts.busca?.trim() || null,
        p_categoria: opts.categoria || null,
        p_limite: porPagina,
        p_offset: (pagina - 1) * porPagina,
        p_codigos: null,
        p_ordem: opts.ordem || "relevancia",
      },
      CACHE_CATALOGO,
    );
    return { itens, total: itens[0]?.total ?? 0 };
  } catch (e) {
    console.error(e);
    return { itens: [], total: 0 };
  }
}

// Busca do site = mesma funcao da Bianca (it_buscar_produto): sinonimos, "sem fio",
// erro de digitacao e relevancia. Ela devolve os codigos na ordem certa; os dados
// de vitrine (categoria, foto, produtos ocultos) vem da it_site_catalogo.
// Devolve null se a busca da Bianca falhar ou nao achar nada, e o site cai na
// busca simples por palavra.
async function buscarComoBianca(termo: string, categoria?: string): Promise<Produto[] | null> {
  try {
    const [pol] = await rpc<{ filiais: number[] | null; tabela: number; minimo: number; teto: number }[]>(
      "it_site_politica",
      {},
      CACHE_CATALOGO,
    );
    if (!pol) return null;
    const achados = await rpc<{ sku: string }[]>(
      "it_buscar_produto",
      {
        p_termo: termo.slice(0, 80),
        p_limite: 300,
        p_filiais: pol.filiais,
        p_tabela_preco: pol.tabela,
        p_estoque_minimo: pol.minimo,
        p_estoque_teto: pol.teto,
      },
      CACHE_CATALOGO,
    );
    const codigos = Array.from(new Set(achados.map((a) => String(a.sku))));
    if (!codigos.length) return null;
    const itens = await rpc<Produto[]>(
      "it_site_catalogo",
      { p_busca: null, p_categoria: categoria || null, p_limite: codigos.length, p_offset: 0, p_codigos: codigos, p_ordem: "relevancia" },
      CACHE_CATALOGO,
    );
    return itens.length ? itens : null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function produtosPorCodigo(codigos: string[]): Promise<Produto[]> {
  if (!codigos.length) return [];
  try {
    return await rpc<Produto[]>(
      "it_site_catalogo",
      { p_busca: null, p_categoria: null, p_limite: codigos.length, p_offset: 0, p_codigos: codigos, p_ordem: "relevancia" },
      CACHE_CATALOGO,
    );
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getProduto(codigo: string): Promise<Produto | null> {
  const r = await produtosPorCodigo([codigo]);
  return r[0] ?? null;
}

export async function getCategorias(): Promise<{ categoria: string; n: number }[]> {
  try {
    return await rpc<{ categoria: string; n: number }[]>("it_site_categorias", {}, CACHE_CATALOGO);
  } catch {
    return [];
  }
}

// Destaques escolhidos no /admin. Produto que saiu do estoque some sozinho, porque
// a lista passa pela mesma regra de estoque da Bianca. Se ninguem escolheu nada
// ainda, mostra produtos com foto para a vitrine nunca ficar vazia.
export async function getDestaques(limite = 12): Promise<{ produto: Produto; rotulo: string | null }[]> {
  let escolhidos: Destaque[] = [];
  try {
    escolhidos = await select<Destaque[]>("it_site_destaques?select=*&ativo=eq.true&order=ordem.asc", CACHE_SITE);
  } catch {
    escolhidos = [];
  }
  if (escolhidos.length) {
    const prods = await produtosPorCodigo(escolhidos.map((d) => d.codigo));
    const mapa = new Map(prods.map((p) => [p.codigo, p]));
    return escolhidos
      .filter((d) => mapa.has(d.codigo))
      .slice(0, limite)
      .map((d) => ({ produto: mapa.get(d.codigo)!, rotulo: d.rotulo }));
  }
  const { itens } = await buscarProdutos({ porPagina: limite });
  return itens.filter((p) => p.foto_url).map((produto) => ({ produto, rotulo: null }));
}

// ---- formatacao ----

export function formatarPreco(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const SIGLAS = new Set(["HD", "SSD", "USB", "HDMI", "VGA", "RGB", "LED", "PC", "TV", "HP", "LG", "DDR3", "DDR4", "DDR5", "SATA", "NVME", "WIFI", "AC", "AX", "PDV", "UPS", "DVI", "LAN", "CAT6", "CAT5E", "GB", "TB", "MB", "W", "V", "A4", "A3", "II"]);

// O Shop 9 guarda tudo em caixa alta. No site o nome fica legivel, mas codigos
// e siglas (L3250, T544, USB, 1TB) continuam em maiusculas.
export function nomeBonito(nome: string) {
  const minusculas = new Set(["de", "da", "do", "das", "dos", "e", "para", "com", "sem", "em", "p/", "c/", "s/"]);
  return nome
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w, i) => {
      const up = w.toUpperCase();
      if (/\d/.test(w) || SIGLAS.has(up.replace(/[^A-Z0-9]/g, ""))) return up;
      const low = w.toLowerCase();
      if (i > 0 && minusculas.has(low)) return low;
      return low.charAt(0).toUpperCase() + low.slice(1);
    })
    .join(" ");
}

export function categoriaBonita(c: string) {
  if (c === "OUTROS") return "Outros";
  return nomeBonito(c.replace(/\s*\/\s*/g, " / "));
}

export function slugCategoria(c: string) {
  return encodeURIComponent(c);
}

export function linkWhatsApp(numero: string, texto: string) {
  const n = numero.replace(/\D/g, "");
  return `https://wa.me/${n}?text=${encodeURIComponent(texto)}`;
}
