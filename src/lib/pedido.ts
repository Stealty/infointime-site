import "server-only";
import { formatarPreco, nomeBonito, produtosPorCodigo, type Produto } from "./site";
import type { LinhaPedido } from "./links";

export type ItemPedido = LinhaPedido & { produto: Produto | null };

// Junta as linhas do link com os produtos do catalogo, na ordem do pedido.
// Produto que saiu do site volta com produto = null (a pagina avisa).
export async function montarPedido(linhas: LinhaPedido[]): Promise<ItemPedido[]> {
  const prods = await produtosPorCodigo(linhas.map((l) => l.codigo));
  const mapa = new Map(prods.map((p) => [p.codigo, p]));
  return linhas.map((l) => ({ ...l, produto: mapa.get(l.codigo) ?? null }));
}

export function totalPedido(itens: ItemPedido[]) {
  return itens.reduce((s, i) => s + (i.produto ? Number(i.produto.preco) * i.qtd : 0), 0);
}

export function resumoPedido(itens: ItemPedido[]) {
  const achados = itens.filter((i) => i.produto);
  const pecas = achados.reduce((s, i) => s + i.qtd, 0);
  const nomes = achados.slice(0, 3).map((i) => `${i.qtd}x ${nomeBonito(i.produto!.nome)}`);
  if (achados.length > 3) nomes.push(`e mais ${achados.length - 3}`);
  return {
    titulo: `Pedido com ${pecas} ${pecas === 1 ? "item" : "itens"}`,
    descricao: `${nomes.join(", ")}. Total estimado: ${formatarPreco(totalPedido(itens))}.`,
  };
}
