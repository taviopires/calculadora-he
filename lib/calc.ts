import { CATEGORIAS, Categoria, ComparisonRow, EntryHours, Settings, TimeEntry } from "./types";

const VINTE_E_DUAS_HORAS = 22 * 60; // 1320 — início do período noturno (22h)

/** "HH:MM" -> minutos desde 00:00. String vazia/inválida -> null */
export function timeToMinutes(hhmm: string | null | undefined): number | null {
  if (!hhmm) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 47 || min > 59) return null;
  return h * 60 + min;
}

export function minutesToHHMM(totalMinutes: number): string {
  const sign = totalMinutes < 0 ? "-" : "";
  const abs = Math.round(Math.abs(totalMinutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h}:${String(m).padStart(2, "0")}`;
}

export function decimalToHHMM(decimalHoras: number): string {
  return minutesToHHMM(decimalHoras * 60);
}

function overlapMinutes(aStart: number | null, aEnd: number | null, bStart: number, bEnd: number): number {
  if (aStart === null || aEnd === null) return 0;
  const start = Math.max(aStart, bStart);
  const end = Math.min(aEnd, bEnd);
  return Math.max(0, end - start);
}

/**
 * Calcula as horas de um lançamento, divididas em "antes das 22h" (categoria
 * 50%/100%, dependendo do tipo do dia) e "das 22h em diante" (categoria
 * 70%/120%, com o adicional noturno de 20%).
 *
 * O período trabalhado é tratado como um intervalo contínuo entre ENTRADA e
 * SAÍDA:
 *  - Se o horário de SAÍDA for menor ou igual ao de ENTRADA, o turno
 *    atravessou a virada do dia (ex.: entra 20:49, sai 6:01 do dia seguinte;
 *    ou um turno de 24h exatas, como entra 6h, sai 6h do dia seguinte).
 *  - Se for maior, o turno começou e terminou no mesmo dia (ex.: hora extra
 *    só durante o dia, sem entrar na madrugada).
 * A pausa (início/final PL) é subtraída exatamente do trecho (diurno ou
 * noturno) em que ela realmente ocorreu.
 */
export function computeEntryHours(entry: Pick<TimeEntry, "tipo" | "entrada" | "saida" | "inicioPl" | "finalPl">): EntryHours {
  const zero: EntryHours = { he50: 0, he70: 0, he100: 0, he120: 0 };

  const entradaAbs = timeToMinutes(entry.entrada);
  const saidaMin = timeToMinutes(entry.saida);
  if (entradaAbs === null || saidaMin === null) return zero;

  // Se a saída (horário do relógio) for <= entrada, o turno cruzou a
  // meia-noite; representamos a saída em minutos "absolutos" contínuos a
  // partir da entrada (podendo passar de 1440).
  const saidaAbs = saidaMin <= entradaAbs ? saidaMin + 1440 : saidaMin;

  // Localiza a pausa no mesmo eixo contínuo, ancorada ao dia da entrada.
  const inicioPlLocal = timeToMinutes(entry.inicioPl);
  const finalPlLocal = timeToMinutes(entry.finalPl);
  let pausaInicioAbs: number | null = null;
  let pausaFimAbs: number | null = null;
  if (inicioPlLocal !== null && finalPlLocal !== null) {
    pausaInicioAbs = inicioPlLocal >= entradaAbs ? inicioPlLocal : inicioPlLocal + 1440;
    const diaBasePausa = Math.floor(pausaInicioAbs / 1440) * 1440;
    pausaFimAbs = diaBasePausa + finalPlLocal;
    if (pausaFimAbs < pausaInicioAbs) pausaFimAbs += 1440;
  }

  // Limite do período noturno: as 22h do dia da entrada.
  const limiteNoturno = VINTE_E_DUAS_HORAS;

  const diurnoInicio = entradaAbs;
  const diurnoFim = Math.min(saidaAbs, limiteNoturno);
  const diurnoBruto = Math.max(0, diurnoFim - diurnoInicio);

  const noturnoInicio = Math.max(entradaAbs, limiteNoturno);
  const noturnoFim = saidaAbs;
  const noturnoBruto = Math.max(0, noturnoFim - noturnoInicio);

  const pausaNoDiurno = overlapMinutes(pausaInicioAbs, pausaFimAbs, diurnoInicio, diurnoFim);
  const pausaNoNoturno = overlapMinutes(pausaInicioAbs, pausaFimAbs, noturnoInicio, noturnoFim);

  const diurno = Math.max(0, diurnoBruto - pausaNoDiurno);
  const noturno = Math.max(0, noturnoBruto - pausaNoNoturno);

  if (entry.tipo === 50) {
    return { he50: diurno / 60, he70: noturno / 60, he100: 0, he120: 0 };
  }
  return { he50: 0, he70: 0, he100: diurno / 60, he120: noturno / 60 };
}

export function sumHours(list: EntryHours[]): EntryHours {
  return list.reduce(
    (acc, h) => ({
      he50: acc.he50 + h.he50,
      he70: acc.he70 + h.he70,
      he100: acc.he100 + h.he100,
      he120: acc.he120 + h.he120,
    }),
    { he50: 0, he70: 0, he100: 0, he120: 0 }
  );
}

/** Valor da hora extra (R$) para cada categoria, a partir do salário base + adicional de risco. */
export function valorHoraPorCategoria(settings: Settings): Record<Categoria, number> {
  const adicionalRisco = settings.salarioBase * settings.percentualRisco;
  const base = (settings.salarioBase + adicionalRisco) / 200;
  const out = {} as Record<Categoria, number>;
  for (const c of CATEGORIAS) {
    out[c.key] = base * c.multiplicador;
  }
  return out;
}

export interface ComparisonComputed extends ComparisonRow {
  horasFeitas: number;
  horasDevidas: number;
  dif: number;
  valorHora: number;
  valorFeito: number;
  valorDif: number;
}

/** Valida os dados de um lançamento antes de salvar. Retorna a mensagem de erro, ou null se estiver tudo ok. */
export function validarLancamento(input: {
  mes: string;
  data: string;
  tipo: number;
  entrada: string;
  saida: string;
  inicioPl?: string;
  finalPl?: string;
}): string | null {
  if (!input.mes || !/^\d{4}-\d{2}$/.test(input.mes)) return "Mês inválido.";
  if (!input.data) return "Data é obrigatória.";
  if (input.tipo !== 50 && input.tipo !== 100) return "Tipo deve ser 50 ou 100.";
  if (timeToMinutes(input.entrada) === null) return "Horário de entrada inválido (use HH:MM).";
  if (timeToMinutes(input.saida) === null) return "Horário de saída inválido (use HH:MM).";
  if (input.inicioPl && timeToMinutes(input.inicioPl) === null) return "Início da pausa inválido.";
  if (input.finalPl && timeToMinutes(input.finalPl) === null) return "Final da pausa inválido.";
  return null;
}

export function computeComparisons(
  totals: EntryHours,
  rows: ComparisonRow[],
  settings: Settings
): ComparisonComputed[] {
  const valores = valorHoraPorCategoria(settings);
  return CATEGORIAS.map((c) => {
    const row = rows.find((r) => r.categoria === c.key) ?? {
      categoria: c.key,
      difMesAnterior: 0,
      holeriteHoras: 0,
    };
    const horasFeitas = totals[c.key];
    const horasDevidas = row.difMesAnterior + horasFeitas;
    const dif = row.holeriteHoras - horasDevidas;
    const valorHora = valores[c.key];
    return {
      ...row,
      horasFeitas,
      horasDevidas,
      dif,
      valorHora,
      valorFeito: horasFeitas * valorHora,
      valorDif: dif * valorHora,
    };
  });
}
