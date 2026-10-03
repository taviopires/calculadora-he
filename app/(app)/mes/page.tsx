"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import EntryForm, { NovoLancamento } from "@/components/EntryForm";
import EntryTable from "@/components/EntryTable";
import ComparisonTable from "@/components/ComparisonTable";
import SummaryCards from "@/components/SummaryCards";
import { mesLabel } from "@/lib/monthUtils";
import { validarLancamento } from "@/lib/calc";
import { Categoria, TimeEntry } from "@/lib/types";
import {
  createEntry,
  deleteEntry,
  deleteMonth,
  getFullSummary,
  MonthSummaryCompleto,
  saveComparisons,
  updateEntry,
} from "@/lib/firestoreApi";

// Em vez de /mes/[mes], usamos /mes?m=... — rota fixa com um parâmetro de
// busca, em vez de um segmento dinâmico na URL. Isso é necessário porque o
// site é exportado como arquivos estáticos (GitHub Pages): o Next.js
// precisaria conhecer, no momento do build, todos os meses que algum dia
// existirão, o que é impossível. Com ?m=..., existe só um arquivo HTML
// (/mes/index.html) e o valor do mês é lido no navegador.
export default function MesPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<p className="text-ink-faint text-sm">Carregando…</p>}>
        <MesComParam />
      </Suspense>
    </AuthGuard>
  );
}

function MesComParam() {
  const searchParams = useSearchParams();
  const mes = searchParams.get("m");

  if (!mes) {
    return (
      <div className="card p-8 text-center">
        <p className="font-display text-lg font-bold mb-2">Nenhum mês informado</p>
        <Link href="/" className="text-steel text-sm font-semibold">
          ← voltar para todos os meses
        </Link>
      </div>
    );
  }

  return <Mes mes={mes} />;
}

function Mes({ mes }: { mes: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [dados, setDados] = useState<MonthSummaryCompleto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!user) return;
    try {
      const resumo = await getFullSummary(user.uid, mes);
      setDados(resumo);
    } catch {
      setDados(null);
    } finally {
      setCarregando(false);
    }
  }, [user, mes]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionarLancamento(l: NovoLancamento): Promise<string | null> {
    if (!user) return "Você precisa estar logado.";
    const erro = validarLancamento({ ...l, mes });
    if (erro) return erro;
    try {
      await createEntry(user.uid, { ...l, mes });
      await carregar();
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Erro ao lançar.";
    }
  }

  async function atualizarLancamento(id: string, patch: Partial<TimeEntry>) {
    if (!user) return;
    setErroAcao(null);
    try {
      await updateEntry(user.uid, mes, id, patch);
      await carregar();
    } catch (e) {
      setErroAcao(e instanceof Error ? e.message : "Não foi possível salvar essa edição. Tente novamente.");
      throw e;
    }
  }

  async function excluirLancamento(id: string) {
    if (!user) return;
    if (!confirm("Excluir este lançamento?")) return;
    setErroAcao(null);
    try {
      await deleteEntry(user.uid, mes, id);
      await carregar();
    } catch {
      setErroAcao("Não foi possível excluir o lançamento. Tente novamente.");
    }
  }

  async function salvarComparativo(rows: { categoria: Categoria; difMesAnterior: number; holeriteHoras: number }[]) {
    if (!user) return;
    setErroAcao(null);
    try {
      await saveComparisons(user.uid, mes, rows);
      await carregar();
    } catch (e) {
      throw e instanceof Error ? e : new Error("Não foi possível salvar o comparativo. Tente novamente.");
    }
  }

  async function excluirMes() {
    if (!user) return;
    if (!confirm(`Excluir o mês ${mes} por completo? Essa ação não pode ser desfeita.`)) return;
    try {
      await deleteMonth(user.uid, mes);
      router.push("/");
    } catch {
      setErroAcao("Não foi possível excluir o mês. Tente novamente.");
    }
  }

  if (carregando) return <p className="text-ink-faint text-sm">Carregando…</p>;
  if (!dados) return <p className="text-ledger-red text-sm">Mês não encontrado.</p>;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-xs font-semibold text-steel">
            ← todos os meses
          </Link>
          <h1 className="font-display font-bold text-3xl mt-1">{mesLabel(mes)}</h1>
        </div>
        <button onClick={excluirMes} className="btn-danger">
          Excluir mês
        </button>
      </section>

      {erroAcao && <p className="text-ledger-red text-sm bg-ledger-redBg rounded-md px-3 py-2">{erroAcao}</p>}

      <section className="flex flex-col gap-3">
        <h2 className="font-display font-bold text-lg">Lançamentos de ponto</h2>
        <EntryForm mesPadrao={mes} onSubmit={adicionarLancamento} />
        <EntryTable entries={dados.entries} onUpdate={atualizarLancamento} onDelete={excluirLancamento} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display font-bold text-lg">Resumo financeiro</h2>
        <SummaryCards totals={dados.totals} valorTotalFeito={dados.valorTotalFeito} valorTotalDif={dados.valorTotalDif} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display font-bold text-lg">Comparativo Espelho × Holerite</h2>
        <p className="text-sm text-ink-light -mt-1">
          Informe a diferença herdada do mês anterior (pré-preenchida automaticamente quando existir) e quantas horas
          o holerite realmente pagou em cada categoria.
        </p>
        <ComparisonTable comparisons={dados.comparisons} onSave={salvarComparativo} />
      </section>
    </div>
  );
}
