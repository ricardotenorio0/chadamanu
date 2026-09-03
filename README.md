# Chá de Bebê da Manuela

Convite digital com confirmação de presença (RSVP) e painel administrativo.
Construído para rodar na **Vercel** com banco **Neon PostgreSQL**.

- Convite: `/`
- Painel de confirmações: `/admin` (protegido por login)

**Stack:** Next.js 15 (App Router) · TypeScript · PostgreSQL (Neon) · CSS próprio,
sem framework de UI. Sem servidor persistente, sem Docker, sem processos em
background: tudo roda em funções serverless.

**Design:** identidade em rosa pastel e neutros quentes, cartões arredondados e
tipografia dupla — *Kissing Season* para nomes e palavras-chave, *Sora* para
toda a interface. Mobile first. Veja a seção 9.

---

## 1. Como conectar o Neon

1. Crie uma conta em <https://neon.tech> e um projeto novo.
2. No painel do projeto, abra **Connect** (ou *Connection Details*).
3. Copie a **connection string** do endpoint **pooled** — o host contém `-pooler`.
   É o endpoint recomendado para ambientes serverless.

   ```
   postgresql://usuario:senha@ep-nome-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

4. Guarde essa string: ela é o valor de `DATABASE_URL`.

O projeto usa o driver HTTP `@neondatabase/serverless`, que abre uma requisição
por consulta em vez de manter conexões vivas — o modelo correto para a Vercel.

---

## 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | Connection string do Neon (endpoint *pooled*). |
| `ADMIN_PASSWORD` | sim | Senha de acesso ao `/admin`. Use uma senha longa e exclusiva. |
| `SESSION_SECRET` | sim | Chave que assina o cookie de sessão. Mínimo de 32 caracteres. |
| `ADMIN_USERNAME` | não | Usuário do painel. Padrão: `admin`. |
| `NEXT_PUBLIC_EVENT_DATE` | não | Data/hora do evento em ISO 8601. Padrão: `2026-10-10T14:30:00-03:00`. |
| `DATABASE_DRIVER` | não | `neon` ou `postgres`. Detectado automaticamente pela URL. |

Gere um `SESSION_SECRET` seguro:

```bash
openssl rand -base64 48
```

> Nenhum desses valores chega ao navegador. Apenas variáveis com o prefixo
> `NEXT_PUBLIC_` são expostas ao cliente, e a única usada é a data do evento.

---

## 3. Como executar as migrations

```bash
npm run db:migrate    # aplica as migrations pendentes
npm run db:status     # mostra o que já foi aplicado
```

O executor lê `DATABASE_URL` de `.env.local` (ou `.env`), registra cada arquivo
aplicado na tabela `schema_migrations` e roda cada migration dentro de uma
transação. Rodar duas vezes é seguro: as já aplicadas são ignoradas.

Os arquivos ficam em `migrations/`, aplicados em ordem alfabética:

| Arquivo | O que cria |
| --- | --- |
| `0001_init.sql` | Tabela `rsvps`, índices, restrições e trigger de `updated_at`. |
| `0002_rate_limit.sql` | Tabela `rate_limit_events`, usada para limitar tentativas. |

Para uma alteração futura, **crie um novo arquivo** (`0003_...sql`) em vez de
editar um existente — o executor avisa se o conteúdo de uma migration já
aplicada mudou.

### Esquema da tabela `rsvps`

| Coluna | Tipo | Observação |
| --- | --- | --- |
| `id` | `uuid` | Chave primária, gerada pelo banco. |
| `name` | `text` | Nome do convidado (2 a 80 caracteres). |
| `name_key` | `text` | Nome normalizado (sem acentos, minúsculo). **Único**: impede duplicatas. |
| `companions` | `smallint` | Quantidade de acompanhantes (0 a 20 no banco, 0 a 10 no formulário). |
| `status` | `text` | `confirmed`, `pending` ou `cancelled`. |
| `note` | `text` | Recado opcional (até 280 caracteres). |
| `submission_id` | `uuid` | Chave de idempotência do formulário. **Única** quando preenchida. |
| `source` | `text` | Origem do registro. |
| `created_at` | `timestamptz` | Data e hora da confirmação. |
| `updated_at` | `timestamptz` | Atualizada automaticamente por trigger. |

O total de pessoas de cada linha é `companions + 1` (o próprio convidado).

---

## 4. Como executar o projeto localmente

```bash
npm install
cp .env.example .env.local     # preencha DATABASE_URL, ADMIN_PASSWORD e SESSION_SECRET
npm run db:migrate
npm run dev                    # http://localhost:3000
```

Comandos disponíveis:

| Comando | Função |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento. |
| `npm run build` | Build de produção. |
| `npm start` | Sobe o build de produção. |
| `npm run lint` | ESLint. |
| `npm run db:migrate` | Aplica as migrations. |
| `npm run db:status` | Lista o estado das migrations. |

### PostgreSQL local (opcional)

Se preferir desenvolver sem depender do Neon, aponte a `DATABASE_URL` para um
PostgreSQL local. O projeto detecta hosts locais e usa o driver nativo `pg`
automaticamente, sem nenhuma outra mudança:

```
DATABASE_URL="postgresql://postgres@127.0.0.1:5432/manuela"
```

Em produção, com um host do Neon, o driver HTTP é usado.

---

## 5. Como fazer o deploy na Vercel

1. Suba o repositório para o GitHub.
2. Em <https://vercel.com>, **Add New → Project** e importe o repositório.
   O framework Next.js é detectado sozinho; não é preciso mudar nada no build.
3. Em **Settings → Environment Variables**, cadastre para *Production* (e para
   *Preview*, se quiser): `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET` e,
   se desejar, `ADMIN_USERNAME` e `NEXT_PUBLIC_EVENT_DATE`.
4. Clique em **Deploy**.
5. Rode as migrations **uma vez** apontando para o banco de produção:

   ```bash
   DATABASE_URL="<connection string do Neon>" npm run db:migrate
   ```

   Pode ser da sua máquina — o Neon aceita conexões externas. O passo não
   precisa acontecer dentro da Vercel.
6. Abra `/admin`, faça login e confirme que o painel carrega a lista.

### Integração Vercel + Neon (alternativa)

No Marketplace da Vercel existe a integração oficial do Neon. Ao conectá-la, a
variável `DATABASE_URL` é criada automaticamente no projeto. Nesse caso pule o
cadastro manual dessa variável — as demais continuam necessárias.

---

## 6. Como funciona a confirmação de presença

```
convidado → formulário no convite
          → POST /api/rsvp  (validação + limite de envios)
          → INSERT/UPDATE na tabela rsvps do Neon
          → confirmação visual na tela
organizador → /admin (login)
          → GET/POST/PATCH/DELETE /api/admin/rsvps
```

Proteções contra envio duplicado:

- **Botão travado** enquanto o envio está em andamento.
- **`submission_id`**: cada formulário gera uma chave única. Se a mesma chave
  chegar duas vezes (duplo clique, retry de rede), o servidor devolve o
  registro já criado em vez de inserir outro.
- **`name_key` único**: se a mesma pessoa confirmar de novo, o registro é
  atualizado — a lista nunca ganha uma linha repetida.
- **Limite por IP**: no máximo 8 envios a cada 10 minutos.
- **Campo isca (honeypot)** invisível, para robôs.

### Endpoints

| Método | Rota | Acesso | Função |
| --- | --- | --- | --- |
| `POST` | `/api/rsvp` | público | Registra ou atualiza uma confirmação. |
| `POST` | `/api/admin/login` | público | Cria a sessão do administrador. |
| `POST` | `/api/admin/logout` | público | Encerra a sessão. |
| `GET` | `/api/admin/session` | público | Informa se há sessão ativa. |
| `GET` | `/api/admin/rsvps` | protegido | Lista com busca, filtro, ordenação, paginação e indicadores. |
| `POST` | `/api/admin/rsvps` | protegido | Cria uma confirmação manualmente. |
| `GET` | `/api/admin/rsvps/[id]` | protegido | Detalhes de uma confirmação. |
| `PATCH` | `/api/admin/rsvps/[id]` | protegido | Edita nome, acompanhantes, status ou recado. |
| `DELETE` | `/api/admin/rsvps/[id]` | protegido | Exclui uma confirmação. |
| `GET` | `/api/admin/export` | protegido | Exporta tudo em CSV (separador `;`, com BOM para o Excel). |

---

## 7. Segurança do painel

- `/admin` e `/api/admin/*` passam pelo `middleware.ts`; cada rota de API também
  valida a sessão por conta própria (defesa em camadas).
- A sessão é um token assinado com **HMAC-SHA256** guardado em cookie
  `httpOnly`, `SameSite=Lax` e `Secure` em produção. Validade de 8 horas.
- Senha e chave de assinatura vivem apenas em variáveis de ambiente do servidor.
- Comparação de credenciais em tempo constante.
- Limite de 8 tentativas de login a cada 15 minutos por IP, com o controle
  persistido no banco (em serverless não existe memória compartilhada).
- O painel não é indexado por buscadores (`robots: noindex`).

---

## 8. Estrutura do projeto

```
migrations/            SQL versionado, aplicado por scripts/migrate.mjs
scripts/migrate.mjs    Executor de migrations
src/app/               Rotas (convite, /admin e /api)
src/components/        Componentes do convite e do painel
src/lib/               Banco, autenticação, repositório e validações
src/styles/            Estilos do convite e do painel
public/fonts/          Local opcional da fonte decorativa (veja a seção 9)
src/middleware.ts      Proteção das rotas administrativas
```

---

## 9. Personalização

Dados do evento ficam em `src/lib/event.ts`: nome, frase de abertura, data,
horário, local, endereço e limite de acompanhantes. O link do Google Maps é
montado a partir do local e do endereço. A data usada pela contagem regressiva
pode ser trocada sem alterar código, pela variável `NEXT_PUBLIC_EVENT_DATE`.

A duração usada no botão *Adicionar ao calendário* vem de `durationHours`, no
mesmo arquivo — só o convite de agenda usa esse valor.

### Sistema de design

Todos os tokens ficam em `src/app/globals.css`, no bloco `:root`, e valem tanto
para o convite quanto para o painel:

| Grupo | Tokens | Para que serve |
| --- | --- | --- |
| Superfícies | `--c-bg`, `--c-card`, `--c-card-soft`, `--c-card-tint`, `--c-dark` | Fundos de página, cartões e faixas escuras |
| Tinta | `--c-ink`, `--c-ink-2`, `--c-ink-3`, `--c-on-dark` | Hierarquia de texto |
| Acento | `--c-accent`, `--c-accent-strong`, `--c-accent-ink`, `--c-accent-soft` | CTAs, selos, estados e destaques |
| Apoio | `--c-honey`, `--c-lilac`, `--c-mint` | Doses pequenas: ícones, selos e confirmação |
| Forma | `--r-xs` … `--r-2xl`, `--r-pill` | Raios padronizados |
| Profundidade | `--sh-xs` … `--sh-lg`, `--sh-cta` | Sombras sempre rosadas, nunca cinzas |
| Ritmo | `--sp-1` … `--sp-20`, `--gutter`, `--section-y` | Espaçamentos |
| Movimento | `--ease`, `--ease-out`, `--t-fast`, `--t-mid`, `--t-slow` | Transições e animações |

As peças reutilizáveis (`.btn`, `.card`, `.badge`, `.icon-chip`, `.field`,
`.eyebrow`, `.reveal`) também vivem em `globals.css`. `src/styles/invite.css`
cuida da composição das seções e `src/styles/admin.css`, do painel.

Toda animação respeita `prefers-reduced-motion`.

### A fonte Kissing Season

A fonte decorativa é declarada por `@font-face` em `src/app/globals.css` e é
carregada de <https://manu.cuptickers.online/Kissing%20Season.ttf>.

Para servi-la pela própria origem — o que evita uma conexão externa e o risco
de o arquivo sair do ar — basta salvar o arquivo como
`public/fonts/kissing-season.ttf`. A regra já tenta essa cópia local primeiro e
só recorre à URL externa se ela não existir; nada além disso precisa mudar.

A *Sora* vem do Google Fonts via `next/font`, otimizada em tempo de build.
