#!/usr/bin/env node
/**
 * Executor de migrations.
 *
 *   npm run db:migrate    aplica as migrations pendentes
 *   npm run db:status     apenas lista o que já foi aplicado
 *
 * Lê a DATABASE_URL de .env.local, .env.development.local ou .env.
 * Roda fora do runtime da Vercel (local ou CI), por isso usa o driver `pg`
 * padrão, que aceita vários comandos SQL em um único arquivo.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const migrationsDir = path.join(rootDir, "migrations");

for (const file of [".env.local", ".env.development.local", ".env"]) {
  const full = path.join(rootDir, file);
  if (existsSync(full)) dotenv.config({ path: full, override: false });
}

const statusOnly = process.argv.includes("--status");
const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  console.error(
    "\n  DATABASE_URL não encontrada.\n" +
      "  Copie .env.example para .env.local e preencha com a string de conexão do Neon.\n"
  );
  process.exit(1);
}

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function isLocal(url) {
  try {
    return LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

const client = new pg.Client({
  connectionString,
  ssl: isLocal(connectionString) ? false : { rejectUnauthorized: true },
});

const checksum = (contents) => createHash("sha256").update(contents).digest("hex").slice(0, 16);

async function main() {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name        text        PRIMARY KEY,
      checksum    text        NOT NULL,
      applied_at  timestamptz NOT NULL DEFAULT now()
    );
  `);

  const { rows: applied } = await client.query(
    "SELECT name, checksum, applied_at FROM schema_migrations ORDER BY name"
  );
  const appliedByName = new Map(applied.map((row) => [row.name, row]));

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  if (statusOnly) {
    console.log("\n  Migrations\n  ----------");
    for (const file of files) {
      const record = appliedByName.get(file);
      console.log(
        record
          ? `  [x] ${file}  (aplicada em ${new Date(record.applied_at).toLocaleString("pt-BR")})`
          : `  [ ] ${file}  (pendente)`
      );
    }
    console.log("");
    return;
  }

  let pending = 0;

  for (const file of files) {
    const sql = readFileSync(path.join(migrationsDir, file), "utf8");
    const sum = checksum(sql);
    const record = appliedByName.get(file);

    if (record) {
      if (record.checksum !== sum) {
        console.warn(
          `  ! ${file} já foi aplicada, mas o conteúdo mudou. ` +
            "Crie uma nova migration em vez de editar uma existente."
        );
      }
      continue;
    }

    pending += 1;
    process.stdout.write(`  -> aplicando ${file} ... `);
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)", [
        file,
        sum,
      ]);
      await client.query("COMMIT");
      console.log("ok");
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("falhou");
      throw error;
    }
  }

  console.log(pending === 0 ? "\n  Banco já esta atualizado.\n" : `\n  ${pending} migration(s) aplicada(s).\n`);
}

main()
  .catch((error) => {
    console.error("\n  Erro ao executar as migrations:\n ", error.message, "\n");
    process.exitCode = 1;
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });
