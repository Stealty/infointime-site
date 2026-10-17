type P = { className?: string };

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const IconeBusca = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconeMenu = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconeSeta = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconeSetaEsq = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="m15 6-6 6 6 6" />
  </svg>
);

export const IconeLocal = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

export const IconeRelogio = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconeFerramenta = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.4 2.4-2.6-.4-.4-2.6 2.4-2.4Z" />
  </svg>
);

export const IconeImpressora = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M7 9V3h10v6" />
    <rect x="3" y="9" width="18" height="8" rx="2" />
    <path d="M7 14h10v7H7z" />
  </svg>
);

export const IconeNotebook = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="4" y="4" width="16" height="11" rx="1.5" />
    <path d="M2 19h20" />
  </svg>
);

export const IconeComputador = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="2" y="4" width="14" height="10" rx="1.5" />
    <path d="M6 18h6M9 14v4" />
    <rect x="18" y="4" width="4" height="14" rx="1" />
  </svg>
);

export const IconeBateria = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="3" y="7" width="16" height="10" rx="2" />
    <path d="M22 11v2M10 9l-2 3h4l-2 3" />
  </svg>
);

export const IconeWhatsApp = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.42 1.3-1.96 1.34-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.47.24.56.79 1.92.86 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.33Z" />
  </svg>
);

export const IconeInstagram = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </svg>
);

export const IconeFacebook = ({ className = "size-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.5V4.5c-.26-.03-1.15-.1-2.2-.1-2.17 0-3.66 1.33-3.66 3.76v2.34H8.2v3h2.44V21h2.86Z" />
  </svg>
);

export const IconeCaixa = ({ className = "size-10" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base} strokeWidth={1.5}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </svg>
);

export const IconeGota = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
  </svg>
);

export const IconeCabo = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M7 3v4M11 3v4M5 7h8v4a4 4 0 0 1-8 0V7ZM9 15v2a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4V9" />
  </svg>
);

export const IconeWifi = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" />
    <circle cx="12" cy="19.5" r="1" fill="currentColor" />
  </svg>
);

export const IconeMouse = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="6" y="3" width="12" height="18" rx="6" />
    <path d="M12 7v3" />
  </svg>
);

export const IconeTeclado = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
  </svg>
);

export const IconeFone = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
    <rect x="3" y="14" width="4" height="6" rx="1.5" />
    <rect x="17" y="14" width="4" height="6" rx="1.5" />
  </svg>
);

export const IconeChip = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
  </svg>
);

export const IconeCaminhao = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
);

export const IconeLoja = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <path d="M4 10v10h16V10M3 6l2-3h14l2 3v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V6Z" />
    <path d="M10 20v-5h4v5" />
  </svg>
);

export const IconeSelo = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <circle cx="12" cy="9" r="6" />
    <path d="m9 14-2 7 5-3 5 3-2-7" />
  </svg>
);

export const IconeCartao = ({ className = "size-6" }: P) => (
  <svg viewBox="0 0 24 24" className={className} {...base}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20M6 15h4" />
  </svg>
);

// Icone de cada categoria do Shop 9, pelo nome. O que nao casar usa a caixa.
export function iconeCategoria(c: string) {
  const n = c.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/tinta|refil|cartucho|insumo/.test(n)) return IconeGota;
  if (/toner|impressora|papel|bobina/.test(n)) return IconeImpressora;
  if (/cabo|adaptador|extensao|hub|carregador|fonte/.test(n)) return IconeCabo;
  if (/rede|internet|wifi|roteador/.test(n)) return IconeWifi;
  if (/mouse/.test(n)) return IconeMouse;
  if (/teclado/.test(n)) return IconeTeclado;
  if (/fone|headset|som|microfone/.test(n)) return IconeFone;
  if (/memori|ssd|hd|pen ?drive|processador|placa|cartao/.test(n)) return IconeChip;
  if (/notebook/.test(n)) return IconeNotebook;
  if (/gabinete|monitor|computador/.test(n)) return IconeComputador;
  if (/nobreak|estabiliz|bateria|pilha/.test(n)) return IconeBateria;
  return IconeCaixa;
}
