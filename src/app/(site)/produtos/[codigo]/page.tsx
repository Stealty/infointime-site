import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import BotaoAdicionar from "@/components/carrinho/BotaoAdicionar";
import { IconeCaixa, IconeWhatsApp } from "@/components/Icones";
import { escolherLoja } from "@/lib/lojas";
import { linkProduto } from "@/lib/links";
import {
  buscarProdutos,
  categoriaBonita,
  formatarPreco,
  getProduto,
  nomeBonito,
  slugCategoria,
} from "@/lib/site";

export const revalidate = 300;

type Params = Promise<{ codigo: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { codigo } = await params;
  const p = await getProduto(decodeURIComponent(codigo));
  if (!p) return { title: "Produto indisponível" };
  const nome = nomeBonito(p.nome);
  const descricao = `${nome} por ${formatarPreco(Number(p.preco))} na Info In Time.`;
  // Estas tags montam a previa (foto + nome + preco) quando o link do produto
  // vai numa conversa do WhatsApp. O openGraph da pagina substitui o do layout
  // inteiro, entao locale/siteName/title precisam vir aqui de novo.
  return {
    title: nome,
    description: descricao,
    alternates: { canonical: `/produtos/${encodeURIComponent(p.codigo)}` },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "Info In Time",
      title: nome,
      description: descricao,
      url: `/produtos/${encodeURIComponent(p.codigo)}`,
      images: p.foto_url ? [{ url: p.foto_url, alt: nome }] : undefined,
    },
  };
}

export default async function PaginaProduto({ params }: { params: Params }) {
  const { codigo } = await params;
  const cod = decodeURIComponent(codigo);
  const p = await getProduto(cod);
  if (!p) notFound();

  const nome = nomeBonito(p.nome);
  const relacionados = (await buscarProdutos({ categoria: p.categoria, porPagina: 7 })).itens
    .filter((x) => x.codigo !== p.codigo)
    .slice(0, 6);
  const item = { codigo: p.codigo, nome: p.nome, preco: Number(p.preco), foto_url: p.foto_url };
  // O wa.me so aceita texto, nao da para anexar a foto. Com o link do produto na
  // mensagem, o WhatsApp mostra a previa com a foto (tags openGraph acima) e a
  // loja ainda pode tocar no link para ver o produto.
  const msg = `Olá! Tenho interesse no produto ${p.nome} (cód. ${p.codigo}) que vi no site:\n${linkProduto(p.codigo)}`;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <nav aria-label="Você está em" className="text-sm text-suave">
        <Link href="/produtos" className="inline-block py-2.5 hover:text-azul">Produtos</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/produtos?cat=${slugCategoria(p.categoria)}`} className="inline-block py-2.5 hover:text-azul">
          {categoriaBonita(p.categoria)}
        </Link>
      </nav>

      <div className="mt-1 grid gap-6 rounded-cartao bg-white shadow-suave ring-1 ring-linha/70 p-4 sm:p-8 md:grid-cols-2 md:gap-10">
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#f1f5fb_100%)] p-6">
          {p.foto_url ? (
            <Image
              src={p.foto_url}
              alt={nome}
              width={640}
              height={640}
              sizes="(min-width: 1280px) 560px, (min-width: 768px) 45vw, 90vw"
              preload
              loading="eager"
              className="size-full object-contain mix-blend-multiply"
            />
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
          <p className="mt-6 text-5xl font-extrabold estreito text-marinho">{formatarPreco(Number(p.preco))}</p>
          <p className="mt-1 text-sm text-suave">Em estoque. Preço sujeito a alteração, confirme pelo WhatsApp.</p>

          {/* Dois caminhos: juntar com outros produtos no carrinho, ou pedir so este agora. */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BotaoAdicionar produto={item} tamanho="pagina" />
            <a
              {...escolherLoja(msg)}
              className="button button--lg button--zap h-14 w-full px-8 text-lg sm:w-auto"
            >
              <IconeWhatsApp /> Pedir só este
            </a>
          </div>
          <p className="mt-3 text-sm text-suave">
            Vai levar mais coisas? Adicione ao carrinho e envie tudo numa mensagem só.
          </p>

          {/* No celular o botao principal fica abaixo da dobra: barra fixa com preco e pedido. */}
          <div className="barra-pedido fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-linha bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgb(10_42_92/0.25)] backdrop-blur-md md:hidden">
            <p className="min-w-0 flex-1">
              <span className="block truncate text-xs text-suave">{nome}</span>
              <span className="block text-2xl font-extrabold leading-tight text-marinho estreito">{formatarPreco(Number(p.preco))}</span>
            </p>
            <BotaoAdicionar produto={item} tamanho="barra" />
            <a
              {...escolherLoja(msg)}
              className="button button--zap h-12 shrink-0 px-5"
            >
              <IconeWhatsApp /> Pedir
            </a>
          </div>

          <div className="mt-8 border-t border-linha pt-5 text-[15px] text-suave">
            <p className="font-semibold text-texto">Entrega rápida</p>
            <p className="mt-1">Receba em Volta Redonda, Barra Mansa, Pinheiral e Arrozal.</p>
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
