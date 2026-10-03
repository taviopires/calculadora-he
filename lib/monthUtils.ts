const NOMES_MES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/** "YYYY-MM" -> "Junho/2022" */
export function mesLabel(mes: string): string {
  const [ano, mesNum] = mes.split("-").map((n) => parseInt(n, 10));
  const nome = NOMES_MES[(mesNum ?? 1) - 1] ?? mes;
  return `${nome}/${ano}`;
}

export function mesAnterior(mes: string): string {
  const [ano, mesNum] = mes.split("-").map((n) => parseInt(n, 10));
  const d = new Date(Date.UTC(ano, mesNum - 1, 1));
  d.setUTCMonth(d.getUTCMonth() - 1);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function compareMes(a: string, b: string): number {
  return a.localeCompare(b);
}

export function mesAtual(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
