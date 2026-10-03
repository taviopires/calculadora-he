"use client";

import Link from "next/link";
import { mesLabel } from "@/lib/monthUtils";
import { formatBRL, formatHoras } from "@/lib/format";
import { MonthResumo } from "@/lib/firestoreApi";

export default function MonthCard({ resumo, onDelete }: { resumo: MonthResumo; onDelete: (mes: string) => void }) {
  const totalHoras = resumo.totals.he50 + resumo.totals.he70 + resumo.totals.he100 + resumo.totals.he120;
  const difPositiva = resumo.valorTotalDif >= 0;

  return (
    <div className="card p-5 flex flex-col gap-4 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="label">Mês de referência</p>
          <h3 className="font-display font-bold text-xl mt-0.5">{mesLabel(resumo.mes)}</h3>
        </div>
        <button
          onClick={() => onDelete(resumo.mes)}
          className="text-ink-faint hover:text-ledger-red text-xs font-semibold"
          title="Excluir mês"
        >
          excluir
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="label">Lançamentos</p>
          <p className="font-mono text-lg">{resumo.totalEntries}</p>
        </div>
        <div>
          <p className="label">Total de H.E.</p>
          <p className="font-mono text-lg">{formatHoras(totalHoras)}h</p>
        </div>
      </div>

      <div
        className={`rounded-md px-3 py-2 flex items-center justify-between ${
          difPositiva ? "bg-ledger-greenBg" : "bg-ledger-redBg"
        }`}
      >
        <span className={`text-xs font-semibold ${difPositiva ? "text-ledger-green" : "text-ledger-red"}`}>
          Diferença apurada (holerite - devido)
        </span>
        <span className={`font-mono font-bold ${difPositiva ? "text-ledger-green" : "text-ledger-red"}`}>
          {formatBRL(resumo.valorTotalDif)}
        </span>
      </div>

      <Link href={`/mes?m=${resumo.mes}`} className="btn-secondary w-full">
        Abrir mês →
      </Link>
    </div>
  );
}
