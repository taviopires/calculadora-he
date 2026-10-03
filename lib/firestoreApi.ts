import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { computeComparisons, computeEntryHours, sumHours, ComparisonComputed } from "./calc";
import { mesAnterior } from "./monthUtils";
import { Categoria, ComparisonRow, EntryHours, Settings, TimeEntry } from "./types";

const SETTINGS_PADRAO: Settings = { salarioBase: 0, percentualRisco: 0.3 };

// ---------------------------------------------------------------------------
// Configurações (salário base, adicional de risco) — um documento por pessoa
// ---------------------------------------------------------------------------

export async function getSettings(uid: string): Promise<Settings> {
  const snap = await getDoc(doc(db, "users", uid, "settings", "current"));
  if (!snap.exists()) return SETTINGS_PADRAO;
  const data = snap.data();
  return {
    salarioBase: typeof data.salarioBase === "number" ? data.salarioBase : 0,
    percentualRisco: typeof data.percentualRisco === "number" ? data.percentualRisco : 0.3,
  };
}

export async function saveSettings(uid: string, settings: Settings): Promise<void> {
  await setDoc(doc(db, "users", uid, "settings", "current"), settings);
}

// ---------------------------------------------------------------------------
// Meses
// ---------------------------------------------------------------------------

export async function listMonthIds(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(db, "users", uid, "months"));
  return snap.docs.map((d) => d.id).sort((a, b) => b.localeCompare(a));
}

export async function createMonth(uid: string, mes: string): Promise<void> {
  const ref = doc(db, "users", uid, "months", mes);
  const snap = await getDoc(ref);
  if (snap.exists()) throw new Error("Esse mês já existe.");
  await setDoc(ref, { criadoEm: serverTimestamp() });
}

async function garantirMesExiste(uid: string, mes: string): Promise<void> {
  const ref = doc(db, "users", uid, "months", mes);
  const snap = await getDoc(ref);
  if (!snap.exists()) await setDoc(ref, { criadoEm: serverTimestamp() });
}

export async function deleteMonth(uid: string, mes: string): Promise<void> {
  const [entriesSnap, comparisonsSnap] = await Promise.all([
    getDocs(collection(db, "users", uid, "months", mes, "entries")),
    getDocs(collection(db, "users", uid, "months", mes, "comparisons")),
  ]);
  const batch = writeBatch(db);
  entriesSnap.docs.forEach((d) => batch.delete(d.ref));
  comparisonsSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, "users", uid, "months", mes));
  await batch.commit();
}

// ---------------------------------------------------------------------------
// Lançamentos de ponto
// ---------------------------------------------------------------------------

function entryFromSnap(id: string, mes: string, data: Record<string, unknown>): TimeEntry {
  return {
    id,
    mes,
    data: String(data.data ?? ""),
    tipo: (data.tipo === 100 ? 100 : 50) as 50 | 100,
    entrada: String(data.entrada ?? ""),
    saida: String(data.saida ?? ""),
    inicioPl: String(data.inicioPl ?? ""),
    finalPl: String(data.finalPl ?? ""),
  };
}

export async function listEntries(uid: string, mes: string): Promise<TimeEntry[]> {
  const ref = collection(db, "users", uid, "months", mes, "entries");
  const snap = await getDocs(query(ref, orderBy("data", "asc")));
  return snap.docs.map((d) => entryFromSnap(d.id, mes, d.data()));
}

export async function createEntry(uid: string, entry: Omit<TimeEntry, "id">): Promise<TimeEntry> {
  const { mes, ...rest } = entry;
  await garantirMesExiste(uid, mes);
  const ref = collection(db, "users", uid, "months", mes, "entries");
  const docRef = await addDoc(ref, rest);
  return { id: docRef.id, mes, ...rest };
}

export async function updateEntry(
  uid: string,
  mes: string,
  id: string,
  patch: Partial<Omit<TimeEntry, "id" | "mes">>
): Promise<void> {
  await updateDoc(doc(db, "users", uid, "months", mes, "entries", id), patch);
}

export async function deleteEntry(uid: string, mes: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "months", mes, "entries", id));
}

// ---------------------------------------------------------------------------
// Comparativo Espelho x Holerite
// ---------------------------------------------------------------------------

export async function listComparisons(uid: string, mes: string): Promise<ComparisonRow[]> {
  const snap = await getDocs(collection(db, "users", uid, "months", mes, "comparisons"));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      categoria: d.id as Categoria,
      difMesAnterior: typeof data.difMesAnterior === "number" ? data.difMesAnterior : 0,
      holeriteHoras: typeof data.holeriteHoras === "number" ? data.holeriteHoras : 0,
    };
  });
}

export async function saveComparisons(uid: string, mes: string, rows: ComparisonRow[]): Promise<void> {
  await garantirMesExiste(uid, mes);
  const batch = writeBatch(db);
  for (const row of rows) {
    const ref = doc(db, "users", uid, "months", mes, "comparisons", row.categoria);
    batch.set(ref, { difMesAnterior: row.difMesAnterior || 0, holeriteHoras: row.holeriteHoras || 0 });
  }
  await batch.commit();
}

// ---------------------------------------------------------------------------
// Combinações de alto nível (substituem o que antes era calculado no servidor)
// ---------------------------------------------------------------------------

export interface MonthResumo {
  mes: string;
  totalEntries: number;
  totals: EntryHours;
  valorTotalFeito: number;
  valorTotalDif: number;
}

export async function getMonthResumo(uid: string, mes: string, settings: Settings): Promise<MonthResumo> {
  const [entries, comparisonRows] = await Promise.all([listEntries(uid, mes), listComparisons(uid, mes)]);
  const totals = sumHours(entries.map((e) => computeEntryHours(e)));
  const comparisons = computeComparisons(totals, comparisonRows, settings);
  return {
    mes,
    totalEntries: entries.length,
    totals,
    valorTotalFeito: comparisons.reduce((acc, c) => acc + c.valorFeito, 0),
    valorTotalDif: comparisons.reduce((acc, c) => acc + c.valorDif, 0),
  };
}

export async function listMonthsComResumo(uid: string): Promise<MonthResumo[]> {
  const settings = await getSettings(uid);
  const meses = await listMonthIds(uid);
  return Promise.all(meses.map((mes) => getMonthResumo(uid, mes, settings)));
}

export interface MonthSummaryCompleto {
  mes: string;
  entries: (TimeEntry & EntryHours)[];
  totals: EntryHours;
  comparisons: ComparisonComputed[];
  settings: Settings;
  valorTotalFeito: number;
  valorTotalDif: number;
}

export async function getFullSummary(uid: string, mes: string): Promise<MonthSummaryCompleto> {
  const [settings, entriesRaw] = await Promise.all([getSettings(uid), listEntries(uid, mes)]);
  const entries = entriesRaw.map((e) => ({ ...e, ...computeEntryHours(e) }));
  const totals = sumHours(entries);

  let comparisonRows = await listComparisons(uid, mes);

  // Se ainda não há comparativo salvo para este mês, sugere a DIF do mês
  // anterior automaticamente (equivalente ao "DIF M ANT." da planilha).
  if (comparisonRows.length === 0) {
    const anterior = mesAnterior(mes);
    const anteriorRows = await listComparisons(uid, anterior);
    if (anteriorRows.length > 0) {
      const anteriorEntries = await listEntries(uid, anterior);
      const anteriorTotals = sumHours(anteriorEntries.map((e) => computeEntryHours(e)));
      const anteriorComputed = computeComparisons(anteriorTotals, anteriorRows, settings);
      comparisonRows = anteriorComputed.map((c) => ({
        categoria: c.categoria,
        difMesAnterior: Number(c.dif.toFixed(4)),
        holeriteHoras: 0,
      }));
    }
  }

  const comparisons = computeComparisons(totals, comparisonRows, settings);

  return {
    mes,
    entries,
    totals,
    comparisons,
    settings,
    valorTotalFeito: comparisons.reduce((acc, c) => acc + c.valorFeito, 0),
    valorTotalDif: comparisons.reduce((acc, c) => acc + c.valorDif, 0),
  };
}
