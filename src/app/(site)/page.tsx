import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import SecaoTitulo from "@/components/SecaoTitulo";
import { IconeImpressora, IconeLocal, IconeNotebook, IconeComputador, IconeWhatsApp } from "@/components/Icones";
import {
  buscarProdutos,
  categoriaBonita,
  getBannersAtivos,
  getCategorias,
  getConteudo,
  getDestaques,
  linkWhatsApp,
  slugCategoria,
} from "@/lib/site";
import { HORARIO, LOJAS } from "@/lib/lojas";

export const revalidate = 300;

export default async function Home() {
  const [banners, destaques, categorias, tintas, conteudo] = await Promise.all([
    getBannersAtivos(),
    getDestaques(12),
    getCategorias(),
    buscarProdutos({ categoria: "TINTAS", porPagina: 6 }),
    getConteudo(),
  ]);
  const atalhos = categorias.filter((c) => c.categoria !== "OUTROS").slice(0, 10);

  return (
    <>
      {banners.length ? (
        <HeroCarousel banners={banners} />
      ) : (
        <section className="bg-marinho text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <span className="faixa-curta" />
              <h1 className="mt-5 text-4xl font-extrabold sm:text-6xl">
                A maior loja de informática do Sul Fluminense
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/80">
                Há 30 anos em Volta Redonda, Barra Mansa e Arrozal. Produtos, tintas e toners, e manutenção de notebooks, computadores e impressoras.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/produtos" className="rounded-full bg-vermelho px-6 py-3.5 font-bold hover:brightness-110">
                Ver produtos
              </Link>
              <Link href="/assistencia-tecnica" className="rounded-full bg-white/10 px-6 py-3.5 font-bold ring-1 ring-white/30 hover:bg-white/20">
                Assistência técnica
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4">
        {destaques.length > 0 && (
          <section className="mt-12">
            <SecaoTitulo titulo="Destaques" link={{ href: "/produtos", texto: "Ver todos os produtos" }} />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
              {destaques.map(({ produto, rotulo }) => (
                <ProductCard key={produto.codigo} produto={produto} rotulo={rotulo} />
              ))}
            </div>
          </section>
        )}

        {atalhos.length > 0 && (
          <section className="mt-14">
            <SecaoTitulo titulo="Compre por categoria" />
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {atalhos.map((c) => (
                <Link
                  key={c.categoria}
                  href={`/produtos?cat=${slugCategoria(c.categoria)}`}
                  className="flex items-baseline justify-between gap-2 rounded-cartao border border-linha bg-white px-4 py-4 hover:border-azul hover:text-azul"
                >
                  <span className="font-semibold">{categoriaBonita(c.categoria)}</span>
                  <span className="text-sm text-suave">{c.n}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="mt-14 bg-azul text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="faixa-curta" />
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Impressora parou? Notebook lento?</h2>
            <p className="mt-3 max-w-lg text-white/85">
              Nossa equipe técnica avalia o equipamento e explica o que precisa ser feito antes de qualquer serviço.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/assistencia-tecnica" className="rounded-full bg-white px-6 py-3 font-bold text-azul hover:bg-amarelo hover:text-marinho">
                Conhecer a assistência
              </Link>
              <a
                href={linkWhatsApp(conteudo.whatsapp, "Olá! Preciso de manutenção em um equipamento.")}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 rounded-full px-5 py-3 font-bold ring-1 ring-white/40 hover:bg-white/10"
              >
                <IconeWhatsApp /> Falar com a equipe
              </a>
            </div>
          </div>
          <ul className="grid grid-cols-3 gap-3">
            {[
              { icone: <IconeImpressora className="size-8" />, nome: "Impressoras" },
              { icone: <IconeNotebook className="size-8" />, nome: "Notebooks" },
              { icone: <IconeComputador className="size-8" />, nome: "Computadores" },
            ].map((s) => (
              <li key={s.nome} className="flex flex-col items-center gap-2 rounded-cartao bg-white/10 px-2 py-6 text-center font-semibold">
                {s.icone}
                {s.nome}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {tintas.itens.length > 0 && (
          <section className="mt-14">
            <SecaoTitulo titulo="Tintas para impressora" link={{ href: "/produtos?cat=TINTAS", texto: "Ver todas as tintas" }} />
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {tintas.itens.map((p) => (
                <ProductCard key={p.codigo} produto={p} />
              ))}
            </div>
          </section>
        )}

        <section id="lojas" className="mt-14 scroll-mt-40">
          <SecaoTitulo titulo="Nossas lojas" />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {LOJAS.map((l) => (
              <article key={l.nome} className="flex flex-col rounded-cartao border border-linha bg-white p-5">
                <h3 className="text-2xl font-extrabold text-marinho">{l.nome}</h3>
                <p className="mt-2 flex gap-2 text-suave">
                  <IconeLocal className="mt-0.5 size-5 shrink-0 text-vermelho" />
                  <span>
                    {l.endereco}
                    <br />
                    {l.cidade}
                  </span>
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <a href={l.mapa} target="_blank" rel="noopener" className="rounded-full border border-linha px-4 py-2 text-sm font-semibold hover:border-azul hover:text-azul">
                    Como chegar
                  </a>
                  {l.whatsapp ? (
                    <a
                      href={linkWhatsApp(l.whatsapp, `Olá! Vim pelo site e queria falar com a loja de ${l.nome}.`)}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-1.5 rounded-full bg-[#1fa855] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                    >
                      <IconeWhatsApp className="size-4" /> {l.telefone}
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm text-suave">
            {HORARIO.map((h) => `${h.dias}: ${h.horas}`).join(". ")}. Aceitamos Pix, dinheiro e os principais cartões.
          </p>
        </section>
      </div>
    </>
  );
}
