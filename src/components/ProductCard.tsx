import Link from "next/link";
import Image from "next/image";
import { type Produto, formatarPreco, nomeBonito, categoriaBonita } from "@/lib/site";
import { IconeCaixa } from "./Icones";
import BotaoAdicionar from "./carrinho/BotaoAdicionar";

export default function ProductCard({
  produto,
  rotulo,
  prioridade = false,
}: {
  produto: Produto;
  rotulo?: string | null;
  /** Primeiros cards visiveis na tela: carrega a foto na hora (ajuda o LCP). */
  prioridade?: boolean;
}) {
  const nome = nomeBonito(produto.nome);
  const [reais, centavos] = formatarPreco(Number(produto.preco)).replace("R$", "").trim().split(",");
  // O botao Adicionar fica fora do link (botao dentro de link nao e HTML valido e
  // o toque nele abriria o produto). O link cobre foto, nome e preco.
  return (
    <div className="cartao-produto group relative flex flex-col overflow-hidden rounded-cartao bg-white shadow-suave ring-1 ring-linha/70">
      <Link
        href={`/produtos/${encodeURIComponent(produto.codigo)}`}
        data-metrica={`produto:${nome}`}
        className="flex flex-1 flex-col"
      >
      {rotulo ? (
        <span className="chip chip--sm absolute left-3 top-3 z-10 bg-amarelo font-bold text-marinho shadow-sm">{rotulo}</span>
      ) : null}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#f1f5fb_100%)] p-5">
        {produto.foto_url ? (
          <Image
            src={produto.foto_url}
            alt={nome}
            width={256}
            height={256}
            sizes="(min-width: 1280px) 200px, (min-width: 640px) 30vw, 45vw"
            preload={prioridade}
            loading={prioridade ? "eager" : "lazy"}
            className="size-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-azul/25">
            <IconeCaixa className="size-12" />
            <span className="text-xs text-suave">Foto em breve</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-4 pb-3 pt-3">
        <span className="text-[12px] font-medium text-azul">{categoriaBonita(produto.categoria)}</span>
        <h3 className="mt-1 line-clamp-2 min-h-[2.6em] text-[15px] font-medium leading-snug text-texto" style={{ fontStretch: "100%", letterSpacing: 0 }}>
          {nome}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="font-extrabold leading-none text-marinho estreito">
            <span className="mr-0.5 align-top text-sm">R$</span>
            <span className="text-[28px]">{reais}</span>
            <span className="align-top text-sm">,{centavos}</span>
          </p>
        </div>
      </div>
      </Link>
      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <BotaoAdicionar
          produto={{ codigo: produto.codigo, nome: produto.nome, preco: Number(produto.preco), foto_url: produto.foto_url }}
        />
      </div>
    </div>
  );
}
