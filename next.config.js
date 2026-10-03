/** @type {import('next').NextConfig} */

// Nome do repositório no GitHub — usado para montar a URL
// https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
// Se você renomear o repositório, atualize esse valor.
// Se configurar um domínio próprio (CNAME) no GitHub Pages, troque para "".
const REPO_NAME = "calculadora-he";

const nextConfig = {
  // Gera um site 100% estático (pasta "out/"), sem nenhum servidor Next.js
  // por trás — necessário para hospedar no GitHub Pages.
  output: "export",
  basePath: REPO_NAME ? `/${REPO_NAME}` : "",
  images: { unoptimized: true },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
