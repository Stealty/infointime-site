import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import ProductCard from "@/components/ProductCard";
import SecaoTitulo from "@/components/SecaoTitulo";
import Revelar from "@/components/Revelar";
import {
  IconeCaminhao,
  IconeCartao,
  IconeComputador,
  IconeImpressora,
  IconeLocal,
  IconeLoja,
  IconeNotebook,
  IconeSelo,
  IconeWhatsApp,
  iconeCategoria,
} from "@/components/Icones";
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

const VANTAGENS = [
  { icone: IconeSelo, titulo: "30 anos de estrada", texto: "Referência em informática no Sul Fluminense" },
  { icone: IconeLoja, titulo: "3 lojas físicas", texto: "Volta Redonda, Barra Mansa e Arrozal" },
  { icone: IconeCaminhao, titulo: "Entrega rápida", texto: "VR, Barra Mansa e Pinheiral" },
  { icone: IconeCartao, titulo: "Pix e cartão", texto: "As principais formas de pagamento" },
];

export default async function Home() {
  const [banners, destaques, categorias, tintas, conteudo] = await Promise.all([
    getBannersAtivos(),
    getDestaques(12),
    getCategorias(),
    buscarProdutos({ categoria: "TINTAS", porPagina: 6 }),
    getConteudo(),
  ]);
  const atalhos = categorias.filter((c) => c.categoria !== "OUTROS").slice(0, 10);
  const vitrine = destaques.filter((d) => d.produto.foto_url).slice(0, 4);

  return (
    <>
      {banners.length ? (
        <HeroCarousel banners={banners} />
      ) : (
        <section className="fundo-marca relative overflow-hidden text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:pb-32">
            <div>
              <span className="faixa-curta animate-sobe" />
              <h1 className="animate-sobe mt-6 text-[42px] font-extrabold sm:text-6xl lg:text-7xl" style={{ animationDelay: "80ms" }}>
                A maior loja de informática do Sul Fluminense
              </h1>
              <p className="animate-sobe mt-6 max-w-xl text-lg leading-relaxed text-white/80" style={{ animationDelay: "160ms" }}>
                Produtos, tintas e toners, e manutenção de notebooks, computadores e impressoras. Há 30 anos atendendo de perto.
              </p>
              <div className="animate-sobe mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
                <Link href="/produtos" className="button button--lg button--danger">
                  Ver produtos em estoque
                </Link>
                <Link href="/assistencia-tecnica" className="button button--lg button--vidro">
                  Assistência técnica
                </Link>
              </div>
            </div>

            {vitrine.length >= 3 && (
              <div className="relative hidden h-[420px] lg:block" aria-hidden>
                {vitrine.map(({ produto }, i) => {
                  const pos = [
                    "left-[6%] top-[2%] rotate-[-6deg]",
                    "right-[2%] top-[10%] rotate-[5deg]",
                    "left-[18%] bottom-[0%] rotate-[3deg]",
                    "right-[14%] bottom-[6%] rotate-[-4deg]",
                  ][i];
                  return (
                    <div
                      key={produto.codigo}
                      className={`animate-sobe absolute size-48 rounded-3xl bg-white p-5 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.5)] ${pos}`}
                      style={{ animationDelay: `${300 + i * 110}ms` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={produto.foto_url!} alt="" className="size-full object-contain mix-blend-multiply" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4">
        <Revelar>
          <ul
            className={`relative z-10 grid grid-cols-2 gap-px overflow-hidden rounded-cartao bg-linha shadow-alta ring-1 ring-linha lg:grid-cols-4 ${
              banners.length ? "mt-8" : "-mt-14"
            }`}
          >
            {VANTAGENS.map((v) => (
              <li key={v.titulo} className="flex items-center gap-3 bg-white px-4 py-5 sm:px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-azul/8 text-azul">
                  <v.icone className="size-6" />
                </span>
                <span>
                  <span className="block font-bold leading-tight text-marinho">{v.titulo}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-suave">{v.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </Revelar>

        {destaques.length > 0 && (
          <section className="mt-16">
            <Revelar>
              <SecaoTitulo titulo="Destaques" link={{ href: "/produtos", texto: "Ver todos os produtos" }} />
            </Revelar>
            <Revelar atraso={0.08}>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-6">
                {destaques.map(({ produto, rotulo }) => (
                  <ProductCard key={produto.codigo} produto={produto} rotulo={rotulo} />
                ))}
              </div>
            </Revelar>
          </section>
        )}

        {atalhos.length > 0 && (
          <section className="mt-16">
            <Revelar>
              <SecaoTitulo titulo="Compre por categoria" />
            </Revelar>
            <Revelar atraso={0.08}>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {atalhos.map((c) => {
                  const Icone = iconeCategoria(c.categoria);
                  return (
                    <Link
                      key={c.categoria}
                      href={`/produtos?cat=${slugCategoria(c.categoria)}`}
                      className="group flex items-center gap-3 rounded-cartao bg-white p-4 shadow-suave ring-1 ring-linha/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-alta hover:ring-azul/30"
                    >
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-fundo text-azul transition-colors duration-300 group-hover:bg-azul group-hover:text-white">
                        <Icone className="size-[22px]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-texto">{categoriaBonita(c.categoria)}</span>
                        <span className="text-sm text-suave">{c.n} {c.n === 1 ? "item" : "itens"}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Revelar>
          </section>
        )}
      </div>

      <section className="fundo-marca mt-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center">
          <Revelar>
            <span className="faixa-curta" />
            <h2 className="mt-5 text-4xl font-extrabold sm:text-5xl">Impressora parou? Notebook lento?</h2>
            <p className="mt-4 max-w-lg text-lg text-white/80">
              Nossa equipe técnica avalia o equipamento e explica o que precisa ser feito antes de qualquer serviço.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/assistencia-tecnica" className="button button--lg button--claro">
                Conhecer a assistência
              </Link>
              <a
                href={linkWhatsApp(conteudo.whatsapp, "Olá! Preciso de manutenção em um equipamento.")}
                target="_blank"
                rel="noopener"
                className="button button--lg button--vidro"
              >
                <IconeWhatsApp /> Falar com a equipe
              </a>
            </div>
          </Revelar>
          <Revelar atraso={0.1}>
            <ul className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { icone: IconeImpressora, nome: "Impressoras" },
                { icone: IconeNotebook, nome: "Notebooks" },
                { icone: IconeComputador, nome: "Computadores" },
              ].map((s) => (
                <li
                  key={s.nome}
                  className="flex flex-col items-center gap-3 rounded-3xl bg-white/[0.07] px-2 py-8 text-center font-semibold ring-1 ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
                >
                  <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-azul">
                    <s.icone className="size-7" />
                  </span>
                  {s.nome}
                </li>
              ))}
            </ul>
          </Revelar>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {tintas.itens.length > 0 && (
          <section className="mt-16">
            <Revelar>
              <SecaoTitulo titulo="Tintas para impressora" link={{ href: "/produtos?cat=TINTAS", texto: "Ver todas as tintas" }} />
            </Revelar>
            <Revelar atraso={0.08}>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
                {tintas.itens.map((p) => (
                  <ProductCard key={p.codigo} produto={p} />
                ))}
              </div>
            </Revelar>
          </section>
        )}

        <section id="lojas" className="mt-16 scroll-mt-40">
          <Revelar>
            <SecaoTitulo titulo="Nossas lojas" />
          </Revelar>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {LOJAS.map((l, i) => (
              <Revelar key={l.nome} atraso={i * 0.08}>
                <article className="flex h-full flex-col rounded-cartao bg-white p-6 shadow-suave ring-1 ring-linha/70">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-vermelho/10 text-vermelho">
                      <IconeLocal className="size-6" />
                    </span>
                    <h3 className="text-2xl font-extrabold text-marinho">{l.nome}</h3>
                  </div>
                  <p className="mt-4 leading-relaxed text-suave">
                    {l.endereco}
                    <br />
                    {l.cidade}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    <a href={l.mapa} target="_blank" rel="noopener" className="button button--sm button--tertiary">
                      Como chegar
                    </a>
                    {l.whatsapp ? (
                      <a
                        href={linkWhatsApp(l.whatsapp, `Olá! Vim pelo site e queria falar com a loja de ${l.nome}.`)}
                        target="_blank"
                        rel="noopener"
                        className="button button--sm button--zap"
                      >
                        <IconeWhatsApp className="size-4" /> {l.telefone}
                      </a>
                    ) : null}
                  </div>
                </article>
              </Revelar>
            ))}
          </div>
          <p className="mt-5 text-sm text-suave">{HORARIO.map((h) => `${h.dias}: ${h.horas}`).join(". ")}.</p>
        </section>
      </div>
    </>
  );
}
