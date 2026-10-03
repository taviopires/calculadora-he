"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIAS, Settings } from "@/lib/types";
import { valorHoraPorCategoria } from "@/lib/calc";
import { formatBRL } from "@/lib/format";
import { getSettings, saveSettings } from "@/lib/firestoreApi";

export default function ConfiguracoesPage() {
  return (
    <AuthGuard>
      <Configuracoes />
    </AuthGuard>
  );
}

function Configuracoes() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!user) return;
    getSettings(user.uid)
      .then(setSettings)
      .catch(() => setErro("Não foi possível carregar as configurações. Recarregue a página."));
  }, [user]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!settings || !user) return;
    setSalvo(false);
    setErro(null);
    setSalvando(true);
    try {
      await saveSettings(user.uid, settings);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    } catch {
      setErro("Não foi possível salvar. Verifique sua internet e tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  const valores = settings ? valorHoraPorCategoria(settings) : null;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <p className="label">Ajustes</p>
        <h1 className="font-display font-bold text-3xl mt-1">Configurações</h1>
        <p className="text-ink-light text-sm mt-1">
          Esses valores definem o preço da hora extra em cada categoria, usando a mesma fórmula da planilha: valor da
          hora = (salário base + adicional de risco) ÷ 200 × multiplicador. Só você vê e edita esses valores.
        </p>
      </div>

      {settings && (
        <form onSubmit={salvar} className="card p-6 flex flex-col gap-5">
          <div>
            <label className="label block mb-1">Salário base (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={settings.salarioBase}
              onChange={(e) => setSettings({ ...settings, salarioBase: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label block mb-1">Adicional de risco (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              className="input"
              value={settings.percentualRisco * 100}
              onChange={(e) => setSettings({ ...settings, percentualRisco: Number(e.target.value) / 100 })}
            />
            <p className="text-xs text-ink-faint mt-1">
              Padrão de 30% para categorias com adicional de periculosidade/risco. Ajuste ou zere se não se aplicar.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={salvando} className="btn-primary">
              {salvando ? "Salvando…" : "Salvar configurações"}
            </button>
            {salvo && <span className="text-ledger-green text-sm font-semibold">Salvo ✓</span>}
          </div>
          {erro && <p className="text-ledger-red text-sm">{erro}</p>}
        </form>
      )}

      {valores && settings && (
        <div className="card p-6">
          <p className="label mb-3">Valor da hora extra calculado</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {CATEGORIAS.map((c) => (
              <div key={c.key} className="flex items-center justify-between border border-line rounded-md px-3 py-2">
                <span className="text-sm">{c.label}</span>
                <span className="font-mono font-bold">{formatBRL(valores[c.key])}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
