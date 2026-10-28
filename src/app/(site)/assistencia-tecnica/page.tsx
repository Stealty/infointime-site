import type { Metadata } from "next";
import Link from "next/link";
import { getConteudo, linkWhatsApp } from "@/lib/site";
import { LOJAS } from "@/lib/lojas";
import { IconeBateria, IconeComputador, IconeImpressora, IconeNotebook, IconeWhatsApp } from "@/components/Icones";

export const metadata: Metadata = {
  title: "Assistência técnica",
  description:
    "Manutenção de impressoras, notebooks, computadores e nobreaks em Volta Redonda e Barra Mansa. Fale com a equipe técnica da Info In Time.",
};

const SERVICOS = [
  {
    icone: IconeImpressora,
    nome: "Impressoras",
    texto: "Jato de tinta, tanque de tinta e laser. Falha na impressão, papel enroscando, manchas, cores faltando.",
  },
  {
    icone: IconeNotebook,
    nome: "Notebooks",
    texto: "Lentidão, tela, teclado, carregador, formatação e troca por SSD ou mais memória.",
  },
  {
    icone: IconeComputador,
    nome: "Computadores",
    texto: "Montagem, upgrade, limpeza, formatação e PCs gamer.",
  },
  {
    icone: IconeBateria,
    nome: "Nobreaks",
    texto: "Nobreak que não segura carga, apita ou desliga sozinho.",
  },
];

const ESPECIALIDADES = [
  {
    imagem: "/manutencao/placa-mae-notebook.webp",
    alt: "Reparo na placa-mãe de notebook: diagnóstico avançado, soldagem de precisão e teste de componentes",
    botao: "Orçar reparo na placa",
    mensagem: "Olá! Quero um orçamento de reparo na placa-mãe do meu notebook. Modelo: ",
  },
  {
    imagem: "/manutencao/tela-notebook.webp",
    alt: "Troca de tela de notebook: serviço especializado, rápido e com qualidade garantida",
    botao: "Orçar troca de tela",
    mensagem: "Olá! Quero um orçamento de troca de tela do meu notebook. Modelo: ",
  },
];

const PASSOS = [
  { titulo: "Conte o que está acontecendo", texto: "Pelo WhatsApp ou direto no balcão de uma das lojas." },
  { titulo: "A equipe técnica avalia", texto: "O técnico examina o equipamento e explica o que precisa ser feito." },
  { titulo: "Serviço e retirada", texto: "Com o serviço combinado, avisamos quando o equipamento estiver pronto." },
];

export default async function Assistencia() {
  const conteudo = await getConteudo();
  const zap = linkWhatsApp(conteudo.whatsapp, "Olá! Preciso de manutenção. O problema é: ");

  return (
    <>
      <section className="fundo-marca text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <span className="faixa-curta" />
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold sm:text-6xl">Assistência técnica de informática</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            Manutenção de impressoras, notebooks, computadores e nobreaks, com a experiência de 30 anos atendendo o Sul Fluminense.
          </p>
          <a
            data-escolher-loja="" href={zap}
            target="_blank"
            rel="noopener"
            className="button button--lg button--zap mt-8 h-14 px-8 text-lg"
          >
            <IconeWhatsApp /> Descrever o problema
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        <section className="mt-12">
          <h2 className="text-3xl font-extrabold text-marinho">O que a gente conserta</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICOS.map((s) => (
              <article key={s.nome} className="rounded-cartao bg-white shadow-suave ring-1 ring-linha/70 p-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-azul/8 text-azul">
                  <s.icone className="size-7" />
                </div>
                <h3 className="mt-4 text-2xl font-extrabold text-marinho">{s.nome}</h3>
                <p className="mt-2 text-suave">{s.texto}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 text-suave">
            Seu caso não está aqui? Descreva no WhatsApp: quem decide se dá para consertar é a equipe técnica, depois de ver o equipamento.
          </p>
        </section>

        <section className="fundo-marca mt-14 overflow-hidden rounded-3xl text-white shadow-alta">
          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.5fr] lg:items-center">
            <div>
              <span className="faixa-curta" />
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Especialistas em notebook</h2>
              <p className="mt-3 max-w-md text-white/80">
                Do reparo na placa-mãe à troca de tela, com diagnóstico de bancada e garantia no serviço. Atendemos Dell, Lenovo, Asus, HP, Acer, Samsung e outras marcas.
              </p>
            </div>
            <div className="scroll-x -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
              {ESPECIALIDADES.map((e) => (
                <article key={e.imagem} className="w-[78%] shrink-0 snap-center sm:w-[44%] lg:w-auto">
                  <div className="overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-alta transition-transform duration-500 hover:-translate-y-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={e.imagem} alt={e.alt} width={714} height={1162} loading="lazy" className="block h-auto w-full" />
                  </div>
                  <a
                    data-escolher-loja=""
                    href={linkWhatsApp(conteudo.whatsapp, e.mensagem)}
                    target="_blank"
                    rel="noopener"
                    className="button button--zap button--full-width mt-3"
                  >
                    <IconeWhatsApp /> {e.botao}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="text-3xl font-extrabold text-marinho">Como funciona</h2>
            <p className="mt-3 max-w-md text-suave">
              Sem diagnóstico por telefone: o técnico precisa ver o equipamento para dizer o que tem e quanto custa.
            </p>
          </div>
          <ol className="space-y-3">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="flex gap-4 rounded-cartao bg-white shadow-suave ring-1 ring-linha/70 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-azul text-lg font-extrabold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-marinho">{p.titulo}</h3>
                  <p className="mt-1 text-suave">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="fundo-marca mt-16 rounded-3xl p-6 text-white shadow-alta sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold">Onde deixar o equipamento</h2>
              <ul className="mt-4 space-y-2 text-white/85">
                {LOJAS.map((l) => (
                  <li key={l.nome}>
                    <strong className="text-white">{l.nome}:</strong> {l.endereco}, {l.cidade}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <a data-escolher-loja="" href={zap} target="_blank" rel="noopener" className="button button--lg button--claro">
                <IconeWhatsApp /> Falar com a equipe
              </a>
              <Link href="/produtos" className="button button--lg button--vidro">
                Peças e suprimentos
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
