"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

// Tags do gestor de trafego, as mesmas do site antigo (WordPress).
// - GTM: dentro dele estao a tag do Google Ads (AW-724939570), o remarketing e as
//   conversoes. Os acionadores foram feitos para o site antigo e NAO devem ser
//   mudados daqui: o site novo e que imita o que eles esperam (ver EscolherLoja).
//   Nao enviar eventos gtm.linkClick manuais: o GTM ja ouve os cliques sozinho
//   e o evento duplicado conta a conversao duas vezes.
// - Pixel da Meta: so PageView, como era antes.
export const GTM_ID = "GTM-T377L3HC";
const META_PIXEL_ID = "734071987525510";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    fbq?: (...args: unknown[]) => void;
  }
}

// Consentimento (LGPD): Google Ads, remarketing e pixel da Meta sao cookies de publicidade, entao
// so carregam depois que o visitante aceita no aviso. A escolha fica no navegador dele.
type Escolha = "aceito" | "recusado";
const CHAVE = "iit_cookies";
const EVENTO = "iit-cookies";

function lerEscolha(): Escolha | null {
  try {
    const v = window.localStorage.getItem(CHAVE);
    return v === "aceito" || v === "recusado" ? v : null;
  } catch {
    return null;
  }
}

export function gravarEscolha(valor: Escolha | null) {
  try {
    if (valor) window.localStorage.setItem(CHAVE, valor);
    else window.localStorage.removeItem(CHAVE);
  } catch {
    // navegador sem armazenamento: vale so para esta visita
  }
  window.dispatchEvent(new CustomEvent(EVENTO));
}

// undefined = o navegador ainda nao respondeu (nao mostra aviso nem carrega nada).
function useEscolha() {
  const [escolha, setEscolha] = useState<Escolha | null | undefined>(undefined);
  useEffect(() => {
    const sincronizar = () => setEscolha(lerEscolha());
    sincronizar();
    window.addEventListener(EVENTO, sincronizar);
    window.addEventListener("storage", sincronizar);
    return () => {
      window.removeEventListener(EVENTO, sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);
  return escolha;
}

function AvisoCookies() {
  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-3xl flex-wrap items-center gap-4 rounded-xl border border-black/10 bg-white p-4 text-[14px] leading-relaxed text-slate-800 shadow-2xl"
    >
      <p className="min-w-[260px] flex-1">
        Usamos cookies para medir o resultado dos nossos anúncios (Google e Meta). Você pode aceitar ou
        recusar; o site funciona do mesmo jeito.{" "}
        <a href="/privacidade" className="underline">
          Saiba mais
        </a>
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => gravarEscolha("recusado")}
          className="min-h-11 rounded-lg border border-slate-400 px-4 font-semibold"
        >
          Recusar
        </button>
        <button
          type="button"
          onClick={() => gravarEscolha("aceito")}
          className="min-h-11 rounded-lg bg-[#0a2a5c] px-4 font-semibold text-white"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}

// Botao da pagina de privacidade para o visitante mudar de ideia.
export function ReverCookies() {
  return (
    <button type="button" onClick={() => gravarEscolha(null)} className="underline">
      Rever minha escolha de cookies
    </button>
  );
}

export default function Rastreamento() {
  const escolha = useEscolha();
  // O site antigo recarregava a pagina a cada clique; aqui a navegacao e pelo
  // Next, entao o PageView da Meta e disparado de novo a cada troca de pagina.
  const pathname = usePathname();
  const primeira = useRef(true);
  useEffect(() => {
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    if (escolha === "aceito") window.fbq?.("track", "PageView");
  }, [pathname, escolha]);

  if (escolha === null) return <AvisoCookies />;
  if (escolha !== "aceito") return null;

  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
