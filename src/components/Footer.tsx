import Link from "next/link";
import { HORARIO, LOJAS, REDES } from "@/lib/lojas";
import { IconeFacebook, IconeInstagram } from "./Icones";

export default function Footer() {
  return (
    <footer className="fundo-marca mt-20 text-white/80">
      <div className="faixa-logo" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-2xl font-extrabold estreito text-white">Info In Time</p>
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed">
            Loja de informática do Sul Fluminense há 30 anos. Produtos, suprimentos e assistência técnica.
          </p>
          <div className="mt-4 flex gap-2">
            <a href={REDES.instagram} target="_blank" rel="noopener" className="flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Instagram da Info In Time">
              <IconeInstagram />
            </a>
            <a href={REDES.facebook} target="_blank" rel="noopener" className="flex size-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Facebook da Info In Time">
              <IconeFacebook />
            </a>
          </div>
        </div>

        <div>
          <p className="font-bold text-white">Navegue</p>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li><Link href="/produtos" className="hover:text-white">Produtos</Link></li>
            <li><Link href="/assistencia-tecnica" className="hover:text-white">Assistência técnica</Link></li>
            <li><Link href="/nossa-historia" className="hover:text-white">Nossa história</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-bold text-white">Lojas</p>
          <ul className="mt-3 space-y-3 text-[15px]">
            {LOJAS.map((l) => (
              <li key={l.nome}>
                <span className="text-white">{l.nome}</span>
                <br />
                {l.endereco}
                {l.telefone ? (
                  <>
                    <br />
                    {l.telefone}
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-bold text-white">Horário</p>
          <ul className="mt-3 space-y-1 text-[15px]">
            {HORARIO.map((h) => (
              <li key={h.dias}>
                {h.dias}: {h.horas}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-white/60">
            Preços e estoque podem mudar ao longo do dia. Confirme pelo WhatsApp antes de ir à loja.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-white/50">
        © {new Date().getFullYear()} Info In Time
      </div>
    </footer>
  );
}
