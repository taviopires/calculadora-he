/** @type {import('next').NextConfig} */

const { REPO_NAME } = require("./site.config.js");

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
