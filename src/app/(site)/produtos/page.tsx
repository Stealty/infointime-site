import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { buscarProdutos, categoriaBonita, getCategorias, getConteudo, linkWhatsApp } from "@/lib/site";
import { IconeWhatsApp } from "@/components/Icones";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Produtos de informática, tintas, toners, cabos e acessórios em estoque na Info In Time.",
};

const POR_PAGINA = 24;
const ORDENS = [
  { valor: "relevancia", label: "Com foto primeiro" },
  { valor: "menor_preco", label: "Menor preço" },
  { valor: "maior_preco", label: "Maior preço" },
];

type SP = Promise<{ q?: string; cat?: string; ordem?: string; pagina?: string }>;

function montarHref(base: { q?: string; cat?: string; ordem?: string }, extra: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  const tudo = { ...base, ...extra };
  for (const [k, v] of Object.entries(tudo)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `/produtos?${s}` : "/produtos";
}

export default async function Produtos({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = (sp.q || "").slice(0, 80);
  const cat = sp.cat || "";
  const ordem = ORDENS.some((o) => o.valor === sp.ordem) ? sp.ordem! : "relevancia";
  const pagina = Math.max(1, Number(sp.pagina) || 1);

  const [{ itens, total }, categorias, conteudo] = await Promise.all([
    buscarProdutos({ busca: q, categoria: cat, ordem, pagina, porPagina: POR_PAGINA }),
    getCategorias(),
    getConteudo(),
  ]);
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const base = { q: q || undefined, cat: cat || undefined, ordem: ordem !== "relevancia" ? ordem : undefined };

  const titulo = q ? `Resultados para “${q}”` : cat ? categoriaBonita(cat) : "Todos os produtos";

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="faixa-curta" />
          <h1 className="mt-2 text-3xl font-extrabold text-marinho sm:text-4xl">{titulo}</h1>
          <p className="mt-1 text-suave">
            {total === 1 ? "1 produto em estoque" : `${total} produtos em estoque`}
            {(q || cat) && (
              <>
                {" · "}
                <Link href="/produtos" className="text-azul hover:underline">
                  limpar filtros
                </Link>
              </>
            )}
          </p>
        </div>
        <nav aria-label="Ordenar" className="flex flex-wrap gap-1.5">
          {ORDENS.map((o) => (
            <Link
              key={o.valor}
              href={montarHref(base, { ordem: o.valor === "relevancia" ? undefined : o.valor, pagina: undefined })}
              aria-current={o.valor === ordem ? "true" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                o.valor === ordem ? "bg-azul text-white shadow-suave" : "bg-white text-suave ring-1 ring-linha hover:text-azul"
              }`}
            >
              {o.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="hidden self-start rounded-cartao bg-white p-4 shadow-suave ring-1 ring-linha/70 lg:sticky lg:top-40 lg:block">
          <p className="font-bold text-marinho">Categorias</p>
          <ul className="mt-2 space-y-0.5 text-[15px]">
            <li>
              <Link
                href={montarHref({ q: base.q, ordem: base.ordem }, {})}
                className={`flex justify-between rounded-md px-2 py-1.5 ${!cat ? "bg-azul/8 font-semibold text-azul" : "text-suave hover:bg-fundo hover:text-texto"}`}
              >
                Todas
              </Link>
            </li>
            {categorias.map((c) => (
              <li key={c.categoria}>
                <Link
                  href={montarHref({ q: base.q, ordem: base.ordem }, { cat: c.categoria })}
                  className={`flex justify-between gap-2 rounded-md px-2 py-1.5 ${
                    cat === c.categoria ? "bg-azul/8 font-semibold text-azul" : "text-suave hover:bg-fundo hover:text-texto"
                  }`}
                >
                  <span>{categoriaBonita(c.categoria)}</span>
                  <span className="text-xs leading-6 opacity-70">{c.n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div>
          {itens.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
              {itens.map((p) => (
                <ProductCard key={p.codigo} produto={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-cartao bg-white shadow-suave ring-1 ring-linha/70 p-8 text-center">
              <p className="text-xl font-bold text-marinho">Nenhum produto encontrado no estoque online</p>
              <p className="mx-auto mt-2 max-w-md text-suave">
                Nem tudo que temos na loja aparece aqui. Mande uma mensagem que a equipe confere para você.
              </p>
              <a
                href={linkWhatsApp(conteudo.whatsapp, q ? `Olá! Vocês têm ${q}?` : "Olá! Vim pelo site da Info In Time.")}
                target="_blank"
                rel="noopener"
                className="button button--lg button--zap mt-5"
              >
                <IconeWhatsApp /> Perguntar no WhatsApp
              </a>
            </div>
          )}

          {paginas > 1 && (
            <nav aria-label="Páginas" className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {pagina > 1 && (
                <Link href={montarHref(base, { pagina: String(pagina - 1) })} className="button button--tertiary">
                  Anterior
                </Link>
              )}
              <span className="px-2 text-suave">
                Página {pagina} de {paginas}
              </span>
              {pagina < paginas && (
                <Link href={montarHref(base, { pagina: String(pagina + 1) })} className="button button--tertiary">
                  Próxima
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
