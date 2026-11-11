"use client";

import { useEffect, useState } from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { LOJAS } from "@/lib/lojas";
import { IconeSeta, IconeWhatsApp } from "./Icones";

// Os botoes gerais de WhatsApp do site levam o atributo data-escolher-loja.
// Ao clicar, em vez de ir direto para Volta Redonda, o cliente escolhe a loja
// mais proxima. Sem JavaScript o link continua indo para Volta Redonda.
//
// Rastreamento (GTM do gestor de trafego, ver Rastreamento.tsx): a conversao de
// WhatsApp do Google Ads dispara num "clique em link" cujo endereco contem o
// numero de Volta Redonda. Como o link e cancelado para abrir esta janela, o GTM
// nao registra esse clique sozinho; entao o evento e enviado aqui, no mesmo
// formato que o GTM usaria. Ou seja: a conversao conta no clique do botao, antes
// de escolher a loja. A escolha da loja nesta janela nao dispara nada (os botoes
// abrem o WhatsApp por window.open, sem link com numero), para nao contar duas vezes.
function avisarGtm(link: HTMLAnchorElement) {
  window.dataLayer?.push({
    event: "gtm.linkClick",
    "gtm.element": link,
    "gtm.elementClasses": link.className,
    "gtm.elementId": link.id,
    "gtm.elementTarget": link.target,
    "gtm.elementUrl": link.href,
    // vazio = vale para qualquer acionador de clique em link do contêiner
    "gtm.triggers": "",
  });
}

export default function EscolherLoja() {
  const estado = useOverlayState();
  const [texto, setTexto] = useState("");

  useEffect(() => {
    function aoClicar(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[data-escolher-loja]") as HTMLAnchorElement | null;
      if (!link) return;
      e.preventDefault();
      avisarGtm(link);
      let msg = "";
      try {
        msg = new URL(link.href).searchParams.get("text") ?? "";
      } catch {}
      setTexto(msg);
      estado.open();
    }
    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, [estado]);

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
                    <button
                      type="button"
                      onClick={() => {
                        window.open(`https://wa.me/${l.whatsapp}?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
                        estado.close();
                      }}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-linha bg-white px-4 py-3.5 text-left transition-colors hover:border-zap hover:bg-zap/5"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zap/10 text-zap transition-colors group-hover:bg-zap group-hover:text-white">
                        <IconeWhatsApp className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[17px] font-bold text-texto">{l.nome}</span>
                        <span className="block truncate text-sm text-suave">{l.endereco}</span>
                      </span>
                      <IconeSeta className="size-4 shrink-0 text-suave transition-transform group-hover:translate-x-0.5" />
                    </button>
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
