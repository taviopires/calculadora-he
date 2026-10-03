"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { withBasePath } from "@/lib/basePath";

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, sair } = useAuth();
  const isConfig = pathname === "/configuracoes";

  async function handleSair() {
    await sair();
    router.replace("/login");
  }

  return (
    <header className="border-b border-line bg-paper/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
          <span className="relative h-9 w-9 shrink-0 group-hover:scale-105 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBasePath("/logo-icon.png")}
              alt="Holerite Extra"
              className="absolute inset-0 h-full w-full object-contain"
            />
          </span>
          <span className="hidden sm:inline font-display font-bold text-lg tracking-tight truncate">
            Holerite Extra
          </span>
        </Link>
        {user && (
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <span className="hidden lg:inline text-xs text-ink-faint">{user.email}</span>
            <Link
              href="/configuracoes"
              className={`text-sm font-semibold px-2 sm:px-3 py-1.5 rounded-md transition ${
                isConfig ? "bg-ink text-paper" : "text-ink-light hover:text-steel"
              }`}
            >
              Configurações
            </Link>
            <button
              onClick={handleSair}
              className="text-sm font-semibold px-2 sm:px-3 py-1.5 rounded-md text-ink-light hover:text-ledger-red transition"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
