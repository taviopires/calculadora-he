import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Fundo levemente azulado, para combinar com a paleta fria abaixo
        // (em vez do papel creme/âmbar da versão anterior).
        paper: "#F5F8FD",
        ink: {
          DEFAULT: "#11163A",
          light: "#3A4070",
          faint: "#848ABA",
        },
        // Azul principal da paleta (#0065F8) — ações primárias, links.
        steel: {
          DEFAULT: "#0065F8",
          dark: "#0050C6",
        },
        // Violeta-azul mais intenso da paleta (#4300FF) — segundo acento,
        // usado com moderação (selo de domingo/feriado, detalhes de marca).
        stamp: {
          DEFAULT: "#4300FF",
          light: "#E7DDFF",
        },
        // Dois tons extras da paleta, para o degradê de destaque e detalhes
        // pontuais (nunca como cor de texto corrido, só construído com cuidado).
        cyan: "#00CAFF",
        mint: "#00FFDE",
        ledger: {
          green: "#00806B",
          greenBg: "#E1FBF3",
          red: "#D6275C",
          redBg: "#FCE4EC",
        },
        line: "#DEE6F5",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        // O degradê da paleta — reservado para um único momento de destaque
        // (tela de login), não usado como decoração espalhada pelo app.
        "brand-gradient": "linear-gradient(135deg, #4300FF 0%, #0065F8 38%, #00CAFF 72%, #00FFDE 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
