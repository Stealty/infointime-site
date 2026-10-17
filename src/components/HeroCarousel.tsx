"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconeSeta, IconeSetaEsq } from "./Icones";

export type SlideBanner = {
  id: number;
  titulo: string | null;
  imagem_desktop: string;
  imagem_mobile: string | null;
  link: string | null;
};

// Desktop 1920x600 (proporcao 16:5), celular 1080x1080. O painel /admin
// mostra essas medidas na hora de subir a imagem.
export default function HeroCarousel({ banners }: { banners: SlideBanner[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = banners.length;

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
    const t = window.setInterval(() => irPara(atual + 1), 6000);
    return () => window.clearInterval(t);
  }, [atual, total, pausado, irPara]);

  if (!total) return null;

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Promoções e destaques"
      className="relative"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div ref={trilho} className="scroll-x flex snap-x snap-mandatory overflow-x-auto">
        {banners.map((b, i) => {
          const img = (
            <picture>
              {b.imagem_mobile ? <source media="(max-width: 640px)" srcSet={b.imagem_mobile} /> : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.imagem_desktop}
                alt={b.titulo || "Promoção Info In Time"}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className={`block w-full object-cover ${b.imagem_mobile ? "aspect-square sm:aspect-[16/5]" : "aspect-[16/5]"}`}
              />
            </picture>
          );
          return (
            <div
              key={b.id}
              className="w-full shrink-0 snap-start"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${total}`}
            >
              {b.link ? (
                <a href={b.link} className="block">
                  {img}
                </a>
              ) : (
                img
              )}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => irPara(atual - 1)}
            className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-marinho shadow-md hover:bg-white sm:flex"
          >
            <IconeSetaEsq />
            <span className="sr-only">Banner anterior</span>
          </button>
          <button
            type="button"
            onClick={() => irPara(atual + 1)}
            className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-marinho shadow-md hover:bg-white sm:flex"
          >
            <IconeSeta />
            <span className="sr-only">Próximo banner</span>
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => irPara(i)}
                aria-current={i === atual}
                className={`h-2.5 rounded-full shadow transition-all ${i === atual ? "w-7 bg-amarelo" : "w-2.5 bg-white/80"}`}
              >
                <span className="sr-only">Ir para o banner {i + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
