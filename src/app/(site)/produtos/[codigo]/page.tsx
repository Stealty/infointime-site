import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { IconeCaixa, IconeWhatsApp } from "@/components/Icones";
import {
  buscarProdutos,
  categoriaBonita,
  formatarPreco,
  getConteudo,
  getProduto,
  linkWhatsApp,
  nomeBonito,
  slugCategoria,
} from "@/lib/site";
import { LOJAS } from "@/lib/lojas";

export const revalidate = 300;

type Params = Promise<{ codigo: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { codigo } = await params;
  const p = await getProduto(decodeURIComponent(codigo));
  if (!p) return { title: "Produto indisponível" };
  const nome = nomeBonito(p.nome);
  return {
    title: nome,
    description: `${nome} por ${formatarPreco(Number(p.preco))} na Info In Time.`,
    openGraph: p.foto_url ? { images: [p.foto_url] } : undefined,
  };
}

export default async function PaginaProduto({ params }: { params: Params }) {
  const { codigo } = await params;
  const cod = decodeURIComponent(codigo);
  const [p, conteudo] = await Promise.all([getProduto(cod), getConteudo()]);
  if (!p) notFound();

  const nome = nomeBonito(p.nome);
  const relacionados = (await buscarProdutos({ categoria: p.categoria, porPagina: 7 })).itens
    .filter((x) => x.codigo !== p.codigo)
    .slice(0, 6);
  const msg = `Olá! Tenho interesse no produto ${p.nome} (cód. ${p.codigo}) que vi no site.`;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <nav aria-label="Você está em" className="text-sm text-suave">
        <Link href="/produtos" className="hover:text-azul">Produtos</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/produtos?cat=${slugCategoria(p.categoria)}`} className="hover:text-azul">
          {categoriaBonita(p.categoria)}
        </Link>
      </nav>

      <div className="mt-4 grid gap-6 rounded-cartao border border-linha bg-white p-4 sm:p-8 md:grid-cols-2 md:gap-10">
        <div className="flex aspect-square items-center justify-center">
          {p.foto_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.foto_url} alt={nome} className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-linha">
              <IconeCaixa className="size-20" />
              <span className="text-suave">Foto em breve</span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm text-suave">
            {p.marca ? `${nomeBonito(p.marca)} · ` : ""}Código {p.codigo}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-marinho sm:text-4xl">{nome}</h1>
          <p className="mt-6 text-5xl font-extrabold estreito text-azul">{formatarPreco(Number(p.preco))}</p>
          <p className="mt-1 text-sm text-suave">Em estoque. Preço sujeito a alteração, confirme pelo WhatsApp.</p>

          <a
            href={linkWhatsApp(conteudo.whatsapp, msg)}
            target="_blank"
            rel="noopener"
            className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#1fa855] px-6 py-4 text-lg font-bold text-white hover:brightness-110 sm:self-start"
          >
            <IconeWhatsApp /> Pedir pelo WhatsApp
          </a>

          <div className="mt-8 border-t border-linha pt-5 text-[15px] text-suave">
            <p className="font-semibold text-texto">Retire numa das lojas</p>
            <ul className="mt-2 space-y-1">
              {LOJAS.map((l) => (
                <li key={l.nome}>
                  {l.nome}: {l.endereco}
                </li>
              ))}
            </ul>
            <p className="mt-3">Ou receba com entrega rápida em Volta Redonda, Barra Mansa e Pinheiral.</p>
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-extrabold text-marinho">Mais em {categoriaBonita(p.categoria)}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {relacionados.map((r) => (
              <ProductCard key={r.codigo} produto={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
