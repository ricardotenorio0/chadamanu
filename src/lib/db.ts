import { neon } from "@neondatabase/serverless";

/**
 * Camada de acesso ao banco.
 *
 * Em produção usa o driver HTTP do Neon: sem conexões persistentes, sem pool e
 * sem processo em background — o modelo esperado por funções serverless.
 *
 * Quando a DATABASE_URL aponta para um PostgreSQL local (desenvolvimento ou
 * testes), cai automaticamente no driver `pg`, que fala o protocolo nativo.
 * A escolha é feita pela URL; nenhuma configuração extra é necessária para o
 * deploy na Vercel.
 */

export type SqlClient = {
  query<T>(text: string, params?: unknown[]): Promise<T[]>;
};

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "DATABASE_URL não configurada. Defina a string de conexão do Neon nas variáveis de ambiente."
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

function connectionString(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) throw new DatabaseNotConfiguredError();
  return url;
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function isLocalHost(url: string): boolean {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

function usesHttpDriver(url: string): boolean {
  const driver = process.env.DATABASE_DRIVER?.toLowerCase();
  if (driver === "neon") return true;
  if (driver === "postgres" || driver === "pg") return false;
  // Somente hosts locais usam o driver nativo por padrão.
  return !isLocalHost(url);
}

type PgPool = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>;
};

// Reaproveitado entre invocações na mesma instância serverless.
const globalForDb = globalThis as unknown as {
  __manuelaSql?: { url: string; client: SqlClient };
  __manuelaPgPool?: { url: string; pool: PgPool };
};

async function createPgClient(url: string): Promise<SqlClient> {
  if (globalForDb.__manuelaPgPool?.url !== url) {
    const { Pool } = await import("pg");
    globalForDb.__manuelaPgPool = {
      url,
      pool: new Pool({
        connectionString: url,
        max: 3,
        idleTimeoutMillis: 10_000,
        ssl: isLocalHost(url) ? undefined : { rejectUnauthorized: true },
      }) as unknown as PgPool,
    };
  }

  const { pool } = globalForDb.__manuelaPgPool;
  return {
    async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
      const result = await pool.query(text, params);
      return result.rows as T[];
    },
  };
}

function createNeonClient(url: string): SqlClient {
  const sql = neon(url);
  return {
    async query<T>(text: string, params: unknown[] = []): Promise<T[]> {
      return (await sql.query(text, params)) as unknown as T[];
    },
  };
}

export async function getDb(): Promise<SqlClient> {
  const url = connectionString();

  if (globalForDb.__manuelaSql?.url === url) return globalForDb.__manuelaSql.client;

  const client = usesHttpDriver(url) ? createNeonClient(url) : await createPgClient(url);
  globalForDb.__manuelaSql = { url, client };
  return client;
}

/** Código de violação de restrição única no PostgreSQL. */
export const UNIQUE_VIOLATION = "23505";

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === UNIQUE_VIOLATION
  );
}
