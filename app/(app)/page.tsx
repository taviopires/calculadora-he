"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import MonthCard from "@/components/MonthCard";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { mesAtual } from "@/lib/monthUtils";
import { createMonth, deleteMonth, listMonthsComResumo, MonthResumo } from "@/lib/firestoreApi";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [meses, setMeses] = useState<MonthResumo[] | null>(null);
  const [novoMes, setNovoMes] = useState(mesAtual());
  const [erro, setErro] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(async () => {
    if (!user) return;
    const resumo = await listMonthsComResumo(user.uid);
    setMeses(resumo);
  }, [user]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function criarMes(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErro(null);
    setCriando(true);
    try {
      await createMonth(user.uid, novoMes);
      router.push(`/mes?m=${novoMes}`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível criar o mês.");
    } finally {
      setCriando(false);
    }
  }

  async function excluirMes(mes: string) {
    if (!user) return;
    if (!confirm(`Excluir o mês ${mes}? Todos os lançamentos e comparativos serão perdidos.`)) return;
    await deleteMonth(user.uid, mes);
    carregar();
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="label">Painel</p>
          <h1 className="font-display font-bold text-3xl mt-1">Seus meses de apuração</h1>
          <p className="text-ink-light text-sm mt-1 max-w-lg">
            Registre a entrada e saída de cada plantão, e o app calcula sozinho as horas extras (50%, 70%, 100% e
            120%) e confere se o holerite bate com o esperado.
          </p>
        </div>
        <form onSubmit={criarMes} className="card p-3 flex flex-wrap items-end gap-2 shrink-0">
          <div>
            <label className="label block mb-1">Novo mês</label>
            <input
              type="month"
              value={novoMes}
              onChange={(e) => setNovoMes(e.target.value)}
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={criando} className="btn-primary">
            + Criar
          </button>
        </form>
      </section>

      {erro && <p className="text-ledger-red text-sm">{erro}</p>}

      {meses === null && <p className="text-ink-faint text-sm">Carregando…</p>}

      {meses !== null && meses.length === 0 && (
        <div className="card p-10 text-center flex flex-col items-center gap-2">
          <p className="font-display text-xl font-bold">Nenhum mês cadastrado ainda</p>
          <p className="text-ink-light text-sm max-w-sm">
            Comece criando o primeiro mês de apuração acima e depois lance seus horários de entrada e saída.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {meses?.map((m) => (
          <MonthCard key={m.mes} resumo={m} onDelete={excluirMes} />
        ))}
      </div>
    </div>
  );
}
