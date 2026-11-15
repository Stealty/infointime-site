"use client";

import { useEffect } from "react";
import { alturaPagina, emIframe } from "@/lib/metricas";

// Mapa de cliques do portal da TaskMind: o portal abre a pagina do site num iframe e
// desenha os cliques por cima. Ele precisa saber a altura total da pagina para o iframe
// mostrar tudo sem barra de rolagem interna. Fora de iframe, este componente nao faz nada.
export default function AlturaMapa() {
  useEffect(() => {
    if (!emIframe()) return;
    const avisar = () =>
      window.parent.postMessage(
        { tipo: "iit-altura", altura: alturaPagina(), caminho: location.pathname },
        "*",
      );
    avisar();
    // Fotos e banners carregam depois; repete por alguns segundos e a cada mudanca de tamanho.
    const repetir = window.setInterval(avisar, 1000);
    const parar = window.setTimeout(() => window.clearInterval(repetir), 15000);
    const observador = new ResizeObserver(avisar);
    observador.observe(document.body);
    return () => {
      window.clearInterval(repetir);
      window.clearTimeout(parar);
      observador.disconnect();
    };
  }, []);
  return null;
}
