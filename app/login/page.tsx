"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { mensagemErroAuth } from "@/lib/authErrors";

export default function LoginPage() {
  const { user, carregando, entrar, cadastrar } = useAuth();
  const router = useRouter();

  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!carregando && user) router.replace("/");
  }, [carregando, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      if (modo === "entrar") {
        await entrar(email, senha);
      } else {
        await cadastrar(email, senha);
      }
      router.replace("/");
    } catch (e) {
      setErro(mensagemErroAuth(e));
    } finally {
      setEnviando(false);
    }
  }

  if (carregando || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gradient">
        <p className="text-white text-sm drop-shadow-[0_1px_6px_rgba(17,22,58,0.45)]">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gradient px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6 drop-shadow-[0_2px_10px_rgba(17,22,58,0.35)]">
          <Image src="/logo-full.png" alt="Holerite Extra" width={900} height={575} priority className="w-56 h-auto" />
        </div>

        <div className="card w-full p-6 shadow-xl shadow-black/10">
        <div className="flex gap-1 mb-5 bg-paper/60 rounded-md p-1 border border-line">
          <button
            type="button"
            onClick={() => setModo("entrar")}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${
              modo === "entrar" ? "bg-ink text-paper" : "text-ink-light"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setModo("cadastrar")}
            className={`flex-1 rounded-md py-1.5 text-sm font-semibold transition ${
              modo === "cadastrar" ? "bg-ink text-paper" : "text-ink-light"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="label block mb-1">E-mail</label>
            <input
              type="email"
              required
              autoComplete="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="label block mb-1">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
              className="input"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {modo === "cadastrar" && <p className="text-xs text-ink-faint mt-1">Mínimo de 6 caracteres.</p>}
          </div>

          {erro && <p className="text-ledger-red text-sm">{erro}</p>}

          <button type="submit" disabled={enviando} className="btn-primary w-full mt-1">
            {enviando ? "Um momento…" : modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="text-xs text-ink-faint mt-5 text-center">
          Cada pessoa tem seus próprios lançamentos, salário e comparativo — ninguém vê os dados de outra pessoa.
        </p>
        </div>
      </div>
    </div>
  );
}
