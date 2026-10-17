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
      <section className="bg-marinho text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <span className="faixa-curta" />
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold sm:text-6xl">Assistência técnica de informática</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            Manutenção de impressoras, notebooks, computadores e nobreaks, com a experiência de 30 anos atendendo o Sul Fluminense.
          </p>
          <a
            href={zap}
            target="_blank"
            rel="noopener"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1fa855] px-6 py-4 text-lg font-bold hover:brightness-110"
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
              <article key={s.nome} className="rounded-cartao border border-linha bg-white p-6">
                <div className="flex size-14 items-center justify-center rounded-full bg-fundo text-azul">
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

        <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="text-3xl font-extrabold text-marinho">Como funciona</h2>
            <p className="mt-3 max-w-md text-suave">
              Sem diagnóstico por telefone: o técnico precisa ver o equipamento para dizer o que tem e quanto custa.
            </p>
          </div>
          <ol className="space-y-3">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="flex gap-4 rounded-cartao border border-linha bg-white p-5">
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

        <section className="mt-14 rounded-cartao bg-azul p-6 text-white sm:p-10">
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
              <a href={zap} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-azul hover:bg-amarelo hover:text-marinho">
                <IconeWhatsApp /> Falar com a equipe
              </a>
              <Link href="/produtos" className="rounded-full px-6 py-3 font-bold ring-1 ring-white/40 hover:bg-white/10">
                Peças e suprimentos
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
