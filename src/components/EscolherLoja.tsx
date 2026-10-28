"use client";

import { useEffect, useState } from "react";
import { Modal, useOverlayState } from "@heroui/react";
import { LOJAS } from "@/lib/lojas";
import { IconeSeta, IconeWhatsApp } from "./Icones";

// Os botoes gerais de WhatsApp do site levam o atributo data-escolher-loja.
// Ao clicar, em vez de ir direto para Volta Redonda, o cliente escolhe a loja
// mais proxima. Sem JavaScript o link continua indo para Volta Redonda.

export default function EscolherLoja() {
  const estado = useOverlayState();
  const [texto, setTexto] = useState("");

  useEffect(() => {
    function aoClicar(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[data-escolher-loja]") as HTMLAnchorElement | null;
      if (!link) return;
      e.preventDefault();
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
                    <a
                      href={`https://wa.me/${l.whatsapp}?text=${encodeURIComponent(texto)}`}
                      target="_blank"
                      rel="noopener"
                      onClick={() => estado.close()}
                      className="group flex items-center gap-3 rounded-xl border border-linha bg-white px-4 py-3.5 transition-colors hover:border-zap hover:bg-zap/5"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zap/10 text-zap transition-colors group-hover:bg-zap group-hover:text-white">
                        <IconeWhatsApp className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[17px] font-bold text-texto">{l.nome}</span>
                        <span className="block truncate text-sm text-suave">{l.endereco}</span>
                      </span>
                      <IconeSeta className="size-4 shrink-0 text-suave transition-transform group-hover:translate-x-0.5" />
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
