import Link from "next/link";
import { type Produto, formatarPreco, nomeBonito, categoriaBonita } from "@/lib/site";
import { IconeCaixa, IconeSeta } from "./Icones";

export default function ProductCard({ produto, rotulo }: { produto: Produto; rotulo?: string | null }) {
  const nome = nomeBonito(produto.nome);
  const [reais, centavos] = formatarPreco(Number(produto.preco)).replace("R$", "").trim().split(",");
  return (
    <Link
      href={`/produtos/${encodeURIComponent(produto.codigo)}`}
      className="cartao-produto group relative flex flex-col overflow-hidden rounded-cartao bg-white shadow-suave ring-1 ring-linha/70"
    >
      {rotulo ? (
        <span className="chip chip--sm absolute left-3 top-3 z-10 bg-amarelo font-bold text-marinho shadow-sm">{rotulo}</span>
      ) : null}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#f1f5fb_100%)] p-5">
        {produto.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.foto_url}
            alt={nome}
            loading="lazy"
            className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-azul/25">
            <IconeCaixa className="size-12" />
            <span className="text-xs text-suave">Foto em breve</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <span className="text-[12px] font-medium text-azul/80">{categoriaBonita(produto.categoria)}</span>
        <h3 className="mt-1 line-clamp-2 min-h-[2.6em] text-[15px] font-medium leading-snug text-texto" style={{ fontStretch: "100%", letterSpacing: 0 }}>
          {nome}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="font-extrabold leading-none text-marinho estreito">
            <span className="mr-0.5 align-top text-sm">R$</span>
            <span className="text-[28px]">{reais}</span>
            <span className="align-top text-sm">,{centavos}</span>
          </p>
          <span className="flex size-9 items-center justify-center rounded-full bg-fundo text-azul transition-all duration-300 group-hover:bg-azul group-hover:text-white">
            <IconeSeta className="size-4" />
            <span className="sr-only">Ver produto</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
