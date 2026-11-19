import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { IconeCaixa } from "@/components/Icones";
import { codificarPedido, lerPedido } from "@/lib/links";
import { montarPedido, resumoPedido, totalPedido } from "@/lib/pedido";
import { formatarPreco, nomeBonito } from "@/lib/site";

// Pagina do link que vai no fim da mensagem do carrinho. Quem abre e a loja (ou o
// proprio cliente): a lista do pedido com a foto de cada produto. A previa do
// WhatsApp usa as tags abaixo, com a imagem de /pedido/imagem (todas as fotos).

type Busca = Promise<{ i?: string | string[] }>;

export async function generateMetadata({ searchParams }: { searchParams: Busca }): Promise<Metadata> {
  const linhas = lerPedido((await searchParams).i);
  if (!linhas.length) return { title: "Pedido", robots: { index: false } };
  const itens = await montarPedido(linhas);
  const { titulo, descricao } = resumoPedido(itens);
  const i = codificarPedido(linhas);
  return {
    title: titulo,
    description: descricao,
    // Fora do Google, mas sem bloquear no robots.txt: o WhatsApp precisa ler a pagina.
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "Info In Time",
      title: titulo,
      description: descricao,
      url: `/pedido?i=${i}`,
      images: [{ url: `/pedido/imagem?i=${i}`, width: 1200, height: 630, type: "image/jpeg", alt: titulo }],
    },
  };
}

export default async function PaginaPedido({ searchParams }: { searchParams: Busca }) {
  const linhas = lerPedido((await searchParams).i);
  const itens = await montarPedido(linhas);
  const achados = itens.filter((i) => i.produto);

  if (!achados.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-marinho">Pedido não encontrado</h1>
        <p className="mt-3 text-suave">Este link de pedido está incompleto ou os produtos saíram do site.</p>
        <Link href="/produtos" className="button button--lg mt-8 inline-flex">Ver produtos</Link>
      </div>
    );
  }

  const { titulo } = resumoPedido(itens);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 pb-16">
      <p className="text-sm text-suave">Pedido montado no site</p>
      <h1 className="mt-1 text-3xl font-extrabold text-marinho sm:text-4xl">{titulo}</h1>

      <ol className="mt-6 divide-y divide-linha rounded-cartao bg-white shadow-suave ring-1 ring-linha/70">
        {itens.map(({ codigo, qtd, produto: p }) => (
          <li key={codigo} className="flex items-center gap-4 p-4">
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f1f5fb] sm:size-28">
              {p?.foto_url ? (
                <Image
                  src={p.foto_url}
                  alt={nomeBonito(p.nome)}
                  width={256}
                  height={256}
                  sizes="112px"
                  className="size-full object-contain mix-blend-multiply"
                />
              ) : (
                <IconeCaixa className="size-10 text-linha" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              {p ? (
                <>
                  <Link href={`/produtos/${encodeURIComponent(codigo)}`} className="font-semibold text-texto hover:text-azul">
                    {nomeBonito(p.nome)}
                  </Link>
                  <p className="text-sm text-suave">Código {codigo}</p>
                  <p className="mt-1 text-sm text-suave">
                    {qtd}x {formatarPreco(Number(p.preco))}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-texto">Código {codigo}</p>
                  <p className="text-sm text-suave">{qtd}x · produto fora do site no momento</p>
                </>
              )}
            </div>
            {p ? (
              <p className="shrink-0 text-lg font-extrabold text-marinho estreito">
                {formatarPreco(Number(p.preco) * qtd)}
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-baseline justify-between px-1">
        <span className="text-suave">Total estimado</span>
        <span className="text-3xl font-extrabold text-marinho estreito">{formatarPreco(totalPedido(itens))}</span>
      </div>
      <p className="mt-2 px-1 text-sm text-suave">
        Preços atuais do site. Preço e estoque são confirmados pela loja na conversa do WhatsApp.
      </p>
    </div>
  );
}
