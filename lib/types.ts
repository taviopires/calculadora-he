export type Tipo = 50 | 100;

export interface TimeEntry {
  id: string;
  mes: string; // "YYYY-MM"
  data: string; // "YYYY-MM-DD"
  tipo: Tipo;
  entrada: string; // "HH:MM"
  saida: string; // "HH:MM"
  inicioPl: string; // "HH:MM" (início da pausa/intervalo), pode ser ""
  finalPl: string; // "HH:MM" (final da pausa/intervalo), pode ser ""
}

export interface EntryHours {
  he50: number;
  he70: number;
  he100: number;
  he120: number;
}

export type Categoria = "he50" | "he70" | "he100" | "he120";

export const CATEGORIAS: { key: Categoria; label: string; multiplicador: number }[] = [
  { key: "he50", label: "Hora Extra 50%", multiplicador: 1.5 },
  { key: "he70", label: "Hora Extra 50% + Adic. Noturno 20% (70%)", multiplicador: 1.7 },
  { key: "he100", label: "Hora Extra 100%", multiplicador: 2.0 },
  { key: "he120", label: "Hora Extra 100% + Adic. Noturno 20% (120%)", multiplicador: 2.2 },
];

export interface Settings {
  salarioBase: number;
  percentualRisco: number; // fração, ex: 0.3 = 30%
}

export interface ComparisonRow {
  categoria: Categoria;
  difMesAnterior: number; // horas
  holeriteHoras: number; // horas pagas conforme holerite
}

export interface MonthSummary {
  mes: string;
  entries: (TimeEntry & EntryHours)[];
  totals: EntryHours; // soma das horas feitas no mês, por categoria
  comparisons: (ComparisonRow & {
    horasFeitas: number;
    horasDevidas: number;
    dif: number;
    valorHora: number;
    valorFeito: number;
    valorDif: number;
  })[];
  settings: Settings;
  valorTotalFeito: number;
  valorTotalDif: number;
}
