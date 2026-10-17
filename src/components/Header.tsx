import Link from "next/link";
import { getCategorias, getConteudo, categoriaBonita, slugCategoria, linkWhatsApp } from "@/lib/site";
import { IconeBusca, IconeWhatsApp } from "./Icones";
import MenuMobile from "./MenuMobile";

const NAV = [
  { href: "/produtos", label: "Produtos" },
  { href: "/assistencia-tecnica", label: "Assistência técnica" },
  { href: "/nossa-historia", label: "Nossa história" },
  { href: "/#lojas", label: "Lojas" },
];

export default async function Header() {
  const [conteudo, categorias] = await Promise.all([getConteudo(), getCategorias()]);
  const zap = linkWhatsApp(conteudo.whatsapp, "Olá! Vim pelo site da Info In Time.");
  const principais = categorias.filter((c) => c.categoria !== "OUTROS").slice(0, 12);
  const itensCategoria = principais.map((c) => ({
    href: `/produtos?cat=${slugCategoria(c.categoria)}`,
    label: categoriaBonita(c.categoria),
  }));

  return (
    <header className="sticky top-0 z-40">
      <div className="fundo-marca text-white">
        <p className="hidden border-b border-white/10 px-4 py-1.5 text-center text-[13px] text-white/75 sm:block">
          Entrega rápida em Volta Redonda, Barra Mansa e Pinheiral · Retire na loja
        </p>

        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-5">
          <MenuMobile nav={NAV} categorias={itensCategoria} zap={zap} logo={conteudo.logo_url} />

          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Info In Time, página inicial">
            {conteudo.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conteudo.logo_url}
                alt=""
                className="size-10 rounded-full ring-2 ring-white/15 transition-transform duration-300 group-hover:rotate-[-8deg] sm:size-12"
              />
            ) : null}
            <span className="hidden text-[22px] font-extrabold leading-none estreito sm:block">Info In Time</span>
          </Link>

          <form action="/produtos" className="relative min-w-0 flex-1 lg:max-w-xl">
            <label htmlFor="busca-topo" className="sr-only">
              Buscar produtos
            </label>
            <input
              id="busca-topo"
              name="q"
              type="search"
              placeholder="Buscar tinta, toner, cabo, SSD..."
              className="h-11 w-full rounded-full border-0 bg-white pl-5 pr-12 text-[15px] text-texto shadow-[inset_0_0_0_1px_rgb(10_42_92/0.08)] transition-shadow placeholder:text-suave/80 focus:outline-none focus-visible:shadow-[0_0_0_4px_rgb(255_198_26/0.55)]"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-full bg-vermelho text-white transition-transform hover:scale-105 active:scale-95"
            >
              <IconeBusca />
              <span className="sr-only">Buscar</span>
            </button>
          </form>

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {NAV.slice(1).map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="relative px-3 py-2 text-[15px] font-medium text-white/85 transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-amarelo after:transition-transform hover:text-white hover:after:scale-x-100"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <a href={zap} target="_blank" rel="noopener" className="button button--zap shrink-0 max-sm:px-3" aria-label="WhatsApp">
            <IconeWhatsApp />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="faixa-logo" />

      {principais.length > 0 && (
        <nav aria-label="Categorias" className="border-b border-linha bg-white/90 text-texto backdrop-blur-md">
          <div className="scroll-x mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-4 py-2">
            <Link href="/produtos" className="chip chip--sm chip--accent shrink-0 font-semibold">
              Todos os produtos
            </Link>
            {itensCategoria.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm text-suave transition-colors hover:bg-fundo hover:text-azul"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
