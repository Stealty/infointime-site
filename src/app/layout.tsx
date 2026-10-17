import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
