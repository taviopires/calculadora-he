// eslint-disable-next-line @typescript-eslint/no-var-requires
const { REPO_NAME } = require("../site.config.js");

export const BASE_PATH = REPO_NAME ? `/${REPO_NAME}` : "";

/**
 * Monta o caminho de um arquivo estático (pasta public/) já incluindo o
 * prefixo do GitHub Pages (ex.: "/calculadora-he"). Usado com <img> simples
 * em vez de next/image, porque o next/image não aplica esse prefixo de
 * forma confiável quando o site é exportado como estático.
 */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
