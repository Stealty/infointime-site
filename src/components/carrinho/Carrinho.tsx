"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Drawer, useOverlayState } from "@heroui/react";
import { carrinho, mensagemPedido, totalItens, totalValor, useCarrinho } from "@/lib/carrinho";
import { formatarPreco, nomeBonito } from "@/lib/formatar";
import { escolherLoja } from "@/lib/lojas";
import { IconeCaixa, IconeCarrinho, IconeCheck, IconeLixeira, IconeMais, IconeMenos, IconeWhatsApp } from "../Icones";

// Botao do carrinho no topo do site, com a quantidade de itens.
export function BotaoCarrinho() {
  const { itens } = useCarrinho();
  const n = totalItens(itens);
  const [pulo, setPulo] = useState(0);

  // Pulinho no icone a cada produto adicionado.
  useEffect(() => {
    if (n) setPulo((p) => p + 1);
  }, [n]);

  return (
    <button
      type="button"
      onClick={carrinho.abrir}
      data-metrica="carrinho:abrir"
      aria-label={n ? `Carrinho, ${n} ${n === 1 ? "item" : "itens"}` : "Carrinho, vazio"}
      className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
    >
      <IconeCarrinho className="size-6" />
      {n ? (
        <span
          key={pulo}
          className="animate-in zoom-in-50 absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amarelo px-1 text-[11px] font-extrabold text-marinho ring-2 ring-marinho"
        >
          {n > 99 ? "99+" : n}
        </span>
      ) : null}
    </button>
  );
}

// Gaveta do carrinho + aviso "Adicionado ao carrinho". Fica uma vez no layout.
export function GavetaCarrinho() {
  const { itens, aberto, aviso } = useCarrinho();
  const estado = useOverlayState({
    isOpen: aberto,
    onOpenChange: (v) => (v ? carrinho.abrir() : carrinho.fechar()),
  });
  const n = totalItens(itens);
  const msg = mensagemPedido(itens);

  return (
    <>
      <Aviso aviso={aviso} n={n} />
      <Drawer state={estado}>
        <Drawer.Backdrop variant="blur">
          <Drawer.Content placement="right">
            <Drawer.Dialog className="flex h-full w-[92vw] max-w-md flex-col bg-white p-0">
              <Drawer.Header className="fundo-marca flex-row! items-start! gap-3 px-5! pb-5! pt-6! text-white">
                <div>
                  <Drawer.Heading className="text-xl! font-extrabold text-white! estreito">Seu carrinho</Drawer.Heading>
                  <p className="mt-1 text-sm text-white/75">
                    Junte os produtos aqui e envie a lista inteira para a loja pelo WhatsApp.
                  </p>
                </div>
                <Drawer.CloseTrigger className="ml-auto shrink-0 text-white" />
              </Drawer.Header>
              <div className="faixa-logo" />

              {itens.length === 0 ? (
                <Drawer.Body className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
                  <span className="flex size-20 items-center justify-center rounded-full bg-fundo text-azul">
                    <IconeCarrinho className="size-10" />
                  </span>
                  <p className="mt-5 text-lg font-bold text-marinho">Seu carrinho está vazio</p>
                  <ol className="mt-4 space-y-2 text-left text-[15px] text-suave">
                    <li><b className="text-texto">1.</b> Toque em <b className="text-azul">Adicionar</b> nos produtos que quiser.</li>
                    <li><b className="text-texto">2.</b> Abra o carrinho e confira as quantidades.</li>
                    <li><b className="text-texto">3.</b> Envie tudo de uma vez pelo WhatsApp da loja.</li>
                  </ol>
                  <Link href="/produtos" onClick={carrinho.fechar} className="button mt-7 bg-azul px-6 text-white hover:bg-marinho">
                    Ver produtos
                  </Link>
                </Drawer.Body>
              ) : (
                <>
                  <Drawer.Body className="flex-1 overflow-y-auto px-3 py-3">
                    <ul className="divide-y divide-linha">
                      {itens.map((i) => {
                        const nome = nomeBonito(i.nome);
                        return (
                          <li key={i.codigo} className="flex gap-3 px-1 py-3">
                            <Link
                              href={`/produtos/${encodeURIComponent(i.codigo)}`}
                              onClick={carrinho.fechar}
                              className="flex size-18 shrink-0 items-center justify-center rounded-xl bg-fundo p-1.5"
                            >
                              {i.foto_url ? (
                                <Image src={i.foto_url} alt="" width={72} height={72} sizes="72px" className="size-full object-contain mix-blend-multiply" />
                              ) : (
                                <IconeCaixa className="size-8 text-azul/25" />
                              )}
                            </Link>
                            <div className="flex min-w-0 flex-1 flex-col">
                              <p className="line-clamp-2 text-[15px] font-medium leading-snug text-texto">{nome}</p>
                              <p className="text-xs text-suave">Cód. {i.codigo}</p>
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <div role="group" aria-label={`Quantidade de ${nome}`} className="flex h-9 items-center rounded-full ring-1 ring-linha">
                                  <button
                                    type="button"
                                    onClick={() => carrinho.quantidade(i.codigo, i.qtd - 1)}
                                    aria-label={i.qtd === 1 ? "Tirar do carrinho" : "Diminuir quantidade"}
                                    className="flex size-9 items-center justify-center rounded-full text-azul hover:bg-fundo"
                                  >
                                    {i.qtd === 1 ? <IconeLixeira /> : <IconeMenos />}
                                  </button>
                                  <span aria-live="polite" className="w-7 text-center font-bold text-texto">{i.qtd}</span>
                                  <button
                                    type="button"
                                    onClick={() => carrinho.quantidade(i.codigo, i.qtd + 1)}
                                    aria-label="Aumentar quantidade"
                                    className="flex size-9 items-center justify-center rounded-full text-azul hover:bg-fundo"
                                  >
                                    <IconeMais />
                                  </button>
                                </div>
                                <p className="text-right font-extrabold leading-tight text-marinho estreito">
                                  {formatarPreco(i.preco * i.qtd)}
                                  {i.qtd > 1 ? (
                                    <span className="block text-[11px] font-medium text-suave" style={{ fontStretch: "100%" }}>
                                      {formatarPreco(i.preco)} cada
                                    </span>
                                  ) : null}
                                </p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Tirar todos os produtos do carrinho?")) carrinho.limpar();
                      }}
                      className="mx-1 mt-1 inline-flex items-center gap-1.5 rounded-md px-1 py-2 text-sm text-suave hover:text-vermelho"
                    >
                      <IconeLixeira /> Esvaziar carrinho
                    </button>
                  </Drawer.Body>

                  <div className="border-t border-linha bg-white px-5 pb-5 pt-4 shadow-[0_-8px_24px_-16px_rgb(10_42_92/0.3)]">
                    <div className="flex items-end justify-between">
                      <p className="text-suave">
                        Total estimado
                        <span className="block text-xs">
                          {n} {n === 1 ? "item" : "itens"}
                        </span>
                      </p>
                      <p className="text-3xl font-extrabold text-marinho estreito">{formatarPreco(totalValor(itens))}</p>
                    </div>
                    <a
                      {...escolherLoja(msg)}
                      onClick={carrinho.fechar}
                      data-metrica="carrinho:enviar"
                      className="button button--lg button--zap mt-4 h-14 w-full text-lg"
                    >
                      <IconeWhatsApp /> Enviar pedido pelo WhatsApp
                    </a>
                    <p className="mt-2.5 text-center text-xs leading-relaxed text-suave">
                      Nada é cobrado aqui. A loja confirma preço, estoque, entrega e pagamento na conversa.
                    </p>
                  </div>
                </>
              )}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}

// Aviso no rodape da tela depois de adicionar: confirma o que entrou e explica o
// proximo passo, com atalho para o carrinho.
function Aviso({ aviso, n }: { aviso: { codigo: string; nome: string; vez: number } | null; n: number }) {
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(carrinho.fecharAviso, 5000);
    return () => clearTimeout(t);
  }, [aviso]);

  if (!aviso) return null;
  return (
    <div className="aviso-carrinho pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:bottom-4">
      <div
        key={aviso.vez}
        role="status"
        className="animate-in fade-in slide-in-from-bottom-4 pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl bg-marinho p-3 pl-4 text-white shadow-[0_16px_40px_-12px_rgb(7_29_66/0.6)]"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zap text-white">
          <IconeCheck className="size-5" />
        </span>
        <p className="min-w-0 flex-1 text-sm leading-snug">
          <span className="block truncate font-semibold">{nomeBonito(aviso.nome)}</span>
          <span className="text-white/75">
            Adicionado! {n} {n === 1 ? "item" : "itens"} no carrinho.
          </span>
        </p>
        <button
          type="button"
          onClick={carrinho.abrir}
          data-metrica="carrinho:ver"
          className="shrink-0 rounded-full bg-amarelo px-4 py-2.5 text-sm font-bold text-marinho transition-transform active:scale-95"
        >
          Ver carrinho
        </button>
      </div>
    </div>
  );
}
