import Link from "next/link";
import { IconeSeta } from "./Icones";

export default function SecaoTitulo({ titulo, link }: { titulo: string; link?: { href: string; texto: string } }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <span className="faixa-curta" />
        <h2 className="mt-2 text-3xl font-extrabold text-marinho">{titulo}</h2>
      </div>
      {link ? (
        <Link href={link.href} className="flex shrink-0 items-center gap-1 text-[15px] font-semibold text-azul hover:underline">
          {link.texto}
          <IconeSeta className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
