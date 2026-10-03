"use client";

import { useState } from "react";
import { Tipo } from "@/lib/types";

export interface NovoLancamento {
  data: string;
  tipo: Tipo;
  entrada: string;
  saida: string;
  inicioPl: string;
  finalPl: string;
}

const VAZIO: NovoLancamento = {
  data: "",
  tipo: 50,
  entrada: "",
  saida: "",
  inicioPl: "",
  finalPl: "",
};

export default function EntryForm({
  mesPadrao,
  onSubmit,
}: {
  mesPadrao: string;
  onSubmit: (lancamento: NovoLancamento) => Promise<string | null>;
}) {
  const [form, setForm] = useState<NovoLancamento>({ ...VAZIO, data: `${mesPadrao}-01` });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const resultado = await onSubmit(form);
    setEnviando(false);
    if (resultado) {
      setErro(resultado);
      return;
    }
    setForm({ ...VAZIO, data: form.data });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
      <div className="col-span-2 sm:col-span-1">
        <label className="label block mb-1">Data</label>
        <input
          type="date"
          required
          className="input"
          value={form.data}
          onChange={(e) => setForm({ ...form, data: e.target.value })}
        />
      </div>
      <div>
        <label className="label block mb-1">Tipo</label>
        <select
          className="input"
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: Number(e.target.value) as Tipo })}
        >
          <option value={50}>50% (útil)</option>
          <option value={100}>100% (dom/feriado)</option>
        </select>
      </div>
      <div>
        <label className="label block mb-1">Entrada</label>
        <input
          type="time"
          required
          className="input"
          value={form.entrada}
          onChange={(e) => setForm({ ...form, entrada: e.target.value })}
        />
      </div>
      <div>
        <label className="label block mb-1">Saída</label>
        <input
          type="time"
          required
          className="input"
          value={form.saida}
          onChange={(e) => setForm({ ...form, saida: e.target.value })}
        />
      </div>
      <div>
        <label className="label block mb-1">Início pausa</label>
        <input
          type="time"
          className="input"
          value={form.inicioPl}
          onChange={(e) => setForm({ ...form, inicioPl: e.target.value })}
        />
      </div>
      <div>
        <label className="label block mb-1">Final pausa</label>
        <input
          type="time"
          className="input"
          value={form.finalPl}
          onChange={(e) => setForm({ ...form, finalPl: e.target.value })}
        />
      </div>
      <button type="submit" disabled={enviando} className="btn-primary w-full sm:w-auto">
        + Lançar
      </button>
      <p className="col-span-full text-xs text-ink-faint">
        Se a saída for igual ou anterior ao horário de entrada, o app entende que o turno atravessou a virada do dia
        (ex.: entra 06:00, sai 06:00 do dia seguinte = 24h). Funciona também para turnos só de dia ou que começam
        depois das 22h.
      </p>
      {erro && <p className="col-span-full text-ledger-red text-sm">{erro}</p>}
    </form>
  );
}
