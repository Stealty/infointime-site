import type { Metadata } from "next";
import Link from "next/link";
import { getConteudo } from "@/lib/site";
import { LOJAS } from "@/lib/lojas";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Nossa história",
  description: "A história da Info In Time, loja de informática de família no Sul Fluminense há 30 anos.",
};

export default async function NossaHistoria() {
  const c = await getConteudo();
  const paragrafos = c.historia_texto
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <figure className="overflow-hidden rounded-cartao bg-white shadow-suave ring-1 ring-linha/70">
          {c.foto_familia_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.foto_familia_url} alt="A família Info In Time" className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 fundo-marca text-white">
              <span className="text-8xl font-extrabold estreito">30</span>
              <span className="text-white/70">anos de Info In Time</span>
            </div>
          )}
          <div className="faixa-logo" />
        </figure>

        <div>
          <span className="faixa-curta" />
          <h1 className="mt-4 text-4xl font-extrabold text-marinho sm:text-5xl">{c.historia_titulo}</h1>
          <div className="mt-6 max-w-[62ch] space-y-4 text-lg leading-relaxed text-texto/90">
            {paragrafos.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-14 grid gap-4 sm:grid-cols-3">
        <div className="fundo-marca rounded-cartao p-6 text-white shadow-alta">
          <p className="text-5xl font-extrabold estreito text-amarelo">30 anos</p>
          <p className="mt-2 text-white/80">atendendo o Sul Fluminense</p>
        </div>
        <div className="rounded-cartao bg-azul p-6 text-white shadow-alta">
          <p className="text-5xl font-extrabold estreito">{LOJAS.length} lojas</p>
          <p className="mt-2 text-white/80">{LOJAS.map((l) => l.nome).join(", ").replace(/, ([^,]*)$/, " e $1")}</p>
        </div>
        <Link href="/produtos" className="group rounded-cartao bg-white shadow-suave ring-1 ring-linha/70 p-6 transition-all hover:-translate-y-0.5 hover:shadow-alta">
          <p className="text-5xl font-extrabold estreito text-vermelho">Venha conhecer</p>
          <p className="mt-2 text-suave group-hover:text-azul">Veja o que temos em estoque hoje</p>
        </Link>
      </section>
    </div>
  );
}
