"use client";

import { useEffect, useRef } from "react";

// Entrada suave quando a secao aparece na tela. Uma vez so, sem repetir ao rolar de volta.
// O HTML sai do servidor visivel: so esconde (e anima) o que ainda esta abaixo da dobra
// quando o JavaScript carrega. Assim o que aparece na primeira tela nao atrasa o LCP,
// e sem JavaScript tudo continua visivel.
export default function Revelar({
  children,
  atraso = 0,
  className,
}: {
  children: React.ReactNode;
  atraso?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.classList.add("revelar-oculto");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.style.transitionDelay = `${atraso}s`;
        el.classList.remove("revelar-oculto");
        io.disconnect();
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [atraso]);

  return (
    <div ref={ref} className={className ? `revelar ${className}` : "revelar"}>
      {children}
    </div>
  );
}
