import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { REPO_NAME } = require("../site.config.js");

// O favicon (diferente das imagens usadas via next/image) não recebe o
// prefixo do basePath automaticamente, então montamos o caminho à mão,
// usando o mesmo REPO_NAME do next.config.js.
const faviconPath = REPO_NAME ? `/${REPO_NAME}/logo-icon.png` : "/logo-icon.png";

export const metadata: Metadata = {
  title: "Holerite Extra — Calculadora de Horas Extras",
  description: "Registre seu ponto, calcule horas extras e confira Espelho x Holerite.",
  icons: { icon: faviconPath },
};

// As fontes são carregadas via <link> (em vez de next/font/google) para que o
// build funcione mesmo em ambientes sem acesso à internet no momento do build
// (Docker atrás de proxy, CI restrito, etc). Troque por next/font/google se
// preferir, quando o ambiente de build tiver acesso à rede.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-paper text-ink min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
