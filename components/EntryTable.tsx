"use client";

import { useState } from "react";
import PunchBadge from "./PunchBadge";
import { formatHoras } from "@/lib/format";
import { EntryHours, TimeEntry } from "@/lib/types";

type Row = TimeEntry & EntryHours;

export default function EntryTable({
  entries,
  onUpdate,
  onDelete,
}: {
  entries: Row[];
  onUpdate: (id: string, patch: Partial<TimeEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<TimeEntry>>({});

  function startEdit(row: Row) {
    setEditId(row.id);
    setDraft({
      data: row.data,
      tipo: row.tipo,
      entrada: row.entrada,
      saida: row.saida,
      inicioPl: row.inicioPl,
      finalPl: row.finalPl,
    });
  }

  async function saveEdit(id: string) {
    try {
      await onUpdate(id, draft);
      setEditId(null);
    } catch {
      // Erro já é exibido no banner da página; mantém a linha em edição.
    }
  }

  if (entries.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-ink-faint">
        Nenhum lançamento neste mês ainda. Use o formulário acima para adicionar o primeiro.
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm min-w-[820px]">
        <thead>
          <tr className="border-b border-line text-left">
            <th className="p-3 label">Tipo</th>
            <th className="p-3 label">Data</th>
            <th className="p-3 label">Entrada</th>
            <th className="p-3 label">Saída</th>
            <th className="p-3 label">Pausa</th>
            <th className="p-3 label text-right">50%</th>
            <th className="p-3 label text-right">70%</th>
            <th className="p-3 label text-right">100%</th>
            <th className="p-3 label text-right">120%</th>
            <th className="p-3 label"></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((row) => {
            const editing = editId === row.id;
            return (
              <tr key={row.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                {editing ? (
                  <>
                    <td className="p-2">
                      <select
                        className="input"
                        value={draft.tipo}
                        onChange={(e) => setDraft({ ...draft, tipo: Number(e.target.value) as 50 | 100 })}
                      >
                        <option value={50}>50%</option>
                        <option value={100}>100%</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="date"
                        className="input"
                        value={draft.data}
                        onChange={(e) => setDraft({ ...draft, data: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="time"
                        className="input"
                        value={draft.entrada}
                        onChange={(e) => setDraft({ ...draft, entrada: e.target.value })}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="time"
                        className="input"
                        value={draft.saida}
                        onChange={(e) => setDraft({ ...draft, saida: e.target.value })}
                      />
                    </td>
                    <td className="p-2 flex gap-1">
                      <input
                        type="time"
                        className="input"
                        value={draft.inicioPl}
                        onChange={(e) => setDraft({ ...draft, inicioPl: e.target.value })}
                      />
                      <input
                        type="time"
                        className="input"
                        value={draft.finalPl}
                        onChange={(e) => setDraft({ ...draft, finalPl: e.target.value })}
                      />
                    </td>
                    <td colSpan={4} className="p-2 text-center text-ink-faint text-xs">
                      recalculado ao salvar
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <button onClick={() => saveEdit(row.id)} className="btn-secondary text-xs px-2 py-1 mr-1">
                        Salvar
                      </button>
                      <button onClick={() => setEditId(null)} className="text-xs text-ink-faint">
                        cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3">
                      <PunchBadge tipo={row.tipo} />
                    </td>
                    <td className="p-3 font-mono">{formatData(row.data)}</td>
                    <td className="p-3 font-mono">{row.entrada}</td>
                    <td className="p-3 font-mono">{row.saida}</td>
                    <td className="p-3 font-mono text-ink-faint">
                      {row.inicioPl && row.finalPl ? `${row.inicioPl}–${row.finalPl}` : "—"}
                    </td>
                    <td className="p-3 font-mono text-right">{row.he50 > 0 ? `${formatHoras(row.he50)}h` : "—"}</td>
                    <td className="p-3 font-mono text-right">{row.he70 > 0 ? `${formatHoras(row.he70)}h` : "—"}</td>
                    <td className="p-3 font-mono text-right">{row.he100 > 0 ? `${formatHoras(row.he100)}h` : "—"}</td>
                    <td className="p-3 font-mono text-right">{row.he120 > 0 ? `${formatHoras(row.he120)}h` : "—"}</td>
                    <td className="p-3 whitespace-nowrap text-right">
                      <button onClick={() => startEdit(row)} className="text-xs font-semibold text-steel mr-3">
                        editar
                      </button>
                      <button onClick={() => onDelete(row.id)} className="text-xs font-semibold text-ledger-red">
                        excluir
                      </button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano.slice(2)}`;
}
