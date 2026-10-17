import Link from "next/link";
import { type Produto, formatarPreco, nomeBonito, categoriaBonita } from "@/lib/site";
import { IconeCaixa } from "./Icones";

export default function ProductCard({ produto, rotulo }: { produto: Produto; rotulo?: string | null }) {
  const nome = nomeBonito(produto.nome);
  return (
    <Link
      href={`/produtos/${encodeURIComponent(produto.codigo)}`}
      className="group relative flex flex-col overflow-hidden rounded-cartao border border-linha bg-white transition-colors hover:border-azul-claro"
    >
      {rotulo ? (
        <span className="absolute left-2 top-2 z-10 rounded-full bg-amarelo px-2.5 py-1 text-xs font-bold text-marinho">
          {rotulo}
        </span>
      ) : null}
      <div className="flex aspect-square items-center justify-center bg-white p-4">
        {produto.foto_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.foto_url}
            alt={nome}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-linha">
            <IconeCaixa />
            <span className="text-xs text-suave">Foto em breve</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col border-t border-linha/70 p-3 sm:p-4">
        <span className="text-xs text-suave">{categoriaBonita(produto.categoria)}</span>
        <h3 className="mt-1 line-clamp-3 text-[15px] font-medium leading-snug text-texto" style={{ fontStretch: "100%" }}>
          {nome}
        </h3>
        <p className="mt-auto pt-3 text-2xl font-extrabold estreito text-azul">{formatarPreco(Number(produto.preco))}</p>
      </div>
    </Link>
  );
}
