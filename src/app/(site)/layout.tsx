import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EscolherLoja from "@/components/EscolherLoja";
import { GavetaCarrinho } from "@/components/carrinho/Carrinho";
import Rastreamento from "@/components/Rastreamento";
import Metricas from "@/components/Metricas";
import AlturaMapa from "@/components/AlturaMapa";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="overflow-x-clip">{children}</main>
      <Footer />
      <GavetaCarrinho />
      <EscolherLoja />
      <Rastreamento />
      <Metricas />
      <AlturaMapa />
    </>
  );
}
