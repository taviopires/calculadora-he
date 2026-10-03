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
    <div className="card overflow-x-auto">
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
          {draft.map((row) => {
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
        <button onClick={salvar} disabled={salvando} className="btn-primary">
          Salvar comparativo
        </button>
        {salvo && <span className="text-ledger-green text-sm font-semibold">Salvo ✓</span>}
        {erro && <span className="text-ledger-red text-sm font-semibold">{erro}</span>}
        <span className="text-xs text-ink-faint ml-auto">
          "HE devidas" = dif. do mês anterior + HE feitas neste mês. "Diferença" = pago no holerite − devido.
        </span>
      </div>
    </div>
  );
}
