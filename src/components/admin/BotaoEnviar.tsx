"use client";

import { useFormStatus } from "react-dom";

export default function BotaoEnviar({
  children,
  pendente = "Salvando...",
  confirmar,
  variante = "primario",
}: {
  children: React.ReactNode;
  pendente?: string;
  confirmar?: string;
  variante?: "primario" | "secundario" | "perigo";
}) {
  const { pending } = useFormStatus();
  const estilos = {
    primario: "bg-azul text-white hover:brightness-110",
    secundario: "bg-white text-texto ring-1 ring-linha hover:ring-azul",
    perigo: "bg-white text-vermelho ring-1 ring-linha hover:bg-vermelho hover:text-white",
  }[variante];
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
      className={`rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-60 ${estilos}`}
    >
      {pending ? pendente : children}
    </button>
  );
}
