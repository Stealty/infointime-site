import Link from "next/link";
import Image, { getImageProps } from "next/image";
import type { Slide } from "./HeroCarousel";
import { IconeCaixa, IconeCaminhao, IconeTelefone, IconeWhatsApp } from "./Icones";
import { linkWhatsApp, type Banner } from "@/lib/site";

// Os 3 banners fixos do topo da home. As fotos ficam em /public/banners (fotos do
// catalogo recortadas; processador, notebook e impressora laser sao desenhos, porque
// o catalogo nao tem foto deles). A loja ainda pode subir banners de imagem no /admin:
// eles entram depois destes.

// Mesma altura em todos os slides, para o carrossel nao pular. O pb deixa espaco para
// a faixa de vantagens, que sobe 56px por cima do banner (-mt-14 na home).
const SLIDE = "relative h-[620px] overflow-hidden sm:h-[600px] lg:h-[560px]";
const MIOLO = "mx-auto h-full max-w-7xl px-4 pb-24 md:px-16 xl:px-4";

function Cartao({
  src,
  alt = "",
  className = "",
  tamanho = 192,
  atraso,
}: {
  src: string;
  alt?: string;
  className?: string;
  tamanho?: number;
  atraso?: number;
}) {
  return (
    <div
      style={atraso ? { animationDelay: `${atraso}ms` } : undefined}
      className={`rounded-2xl bg-white p-2 shadow-[0_24px_50px_-18px_rgb(0_0_0/0.55)] sm:rounded-3xl sm:p-4 ${className}`}>
      <Image src={src} alt={alt} width={256} height={256} sizes={`${tamanho}px`} className="size-full object-contain" />
    </div>
  );
}

function SlideProdutos() {
  const fotos = [
    { src: "/banners/placa-de-video.webp", alt: "Placa de vídeo", pos: "left-[6%] top-[2%] rotate-[-6deg]" },
    { src: "/banners/roteador.webp", alt: "Roteador Wi-Fi", pos: "right-[2%] top-[10%] rotate-[5deg]" },
    { src: "/banners/ssd.webp", alt: "SSD", pos: "left-[18%] bottom-[0%] rotate-[3deg]" },
    { src: "/banners/processador.webp", alt: "Processador", pos: "right-[14%] bottom-[6%] rotate-[-4deg]" },
  ];
  return (
    <div className={`fundo-marca text-white ${SLIDE}`}>
      <div className={`${MIOLO} grid content-center items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12`}>
        <div>
          <span className="faixa-curta" />
          <h1 className="mt-5 text-[36px] font-extrabold leading-[1.05] sm:text-6xl lg:mt-6 lg:text-[64px]">
            A maior loja de informática do Sul Fluminense
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg lg:mt-6">
            Produtos, tintas e toners, e manutenção de notebooks, computadores e impressoras. Há 30 anos atendendo de perto.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-9">
            <Link href="/produtos" className="button button--lg button--danger">
              Ver produtos em estoque
            </Link>
            <Link href="/assistencia-tecnica" className="button button--lg button--vidro">
              Assistência técnica
            </Link>
          </div>
          {/* Celular e tablet: as 4 fotos numa fileira embaixo do texto. */}
          <div className="mt-7 grid max-w-md grid-cols-4 gap-2.5 lg:hidden" aria-hidden>
            {fotos.map((f, i) => (
              <Cartao key={f.src} src={f.src} tamanho={96} className={`aspect-square ${i % 2 ? "rotate-[3deg]" : "rotate-[-3deg]"}`} />
            ))}
          </div>
        </div>
        <div className="relative hidden h-[420px] lg:block" aria-hidden>
          {fotos.map((f, i) => (
            <Cartao key={f.src} src={f.src} atraso={300 + i * 110} className={`animate-sobe absolute size-48 ${f.pos}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Painel({
  cor,
  selo,
  titulo,
  texto,
  itens,
  fotos,
  acao,
}: {
  cor: string;
  selo: string;
  titulo: string;
  texto: string;
  itens: string[];
  fotos: { src: string; alt: string; className: string }[];
  acao: { href: string; texto: string; zap?: boolean };
}) {
  return (
    <article className={`relative flex min-h-0 overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/10 ${cor}`}>
      <div className="relative z-10 flex w-[58%] flex-col justify-center p-4 sm:w-[55%] sm:p-7 lg:p-8">
        <span className="w-fit rounded-full bg-amarelo px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-marinho sm:text-xs">
          {selo}
        </span>
        <h2 className="mt-2 text-[22px] font-extrabold leading-[1.05] sm:mt-3 sm:text-[34px] lg:text-[40px]">{titulo}</h2>
        <p className="mt-1.5 text-[13px] leading-snug text-white/85 sm:mt-3 sm:text-base">{texto}</p>
        <ul className="mt-4 hidden flex-wrap gap-1.5 lg:flex">
          {itens.map((i) => (
            <li key={i} className="rounded-full bg-white/12 px-3 py-1 text-sm font-semibold ring-1 ring-white/20">
              {i}
            </li>
          ))}
        </ul>
        <a
          href={acao.href}
          {...(acao.zap ? { "data-escolher-loja": "", target: "_blank", rel: "noopener" } : {})}
          className="button button--sm button--claro mt-3 w-fit sm:mt-4 lg:mt-6"
        >
          {acao.zap ? <IconeWhatsApp className="size-4" /> : null}
          {acao.texto}
        </a>
      </div>
      <div className="absolute inset-y-0 right-0 w-[48%]" aria-hidden>
        {fotos.map((f) => (
          <Cartao key={f.src} src={f.src} tamanho={176} className={`absolute ${f.className}`} />
        ))}
      </div>
    </article>
  );
}

function SlideManutencao({ whatsapp }: { whatsapp: string }) {
  return (
    <div className={`bg-marinho-escuro text-white ${SLIDE}`}>
      <div className={`${MIOLO} grid grid-rows-2 gap-3 pt-4 sm:gap-4 sm:pt-6 lg:grid-cols-2 lg:grid-rows-1 lg:pt-8`}>
        <Painel
          cor="bg-[radial-gradient(28rem_20rem_at_100%_0%,rgb(255_198_26/0.35),transparent_60%),linear-gradient(135deg,#e02b20,#a8170f)]"
          selo="Manutenção"
          titulo="Impressoras"
          texto="Consertamos Epson tanque de tinta e impressoras laser monocromáticas."
          itens={["Epson EcoTank", "Laser mono", "Limpeza e revisão"]}
          fotos={[
            { src: "/banners/impressora-tanque.webp", alt: "Impressora Epson tanque de tinta", className: "right-[6%] top-[10%] size-28 rotate-[4deg] sm:size-36 lg:top-[14%] lg:size-48" },
            { src: "/banners/impressora-laser.webp", alt: "Impressora laser monocromática", className: "bottom-[8%] left-[2%] size-24 rotate-[-5deg] sm:size-28 lg:bottom-[12%] lg:size-40" },
          ]}
          acao={{
            href: linkWhatsApp(whatsapp, "Olá! Preciso de manutenção na minha impressora."),
            texto: "Pedir orçamento",
            zap: true,
          }}
        />
        <Painel
          cor="bg-[radial-gradient(28rem_20rem_at_100%_0%,rgb(46_163_242/0.45),transparent_60%),linear-gradient(135deg,#0c4da2,#0a2a5c)]"
          selo="Manutenção"
          titulo="Computadores, notebooks e nobreaks"
          texto="Diagnóstico, reparo e limpeza com a equipe da loja."
          itens={["Computador", "Notebook", "Nobreak"]}
          fotos={[
            { src: "/banners/notebook.webp", alt: "Notebook", className: "right-[4%] top-[6%] size-28 rotate-[5deg] sm:size-32 lg:size-44" },
            { src: "/banners/gabinete.webp", alt: "Computador", className: "bottom-[6%] left-[6%] size-20 rotate-[-6deg] sm:size-24 lg:bottom-[10%] lg:size-36" },
            { src: "/banners/nobreak.webp", alt: "Nobreak", className: "bottom-[4%] right-[8%] size-20 rotate-[3deg] sm:size-24 lg:bottom-[8%] lg:size-32" },
          ]}
          acao={{ href: "/assistencia-tecnica", texto: "Ver assistência" }}
        />
      </div>
    </div>
  );
}

function SlideEntrega({ whatsapp }: { whatsapp: string }) {
  const passos = [
    { icone: IconeTelefone, titulo: "Ligou", texto: "Chama no WhatsApp ou liga para a loja" },
    { icone: IconeCaixa, titulo: "Pediu", texto: "A gente separa e confere o seu pedido" },
    { icone: IconeCaminhao, titulo: "Chegou", texto: "Entrega rápida em VR, Barra Mansa, Pinheiral e Arrozal" },
  ];
  const cores = ["text-vermelho", "text-amarelo", "text-azul-claro"];
  return (
    <div className={`fundo-marca text-white ${SLIDE}`}>
      <div className={`${MIOLO} grid content-center items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12`}>
        <div>
          <span className="faixa-curta" />
          <h2 className="mt-5 text-[40px] font-extrabold leading-[1.02] sm:text-6xl lg:text-[64px]">
            {["Ligou,", "pediu,", "chegou."].map((p, i) => (
              <span key={p} className={`${cores[i]} mr-3 inline-block`}>
                {p}
              </span>
            ))}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            Pediu, a Info In Time leva. Sem sair de casa e sem complicação.
          </p>
          <ol className="mt-6 grid max-w-xl gap-2.5 sm:grid-cols-3 sm:gap-3">
            {passos.map((p, i) => (
              <li key={p.titulo} className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/15 sm:flex-col sm:items-start sm:p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-azul">
                  <p.icone className="size-5" />
                </span>
                <span>
                  <span className={`block font-extrabold ${cores[i]}`}>
                    {i + 1}. {p.titulo}
                  </span>
                  <span className="block text-sm leading-snug text-white/75">{p.texto}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              data-escolher-loja=""
              href={linkWhatsApp(whatsapp, "Olá! Quero fazer um pedido para entrega.")}
              target="_blank"
              rel="noopener"
              className="button button--lg button--zap"
            >
              <IconeWhatsApp /> Pedir pelo WhatsApp
            </a>
          </div>
        </div>

        <div className="relative hidden h-[420px] lg:block" aria-hidden>
          <div className="absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.06] ring-1 ring-white/15" />
          <div className="absolute left-1/2 top-1/2 size-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.08]" />
          <div className="absolute left-1/2 top-1/2 flex size-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amarelo text-marinho shadow-[0_24px_50px_-18px_rgb(0_0_0/0.6)]">
            <IconeCaminhao className="size-20" />
          </div>
          <div className="absolute left-[8%] top-1/2 flex -translate-y-1/2 flex-col gap-3">
            <span className="h-1.5 w-24 rounded-full bg-vermelho" />
            <span className="ml-6 h-1.5 w-16 rounded-full bg-amarelo" />
            <span className="ml-2 h-1.5 w-20 rounded-full bg-azul-claro" />
          </div>
          <Cartao src="/banners/ssd.webp" tamanho={144} className="absolute right-[6%] top-[4%] size-36 rotate-[6deg]" />
          <Cartao src="/banners/roteador.webp" tamanho={144} className="absolute bottom-[2%] right-[14%] size-36 rotate-[-5deg]" />
          <Cartao src="/banners/impressora-tanque.webp" tamanho={144} className="absolute left-[10%] top-[2%] size-32 rotate-[-6deg]" />
        </div>
      </div>
    </div>
  );
}

// Banner de imagem subido no /admin (desktop 1920x600, celular 1080x1080).
function SlideImagem({ b }: { b: Banner }) {
  const alt = b.titulo || "Promoção Info In Time";
  const comum = { alt, loading: "lazy" as const };
  const { props: desktop } = getImageProps({ ...comum, src: b.imagem_desktop, width: 1920, height: 600, sizes: "100vw" });
  const mobile = b.imagem_mobile
    ? getImageProps({ ...comum, src: b.imagem_mobile, width: 1080, height: 1080, sizes: "100vw" }).props
    : null;
  const img = (
    <picture>
      {mobile ? <source media="(max-width: 640px)" srcSet={mobile.srcSet} sizes="100vw" /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...desktop} className="block size-full object-contain sm:object-cover" />
    </picture>
  );
  return (
    <div className={`fundo-marca ${SLIDE} pb-14`}>
      {b.link ? (
        <a href={b.link} className="block size-full">
          {img}
        </a>
      ) : (
        img
      )}
    </div>
  );
}

export function slidesDaHome(banners: Banner[], whatsapp: string): Slide[] {
  return [
    { id: "produtos", nome: "Produtos de informática", conteudo: <SlideProdutos /> },
    { id: "manutencao", nome: "Manutenção de impressoras, computadores, notebooks e nobreaks", conteudo: <SlideManutencao whatsapp={whatsapp} /> },
    { id: "entrega", nome: "Ligou, pediu, chegou", conteudo: <SlideEntrega whatsapp={whatsapp} /> },
    ...banners.map((b) => ({ id: `banner-${b.id}`, nome: b.titulo || "Promoção", conteudo: <SlideImagem b={b} /> })),
  ];
}
