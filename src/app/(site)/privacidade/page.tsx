import type { Metadata } from "next";
import { ReverCookies } from "@/components/Rastreamento";

export const metadata: Metadata = {
  title: "Privacidade e cookies",
  description: "Como o site da Info In Time usa cookies e trata dados de quem visita.",
};

// Texto factual sobre o que o site faz. Revisar com a loja antes de publicar mudancas de conteudo.
export default function PrivacidadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-[16px] leading-relaxed text-slate-800">
      <h1 className="estreito text-3xl font-extrabold text-[#0a2a5c]">Privacidade e cookies</h1>

      <h2 className="mt-8 text-xl font-bold">O que este site coleta</h2>
      <p className="mt-3">
        O site da Info In Time mostra produtos, serviços e os contatos das lojas. Ele não tem cadastro e
        não pede dados pessoais: a busca só procura produtos e, quando você escolhe uma loja, é levado ao
        WhatsApp, onde a conversa acontece.
      </p>

      <h2 className="mt-8 text-xl font-bold">Cookies de publicidade e medição</h2>
      <p className="mt-3">
        Com a sua permissão, o site carrega o Google Tag Manager (Google Ads e remarketing) e o pixel da
        Meta. Eles guardam cookies no seu navegador para medir o resultado dos nossos anúncios e mostrar
        anúncios da loja para quem já visitou o site.
      </p>
      <p className="mt-3">
        Esses cookies só são carregados se você clicar em Aceitar no aviso. Se recusar, nada é enviado a
        essas empresas e o site funciona do mesmo jeito. A escolha fica guardada no seu navegador.
      </p>
      <p className="mt-3">
        <ReverCookies />
      </p>

      <h2 className="mt-8 text-xl font-bold">Seus direitos</h2>
      <p className="mt-3">
        Pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018) você pode pedir informações sobre o
        tratamento dos seus dados, a correção ou a exclusão. Fale com qualquer uma das nossas lojas pelos
        contatos no rodapé.
      </p>
    </div>
  );
}
