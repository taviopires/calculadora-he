const MENSAGENS: Record<string, string> = {
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-disabled": "Essa conta foi desativada.",
  "auth/user-not-found": "Não existe conta com esse e-mail.",
  "auth/wrong-password": "Senha incorreta.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Já existe uma conta com esse e-mail. Tente entrar em vez de cadastrar.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco antes de tentar de novo.",
  "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
};

export function mensagemErroAuth(erro: unknown): string {
  const code = typeof erro === "object" && erro && "code" in erro ? String((erro as any).code) : "";
  return MENSAGENS[code] || "Não foi possível completar a operação. Tente novamente.";
}
