"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !user) router.replace("/login");
  }, [carregando, user, router]);

  if (carregando || !user) {
    return <p className="text-ink-faint text-sm">Carregando…</p>;
  }

  return <>{children}</>;
}
