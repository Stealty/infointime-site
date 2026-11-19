"use client";

import { carrinho, useCarrinho, type ItemCarrinho } from "@/lib/carrinho";
import { nomeBonito } from "@/lib/formatar";
import { IconeCarrinho, IconeCheck, IconeMais, IconeMenos } from "../Icones";

type Produto = Omit<ItemCarrinho, "qtd">;

// Botao "Adicionar" do card e da pagina do produto. Depois de adicionar vira um
// seletor de quantidade (− 2 +), para o cliente ver na hora que o produto ja esta
// no carrinho e quantos vao.
export default function BotaoAdicionar({
  produto,
  tamanho = "cartao",
}: {
  produto: Produto;
  tamanho?: "cartao" | "pagina" | "barra";
}) {
  const { itens } = useCarrinho();
  const qtd = itens.find((i) => i.codigo === produto.codigo)?.qtd ?? 0;
  const nome = nomeBonito(produto.nome);
  const metrica = `carrinho:${nome}`;

  if (tamanho === "barra") {
    // Barra fixa do celular na pagina do produto: so o icone, com a quantidade.
    return (
      <button
        type="button"
        onClick={() => carrinho.adicionar(produto)}
        data-metrica={metrica}
        aria-label={qtd ? `Adicionar mais um ao carrinho (${qtd} no carrinho)` : "Adicionar ao carrinho"}
        className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-azul/10 text-azul transition-transform active:scale-95"
      >
        <IconeCarrinho className="size-6" />
        <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-azul text-[11px] font-bold text-white">
          {qtd ? qtd : <IconeMais className="size-3" />}
        </span>
      </button>
    );
  }

  const grande = tamanho === "pagina";

  if (!qtd) {
    return (
      <button
        type="button"
        onClick={() => carrinho.adicionar(produto)}
        data-metrica={metrica}
        className={
          grande
            ? "button button--lg h-14 w-full bg-azul px-8 text-lg text-white hover:bg-marinho sm:w-auto"
            : "flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-azul/8 text-sm font-semibold text-azul ring-1 ring-azul/20 transition-colors hover:bg-azul hover:text-white active:scale-[0.98]"
        }
      >
        <IconeCarrinho className={grande ? "size-6" : "size-[18px]"} />
        {grande ? "Adicionar ao carrinho" : "Adicionar"}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={`${nome} no carrinho`}
      className={`flex items-center justify-between rounded-full bg-azul text-white shadow-suave ${grande ? "h-14 w-full gap-2 px-2 sm:w-64" : "h-10 w-full px-1"}`}
    >
      <button
        type="button"
        onClick={() => carrinho.quantidade(produto.codigo, qtd - 1)}
        aria-label={qtd === 1 ? "Tirar do carrinho" : "Diminuir quantidade"}
        className={`flex shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15 ${grande ? "size-11" : "size-8"}`}
      >
        <IconeMenos />
      </button>
      <span aria-live="polite" className={`flex items-center gap-1 font-bold ${grande ? "text-lg" : "text-sm"}`}>
        <IconeCheck className={grande ? "size-5" : "size-4"} />
        {qtd}
        <span className={grande ? "font-medium" : "sr-only"}> no carrinho</span>
      </span>
      <button
        type="button"
        onClick={() => carrinho.quantidade(produto.codigo, qtd + 1)}
        aria-label="Aumentar quantidade"
        className={`flex shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15 ${grande ? "size-11" : "size-8"}`}
      >
        <IconeMais />
      </button>
    </div>
  );
}
