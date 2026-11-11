"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { IconeSeta, IconeSetaEsq } from "./Icones";

export type Slide = { id: string; nome: string; conteudo: ReactNode };

// Carrossel do topo da home. Cada slide ja vem pronto do servidor (os 3 banners
// fixos em BannersHome.tsx e os que a loja sobe no painel /admin).
export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = slides.length;

  const irPara = useCallback(
    (i: number) => {
      const el = trilho.current;
      if (!el || !total) return;
      const alvo = ((i % total) + total) % total;
      el.scrollTo({ left: alvo * el.clientWidth, behavior: "smooth" });
    },
    [total],
  );

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    const onScroll = () => setAtual(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (total < 2 || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => irPara(atual + 1), 7000);
    return () => window.clearInterval(t);
  }, [atual, total, pausado, irPara]);

  if (!total) return null;

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques da Info In Time"
      className="group/carrossel relative"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div ref={trilho} className="scroll-x flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className="w-full shrink-0 snap-start"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${total}: ${s.nome}`}
            inert={i !== atual ? true : undefined}
          >
            {s.conteudo}
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => irPara(atual - 1)}
            className="absolute left-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-marinho shadow-md transition hover:bg-white md:flex xl:left-5"
          >
            <IconeSetaEsq />
            <span className="sr-only">Banner anterior</span>
          </button>
          <button
            type="button"
            onClick={() => irPara(atual + 1)}
            className="absolute right-3 top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-marinho shadow-md transition hover:bg-white md:flex xl:right-5"
          >
            <IconeSeta />
            <span className="sr-only">Próximo banner</span>
          </button>
          <div className="absolute inset-x-0 bottom-[4.5rem] z-10 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => irPara(i)}
                aria-current={i === atual}
                className={`h-2.5 rounded-full shadow transition-all ${i === atual ? "w-7 bg-amarelo" : "w-2.5 bg-white/70 hover:bg-white"}`}
              >
                <span className="sr-only">Ir para o banner {i + 1}: {s.nome}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
