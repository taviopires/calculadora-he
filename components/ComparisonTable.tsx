"use client";

import { useEffect, useState } from "react";
import { CATEGORIAS, Categoria } from "@/lib/types";
import { formatBRL, formatHoras } from "@/lib/format";

export interface ComparisonComputed {
  categoria: Categoria;
  difMesAnterior: number;
  holeriteHoras: number;
  horasFeitas: number;
  horasDevidas: number;
  dif: number;
  valorHora: number;
  valorFeito: number;
  valorDif: number;
}

export default function ComparisonTable({
  comparisons,
  onSave,
}: {
  comparisons: ComparisonComputed[];
  onSave: (rows: { categoria: Categoria; difMesAnterior: number; holeriteHoras: number }[]) => Promise<void>;
}) {
  const [draft, setDraft] = useState(comparisons);
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => setDraft(comparisons), [comparisons]);

  function updateField(categoria: Categoria, field: "difMesAnterior" | "holeriteHoras", value: number) {
    setDraft((prev) => prev.map((r) => (r.categoria === categoria ? { ...r, [field]: value } : r)));
  }

  // "horasFeitas" e "valorHora" não mudam quando a pessoa edita os campos
  // abaixo — só dependem dos lançamentos de ponto e do salário. Por isso,
  // dá pra recalcular "HE devidas", "Diferença" e "Valor da diferença" na
  // hora, a cada tecla digitada, sem esperar o servidor recalcular depois
  // de salvar (que é o que causava a tela mostrar um valor desatualizado).
  function recalcular(row: ComparisonComputed): ComparisonComputed {
    const horasDevidas = row.difMesAnterior + row.horasFeitas;
    const dif = row.holeriteHoras - horasDevidas;
    return { ...row, horasDevidas, dif, valorDif: dif * row.valorHora };
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    setSalvo(false);
    try {
      await onSave(draft.map((r) => ({ categoria: r.categoria, difMesAnterior: r.difMesAnterior, holeriteHoras: r.holeriteHoras })));
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar o comparativo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Celular: um cartão por categoria, campos empilhados */}
      <div className="sm:hidden flex flex-col gap-3">
        {draft.map(recalcular).map((row) => {
          const label = CATEGORIAS.find((c) => c.key === row.categoria)?.label ?? row.categoria;
          const difCor = row.dif >= 0 ? "text-ledger-green" : "text-ledger-red";
          return (
            <div key={row.categoria} className="card p-4 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display font-bold leading-tight">{label}</p>
                <span className={`font-mono font-bold text-sm whitespace-nowrap ${difCor}`}>
                  {formatBRL(row.valorDif)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="label">HE feitas (calc.)</p>
                  <p className="font-mono">{formatHoras(row.horasFeitas)}h</p>
                </div>
                <div>
                  <p className="label">HE devidas</p>
                  <p className="font-mono">{formatHoras(row.horasDevidas)}h</p>
                </div>
              </div>

              <div>
                <label className="label block mb-1">Quanto o holerite pagou (horas)</label>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  className="input"
                  value={row.holeriteHoras}
                  onChange={(e) => updateField(row.categoria, "holeriteHoras", Number(e.target.value))}
                />
                <p className="text-xs text-ink-faint mt-1">
                  Abra seu holerite e digite aqui quantas horas dessa categoria ele mostra como pagas.
                </p>
              </div>

              <details className="group">
                <summary className="label cursor-pointer select-none list-none flex items-center gap-1">
                  <span className="transition-transform group-open:rotate-90">›</span> Ajustar diferença do mês
                  anterior
                </summary>
                <div className="mt-2">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    className="input"
                    value={row.difMesAnterior}
                    onChange={(e) => updateField(row.categoria, "difMesAnterior", Number(e.target.value))}
                  />
                  <p className="text-xs text-ink-faint mt-1">
                    Normalmente já vem preenchido sozinho — só mude se tiver certeza do motivo.
                  </p>
                </div>
              </details>

              <div className="flex items-center justify-between text-sm pt-3 border-t border-line">
                <span className="text-ink-faint">Diferença (pago − devido)</span>
                <span className={`font-mono font-semibold ${difCor}`}>{formatHoras(row.dif)}h</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop/tablet: tabela completa */}
      <div className="hidden sm:block card overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-3 label">Categoria</th>
              <th className="p-3 label text-right">HE feitas (calc.)</th>
              <th className="p-3 label text-right">Dif. mês anterior</th>
              <th className="p-3 label text-right">HE devidas</th>
              <th className="p-3 label text-right">HE pagas (holerite)</th>
              <th className="p-3 label text-right">Diferença</th>
              <th className="p-3 label text-right">Valor da diferença</th>
            </tr>
          </thead>
          <tbody>
            {draft.map(recalcular).map((row) => {
              const label = CATEGORIAS.find((c) => c.key === row.categoria)?.label ?? row.categoria;
              const difCor = row.dif >= 0 ? "text-ledger-green" : "text-ledger-red";
              return (
                <tr key={row.categoria} className="border-b border-line last:border-0">
                  <td className="p-3 font-medium">{label}</td>
                  <td className="p-3 font-mono text-right">{formatHoras(row.horasFeitas)}h</td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      step="0.01"
                      className="input text-right"
                      value={row.difMesAnterior}
                      onChange={(e) => updateField(row.categoria, "difMesAnterior", Number(e.target.value))}
                    />
                  </td>
                  <td className="p-3 font-mono text-right">{formatHoras(row.horasDevidas)}h</td>
                  <td className="p-2 text-right">
                    <input
                      type="number"
                      step="0.01"
                      className="input text-right"
                      value={row.holeriteHoras}
                      onChange={(e) => updateField(row.categoria, "holeriteHoras", Number(e.target.value))}
                    />
                  </td>
                  <td className={`p-3 font-mono text-right font-semibold ${difCor}`}>{formatHoras(row.dif)}h</td>
                  <td className={`p-3 font-mono text-right font-semibold ${difCor}`}>{formatBRL(row.valorDif)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-3 flex items-center gap-3 border-t border-line">
          <span className="text-xs text-ink-faint">
            "HE devidas" = dif. do mês anterior + HE feitas neste mês. "Diferença" = pago no holerite − devido.
          </span>
        </div>
      </div>

      <div className="card p-3 flex items-center gap-3">
        <button onClick={salvar} disabled={salvando} className="btn-primary">
          Salvar comparativo
        </button>
        {salvo && <span className="text-ledger-green text-sm font-semibold">Salvo ✓</span>}
        {erro && <span className="text-ledger-red text-sm font-semibold">{erro}</span>}
      </div>
    </div>
  );
}
