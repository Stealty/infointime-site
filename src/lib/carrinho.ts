"use client";

import { useSyncExternalStore } from "react";
import { formatarPreco, nomeBonito } from "./formatar";
import { linkProduto } from "./lojas";

// Carrinho do site: so no navegador (localStorage), sem conta, sem pagamento.
// O cliente junta os produtos e manda a lista inteira para a loja pelo WhatsApp,
// na mesma janela "Qual loja fica mais perto de você?" dos outros botoes (ver
// EscolherLoja), entao as conversoes do GTM continuam contando do mesmo jeito.
// Preco e estoque sao confirmados pela loja na conversa.

export type ItemCarrinho = {
  codigo: string;
  nome: string;
  preco: number;
  foto_url: string | null;
  qtd: number;
};

type Estado = {
  itens: ItemCarrinho[];
  aberto: boolean;
  /** Ultimo produto adicionado, para o aviso "Adicionado ao carrinho". */
  aviso: { codigo: string; nome: string; vez: number } | null;
};

const CHAVE = "iit_carrinho";
const MAX_QTD = 99;
const MAX_ITENS = 40;
const VAZIO: Estado = { itens: [], aberto: false, aviso: null };

let estado: Estado = VAZIO;
let carregado = false;
const ouvintes = new Set<() => void>();

function lerSalvo(): ItemCarrinho[] {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE) || "[]");
    if (!Array.isArray(bruto)) return [];
    return bruto
      .filter((i) => i && typeof i.codigo === "string" && typeof i.nome === "string" && Number.isFinite(i.preco))
      .slice(0, MAX_ITENS)
      .map((i) => ({
        codigo: i.codigo,
        nome: i.nome,
        preco: Number(i.preco),
        foto_url: typeof i.foto_url === "string" ? i.foto_url : null,
        qtd: Math.min(MAX_QTD, Math.max(1, Math.round(Number(i.qtd) || 1))),
      }));
  } catch {
    return [];
  }
}

function carregar() {
  if (carregado || typeof window === "undefined") return;
  carregado = true;
  estado = { ...estado, itens: lerSalvo() };
  // Outra aba mexeu no carrinho: acompanha.
  window.addEventListener("storage", (e) => {
    if (e.key !== CHAVE) return;
    estado = { ...estado, itens: lerSalvo() };
    ouvintes.forEach((f) => f());
  });
}

function mudar(novo: Partial<Estado>, salvar = true) {
  estado = { ...estado, ...novo };
  if (salvar) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado.itens));
    } catch {
      // Navegador sem armazenamento (aba anonima etc.): o carrinho vale so nesta pagina.
    }
  }
  ouvintes.forEach((f) => f());
}

function assinar(f: () => void) {
  carregar();
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

export function useCarrinho() {
  return useSyncExternalStore(
    assinar,
    () => {
      carregar();
      return estado;
    },
    () => VAZIO,
  );
}

export function totalItens(itens: ItemCarrinho[]) {
  return itens.reduce((s, i) => s + i.qtd, 0);
}

export function totalValor(itens: ItemCarrinho[]) {
  return itens.reduce((s, i) => s + i.qtd * i.preco, 0);
}

export const carrinho = {
  adicionar(p: Omit<ItemCarrinho, "qtd">, qtd = 1) {
    carregar();
    const existe = estado.itens.find((i) => i.codigo === p.codigo);
    const itens = existe
      ? estado.itens.map((i) => (i.codigo === p.codigo ? { ...i, ...p, qtd: Math.min(MAX_QTD, i.qtd + qtd) } : i))
      : [...estado.itens, { ...p, qtd }].slice(-MAX_ITENS);
    mudar({ itens, aviso: { codigo: p.codigo, nome: p.nome, vez: Date.now() } });
  },
  quantidade(codigo: string, qtd: number) {
    if (qtd < 1) return carrinho.remover(codigo);
    mudar({ itens: estado.itens.map((i) => (i.codigo === codigo ? { ...i, qtd: Math.min(MAX_QTD, qtd) } : i)) });
  },
  remover(codigo: string) {
    mudar({ itens: estado.itens.filter((i) => i.codigo !== codigo) });
  },
  limpar() {
    mudar({ itens: [] });
  },
  abrir() {
    mudar({ aberto: true, aviso: null }, false);
  },
  fechar() {
    mudar({ aberto: false }, false);
  },
  fecharAviso() {
    mudar({ aviso: null }, false);
  },
};

// Mensagem que vai para o WhatsApp. Uma linha por produto com o codigo, para a
// equipe (e a Bianca) acharem cada item no sistema sem perguntar nada, e o link
// do produto embaixo: tocando nele a loja ve a foto (o WhatsApp tambem mostra a
// previa com a foto do primeiro link da mensagem).
export function mensagemPedido(itens: ItemCarrinho[]) {
  const linhas = itens.map(
    (i, n) =>
      `${n + 1}. ${i.qtd}x ${nomeBonito(i.nome)} (cód. ${i.codigo}) - ${formatarPreco(i.preco)}${i.qtd > 1 ? " cada" : ""}\n   ${linkProduto(i.codigo)}`,
  );
  return [
    "Olá! Montei este pedido no site da Info In Time:",
    "",
    ...linhas,
    "",
    `Total estimado: ${formatarPreco(totalValor(itens))}`,
    "Pode confirmar os preços e a disponibilidade?",
  ].join("\n");
}
