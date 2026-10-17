import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sessaoValida } from "@/lib/auth";
import FormLogin from "./FormLogin";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false } };

export default async function Login() {
  if (await sessaoValida()) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-marinho px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-cartao bg-white shadow-2xl">
        <div className="faixa-logo" />
        <div className="p-7">
          <h1 className="text-3xl font-extrabold text-marinho">Painel do site</h1>
          <p className="mt-1 text-suave">Info In Time</p>
          <FormLogin />
        </div>
      </div>
    </main>
  );
}
