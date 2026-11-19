"use client";

import { useEffect, useState } from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { LOJAS } from "@/lib/lojas";
import { IconeSeta, IconeWhatsApp } from "./Icones";

// Os botoes gerais de WhatsApp do site levam o atributo data-escolher-loja (ver
// escolherLoja em lib/lojas.ts), com a mensagem pronta no valor do atributo. Ao
// clicar, o cliente escolhe a loja mais proxima nesta janela. Sem JavaScript o
// botao leva para a lista de lojas da home.
//
// Rastreamento (GTM do gestor de trafego, ver Rastreamento.tsx): as conversoes
// de WhatsApp disparam no "clique em link" (gtm.linkClick), com os mesmos
// criterios da secao "Nossas lojas" da home: o numero da loja no endereco do
// link (Volta Redonda 5524988138858, Barra Mansa 5524988136426); Arrozal nao
// tem conversao. Por isso:
// - o botao geral NAO tem numero no link (antes tinha o de Volta Redonda e todo
//   clique contava como VR, mesmo quando a pessoa escolhia outra loja);
// - cada loja desta janela e um link de verdade para o WhatsApp dela, e o
//   ouvinte de cliques do proprio GTM conta a conversao da loja escolhida.
// - o Modal.Backdrop do HeroUI chama stopPropagation em todo clique, e como a
//   janela fica num portal no <body> o clique nunca chegava ao document, onde o
//   GTM ouve "clique em link" (so o gtm.click, que ouve na captura, passava).
//   O ouvinte de captura abaixo anula essa parada so nos links das lojas.
// Nao enviar eventos manuais para o dataLayer: o GTM ja ouve os cliques sozinho
// e o evento duplicado conta a conversao duas vezes.
export default function EscolherLoja() {
  const estado = useOverlayState();
  const [texto, setTexto] = useState("");

  useEffect(() => {
    function aoClicar(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[data-escolher-loja]") as HTMLAnchorElement | null;
      if (!link) return;
      e.preventDefault();
      setTexto(link.getAttribute("data-escolher-loja") ?? "");
      estado.open();
    }
    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, [estado]);

  useEffect(() => {
    // Roda na captura, antes do React (que trata o portal no <body>): deixa o
    // clique numa loja seguir ate o document para o GTM contar a conversao.
    function liberarClique(e: MouseEvent) {
      if ((e.target as Element | null)?.closest?.("a[data-loja-whatsapp]")) e.stopPropagation = () => {};
    }
    document.addEventListener("click", liberarClique, true);
    return () => document.removeEventListener("click", liberarClique, true);
  }, []);

  return (
    <Modal state={estado}>
      <Modal.Backdrop variant="blur">
        <Modal.Container placement="center" size="sm">
          <Modal.Dialog className="overflow-hidden p-0">
            <Modal.Header className="fundo-marca flex-row! items-start! gap-3 pb-5! pl-5! pr-12! pt-6! text-white">
              <div>
                <Modal.Heading className="text-xl! font-extrabold text-white! estreito">
                  Qual loja fica mais perto de você?
                </Modal.Heading>
                <p className="mt-1 text-sm text-white/75">Você vai falar direto com a equipe da loja escolhida.</p>
              </div>
              <Modal.CloseTrigger className="ml-auto shrink-0 text-white" />
            </Modal.Header>
            <div className="faixa-logo" />

            <Modal.Body className="p-3">
              <ul className="space-y-2">
                {LOJAS.map((l, i) => (
                  <li key={l.nome} className="animate-sobe" style={{ animationDelay: `${60 + i * 50}ms` }}>
                    <a
                      href={`https://wa.me/${l.whatsapp}?text=${encodeURIComponent(texto)}`}
                      target="_blank"
                      rel="noopener"
                      data-metrica={`loja:${l.nome}`}
                      data-loja-whatsapp=""
                      onClick={() => estado.close()}
                      // [&_*]:pointer-events-none: o clique cai sempre no proprio link,
                      // que e onde o GTM le o endereco e o texto (igual a home).
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-linha bg-white px-4 py-3.5 text-left transition-colors hover:border-zap hover:bg-zap/5 [&_*]:pointer-events-none"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zap/10 text-zap transition-colors group-hover:bg-zap group-hover:text-white">
                        <IconeWhatsApp className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[17px] font-bold text-texto">{l.nome}</span>
                        <span className="block truncate text-sm text-suave">{l.endereco}</span>
                      </span>
                      <IconeSeta className="size-4 shrink-0 text-suave transition-transform group-hover:translate-x-0.5" />
                      {/* Criterio de Barra Mansa nas versoes antigas do GTM (hoje e pelo numero). */}
                      {l.nome === "Barra Mansa" ? <span className="sr-only">Info in Time Barra Mansa</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
