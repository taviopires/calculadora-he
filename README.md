# Cartão de Ponto — Calculadora de Horas Extras

App web para registrar entrada/saída de ponto e calcular automaticamente as
horas extras nas 4 categorias usadas na planilha original — **50%**, **70%**
(50% + adicional noturno de 20%), **100%** e **120%** (100% + adicional
noturno) — além de comparar **Espelho de Ponto × Holerite** para conferir se
cada pessoa recebeu certo.

Cada pessoa cria sua própria conta (e-mail e senha). Os lançamentos, o
salário/adicional de risco e o comparativo de cada uma ficam **completamente
separados** — ninguém vê os dados de outra pessoa.

## Arquitetura

- **Front-end:** Next.js 14 + TypeScript + Tailwind, **exportado como site
  100% estático** (`output: "export"`) — não existe mais nenhum servidor
  Next.js rodando; é só HTML/CSS/JS puro.
- **Login:** Firebase Authentication (e-mail e senha).
- **Banco de dados:** Firestore. O navegador consulta o Firestore
  diretamente (sem rotas de API no meio do caminho) — quem garante que cada
  pessoa só acessa os próprios dados são as **Regras de Segurança** do
  Firestore (`firestore.rules`), não o código do app.
- **Hospedagem:** GitHub Pages, publicado automaticamente por um workflow
  do GitHub Actions (`.github/workflows/deploy.yml`) a cada `push` na
  branch `main`.

## Como criar o projeto Firebase (uma vez só)

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
   e clique em **"Adicionar projeto"**. Dê um nome e conclua a criação
   (pode desativar o Google Analytics, não é necessário).
2. No menu lateral, vá em **Build → Authentication → Sign-in method** e
   ative o provedor **"E-mail/senha"**.
3. No menu lateral, vá em **Build → Firestore Database** e clique em
   **"Criar banco de dados"**. Escolha uma localização (qualquer uma
   próxima do Brasil serve) e comece em **modo de produção** (as regras de
   segurança do projeto cuidam da proteção, não precisa do modo de teste).
4. Ainda no Firestore, vá na aba **"Regras"** e cole o conteúdo do arquivo
   `firestore.rules` deste projeto, substituindo o que já estiver lá.
   Clique em **"Publicar"**.
5. Volte em **Project settings** (ícone de engrenagem, no topo do menu
   lateral) → aba **"General"** → role até **"Your apps"** → clique no
   ícone **`</>`** (Web) → dê um nome ao app → **"Registrar app"**.
6. Vai aparecer um objeto `firebaseConfig` com várias chaves
   (`apiKey`, `authDomain`, `projectId`, etc.). É esse objeto que você vai
   usar no próximo passo.

## Como rodar localmente

Pré-requisitos: [Node.js](https://nodejs.org) 18 ou mais recente, e um
projeto Firebase já criado (passo acima).

```bash
cp .env.local.example .env.local
# edite .env.local com os valores do firebaseConfig do seu projeto
npm install
npm run dev
```

Abra http://localhost:3000, clique em **"Criar conta"**, cadastre seu
e-mail e senha, depois vá em **Configurações** informar seu salário.

## Como gerar o site estático manualmente (opcional)

```bash
npm install
npm run build      # gera a pasta out/
npm run serve       # serve out/ localmente, pra conferir antes de publicar
```

Normalmente você não precisa rodar isso à mão — o GitHub Actions faz isso
sozinho a cada `push` (próxima seção).

## Hospedar no GitHub Pages

**1. Ajuste o nome do repositório no `next.config.js`**

Abra `next.config.js` e confira se `REPO_NAME` é exatamente o nome do seu
repositório no GitHub (ex.: `"calculadora-he"`). Isso é necessário porque o
GitHub Pages publica um repositório em
`https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`, e o Next.js precisa
saber esse prefixo para montar os links certos.

**2. Suba o projeto para um repositório no GitHub**

Pode ser público ou privado — GitHub Pages funciona para os dois (em
repositórios privados, só é preciso ter uma conta GitHub Pro/Team/Enterprise
*ou* deixar o repositório público; confira o plano da sua conta).

**3. Ative o GitHub Pages**

No repositório, vá em **Settings → Pages**. Em **"Build and deployment" →
Source**, escolha **"GitHub Actions"** (não "Deploy from a branch" — é o
workflow em `.github/workflows/deploy.yml` que vai cuidar disso).

**4. Cadastre as credenciais do Firebase como "Secrets"**

Ainda nas configurações do repositório, vá em **Settings → Secrets and
variables → Actions → New repository secret** e crie, uma por uma, as 6
variáveis do `.env.local.example` (ex.: `NEXT_PUBLIC_FIREBASE_API_KEY`),
colando o valor do `firebaseConfig` do seu projeto em cada uma.

**5. Dispare o primeiro deploy**

Qualquer `push` na branch `main` já dispara o workflow automaticamente. Se
quiser disparar manualmente sem alterar nada, vá na aba **Actions** do
repositório, clique no workflow **"Publicar no GitHub Pages"** e em **"Run
workflow"**.

**6. Autorize o domínio no Firebase**

Acompanhe o progresso na aba **Actions**; quando o deploy terminar, o link
final aparece em **Settings → Pages** (algo como
`https://seu-usuario.github.io/calculadora-he/`). Copie esse domínio e, no
painel do Firebase, vá em **Authentication → Settings → Authorized
domains → Add domain**, colando `seu-usuario.github.io` (sem o `https://`
e sem o caminho do repositório) — sem isso, o login funciona em localhost
mas falha em produção.

O Firebase (plano Spark) e o GitHub Pages são gratuitos — esse projeto não
tem custo nenhum para hospedar.

### Usando um domínio próprio (opcional)

Se você tiver um domínio (ex.: `ponto.seusite.com.br`), pode apontá-lo para
o GitHub Pages (Settings → Pages → Custom domain). Nesse caso, troque
`REPO_NAME` para `""` (vazio) no `next.config.js`, já que o site passa a
viver na raiz do domínio, sem o prefixo `/calculadora-he`.

## Convidando outras pessoas

Basta compartilhar o link do app. Cada pessoa clica em **"Criar conta"**,
cadastra o próprio e-mail/senha, e a partir daí tem seus próprios
lançamentos, salário e comparativo — completamente isolados dos de
qualquer outra pessoa que também use o app, graças às Regras de Segurança
do Firestore.

## Estrutura do projeto

```
app/
  login/page.tsx            → tela de entrar / criar conta
  page.tsx                  → painel com os meses da pessoa logada
  configuracoes/page.tsx    → salário base e % de risco (por pessoa)
  mes/page.tsx              → lançamentos, totais e comparativo de um mês
                               (o mês vem de ?m=AAAA-MM na URL, não de um
                               segmento dinâmico — necessário para export
                               estático)
contexts/
  AuthContext.tsx           → quem está logado, em qualquer tela do app
lib/
  firebase.ts                → inicializa o SDK do Firebase (Auth + Firestore)
  firestoreApi.ts             → todo o acesso a dados (substitui as antigas
                                 rotas de API: settings, months, entries,
                                 comparisons, summary)
  calc.ts                     → motor de cálculo (fórmulas de horas extras)
  authErrors.ts                → mensagens de erro do login, em português
components/
  AuthGuard.tsx               → protege uma página, exigindo login
  ...                         → peças de interface reutilizáveis
firestore.rules              → regras de segurança (cada pessoa só acessa
                                os próprios dados)
```

## Modelo de dados no Firestore

```
users/{uid}/settings/current            → { salarioBase, percentualRisco }
users/{uid}/months/{mes}                → { criadoEm }
users/{uid}/months/{mes}/entries/{id}   → lançamento de ponto
users/{uid}/months/{mes}/comparisons/{categoria}
                                          → { difMesAnterior, holeriteHoras }
```

Tudo vive dentro de `users/{uid}/...`, onde `uid` é o identificador único
que o Firebase Authentication atribui a cada conta — por isso os dados de
cada pessoa nunca se misturam.

## Ajustando as regras de cálculo

Toda a lógica de cálculo está concentrada em `lib/calc.ts`, sem nenhuma
dependência de banco de dados — são só funções puras, testáveis isoladamente.
Veja os comentários no próprio arquivo para entender de onde vem cada
fórmula (turnos que cruzam a meia-noite, turnos de 24h, adicional noturno
etc.).

Para verificar o motor de cálculo depois de qualquer alteração, rode:

```bash
npx tsx scripts/test-calc.ts
```
