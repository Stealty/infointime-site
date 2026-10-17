"use client";

import Link from "next/link";
import { Drawer, useOverlayState } from "@heroui/react";
import { IconeMenu, IconeWhatsApp, IconeSeta } from "./Icones";

type Item = { href: string; label: string };

export default function MenuMobile({
  nav,
  categorias,
  zap,
  logo,
}: {
  nav: Item[];
  categorias: Item[];
  zap: string;
  logo: string;
}) {
  const estado = useOverlayState();
  const fechar = () => estado.close();

  return (
    <Drawer state={estado}>
      <Drawer.Trigger
        aria-label="Abrir menu"
        className="flex size-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/10 lg:hidden"
      >
        <IconeMenu />
      </Drawer.Trigger>
      <Drawer.Backdrop variant="blur">
        <Drawer.Content placement="left">
          <Drawer.Dialog className="flex h-full w-[86vw] max-w-sm flex-col bg-white p-0">
            <Drawer.Header className="fundo-marca flex-row! items-center! gap-3 px-5! pb-5! pt-6! text-white">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="size-11 rounded-full ring-2 ring-white/20" />
              ) : null}
              <Drawer.Heading className="text-xl! font-extrabold text-white! estreito">Info In Time</Drawer.Heading>
              <Drawer.CloseTrigger className="ml-auto text-white" />
            </Drawer.Header>
            <div className="faixa-logo" />

            <Drawer.Body className="flex-1 overflow-y-auto px-3 py-4">
              <nav aria-label="Menu principal">
                <ul className="space-y-1">
                  {[{ href: "/", label: "Início" }, ...nav].map((n, i) => (
                    <li key={n.href} className="animate-sobe" style={{ animationDelay: `${80 + i * 45}ms` }}>
                      <Link
                        href={n.href}
                        onClick={fechar}
                        className="flex items-center justify-between rounded-xl px-3 py-3 text-[17px] font-semibold text-texto transition-colors hover:bg-fundo"
                      >
                        {n.label}
                        <IconeSeta className="size-4 text-suave" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {categorias.length > 0 && (
                <div className="mt-6 px-3">
                  <p className="text-sm font-semibold text-suave">Categorias</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {categorias.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={fechar}
                        className="rounded-full bg-fundo px-3 py-1.5 text-sm text-texto transition-colors hover:bg-azul hover:text-white"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Drawer.Body>

            <Drawer.Footer className="border-t border-linha p-4">
              <a href={zap} target="_blank" rel="noopener" onClick={fechar} className="button button--lg button--zap button--full-width">
                <IconeWhatsApp /> Falar no WhatsApp
              </a>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
