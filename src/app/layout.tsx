import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Archivo (SIL Open Font License) servida pelo proprio site, recortada para o que o layout usa:
// peso 400-800, largura 75-100% (classes .estreito e titulos) e caracteres latinos.
// 52 KB contra 90 KB da versao completa do Google Fonts.
const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  weight: "400 800",
  style: "normal",
  display: "swap",
  variable: "--font-archivo",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://infointime.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Info In Time | Loja de informática em Volta Redonda e Barra Mansa",
    template: "%s | Info In Time",
  },
  description:
    "Há 30 anos no Sul Fluminense: produtos de informática, tintas e toners, e manutenção de notebooks, computadores e impressoras em Volta Redonda, Barra Mansa e Arrozal.",
  openGraph: { locale: "pt_BR", type: "website", siteName: "Info In Time" },
};

export const viewport: Viewport = {
  themeColor: "#0a2a5c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
