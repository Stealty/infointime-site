"use client";

import { useActionState } from "react";
import { entrar } from "../actions";

export default function FormLogin() {
  const [estado, acao, pendente] = useActionState(entrar, undefined);
  return (
    <form action={acao} className="mt-6 space-y-4">
      <label className="block font-semibold">
        Usuário
        <input
          name="usuario"
          key={estado?.usuario ?? ""}
          defaultValue={estado?.usuario ?? ""}
          autoComplete="username"
          required
          className="mt-1.5 block h-11 w-full rounded-md border border-linha px-3 font-normal focus:border-azul focus:outline-none"
        />
      </label>
      <label className="block font-semibold">
        Senha
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 block h-11 w-full rounded-md border border-linha px-3 font-normal focus:border-azul focus:outline-none"
        />
      </label>
      {estado?.erro ? <p className="text-sm font-medium text-vermelho" role="alert">{estado.erro}</p> : null}
      <button
        type="submit"
        disabled={pendente}
        className="h-11 w-full rounded-full bg-azul font-bold text-white hover:brightness-110 disabled:opacity-60"
      >
        {pendente ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
