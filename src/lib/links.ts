// Links absolutos do site que vao dentro das mensagens de WhatsApp. O WhatsApp
// so monta a previa (foto + titulo) quando o link e completo, com https://.
// Sem "server-only": o carrinho monta a mensagem no navegador.

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://infointime.com.br").replace(/\/+$/, "");

export function linkProduto(codigo: string) {
  return `${SITE}/produtos/${encodeURIComponent(codigo)}`;
}

// ---- Link do pedido ----
// O pedido do carrinho vai inteiro no proprio link, sem gravar nada no banco:
// /pedido?i=15476.2,8812.1  (codigo.quantidade, separados por virgula).
// A pagina /pedido busca nome, foto e preco atual de cada codigo, e a previa do
// WhatsApp usa /pedido/imagem, uma imagem com as fotos de todos os itens.

export type LinhaPedido = { codigo: string; qtd: number };

export const MAX_ITENS_PEDIDO = 40;

export function codificarPedido(itens: LinhaPedido[]) {
  return itens
    .slice(0, MAX_ITENS_PEDIDO)
    .map((i) => `${encodeURIComponent(i.codigo)}.${Math.max(1, Math.min(99, Math.round(i.qtd)))}`)
    .join(",");
}

export function linkPedido(itens: LinhaPedido[]) {
  return `${SITE}/pedido?i=${codificarPedido(itens)}`;
}

/** Le o parametro "i" (ja decodificado pelo Next). Ignora o que nao entender. */
export function lerPedido(i: string | string[] | undefined | null): LinhaPedido[] {
  const bruto = Array.isArray(i) ? i[0] : i;
  if (!bruto) return [];
  const mapa = new Map<string, number>();
  for (const parte of bruto.split(",")) {
    const ponto = parte.lastIndexOf(".");
    const codigo = (ponto > 0 ? parte.slice(0, ponto) : parte).trim();
    const qtd = ponto > 0 ? parseInt(parte.slice(ponto + 1), 10) : 1;
    if (!codigo || codigo.length > 40) continue;
    const q = Number.isFinite(qtd) ? Math.max(1, Math.min(99, qtd)) : 1;
    mapa.set(codigo, Math.min(99, (mapa.get(codigo) ?? 0) + q));
    if (mapa.size >= MAX_ITENS_PEDIDO) break;
  }
  return [...mapa].map(([codigo, qtd]) => ({ codigo, qtd }));
}
