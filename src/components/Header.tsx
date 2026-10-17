import Link from "next/link";
import { getCategorias, getConteudo, categoriaBonita, slugCategoria, linkWhatsApp } from "@/lib/site";
import { IconeBusca, IconeMenu, IconeWhatsApp } from "./Icones";

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

  return (
    <header className="sticky top-0 z-40 bg-marinho text-white shadow-[0_1px_0_rgba(255,255,255,0.08)]">
      <p className="hidden bg-black/25 px-4 py-1.5 text-center text-[13px] text-white/80 sm:block">
        Entrega rápida em Volta Redonda, Barra Mansa e Pinheiral
      </p>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
        <details className="group relative lg:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-md hover:bg-white/10 [&::-webkit-details-marker]:hidden">
            <IconeMenu />
            <span className="sr-only">Abrir menu</span>
          </summary>
          <nav className="absolute left-0 top-12 w-64 rounded-cartao bg-white p-2 text-texto shadow-xl">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-md px-3 py-2.5 font-medium hover:bg-fundo">
                {n.label}
              </Link>
            ))}
          </nav>
        </details>

        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Info In Time, página inicial">
          {conteudo.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={conteudo.logo_url} alt="" className="size-11 rounded-full sm:size-12" />
          ) : null}
          <span className="hidden text-xl font-extrabold estreito leading-none sm:block">
            Info In Time
          </span>
        </Link>

        <form action="/produtos" className="relative min-w-0 flex-1">
          <label htmlFor="busca-topo" className="sr-only">
            Buscar produtos
          </label>
          <input
            id="busca-topo"
            name="q"
            type="search"
            placeholder="Buscar tinta, toner, cabo, SSD..."
            className="h-11 w-full rounded-full border-0 bg-white pl-4 pr-12 text-[15px] text-texto placeholder:text-suave/80 focus:outline-none focus-visible:ring-3 focus-visible:ring-amarelo"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-full bg-vermelho text-white hover:brightness-110"
          >
            <IconeBusca />
            <span className="sr-only">Buscar</span>
          </button>
        </form>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.slice(1).map((n) => (
            <Link key={n.href} href={n.href} className="rounded-md px-3 py-2 text-[15px] font-medium text-white/90 hover:bg-white/10 hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>

        <a
          href={zap}
          target="_blank"
          rel="noopener"
          className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#1fa855] px-3 font-semibold hover:brightness-110 sm:px-4"
        >
          <IconeWhatsApp />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>

      <div className="faixa-logo" />

      {principais.length > 0 && (
        <nav aria-label="Categorias" className="bg-white text-texto shadow-sm">
          <div className="scroll-x mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-1.5">
            <Link href="/produtos" className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-azul hover:bg-fundo">
              Todos os produtos
            </Link>
            {principais.map((c) => (
              <Link
                key={c.categoria}
                href={`/produtos?cat=${slugCategoria(c.categoria)}`}
                className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-suave hover:bg-fundo hover:text-texto"
              >
                {categoriaBonita(c.categoria)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
