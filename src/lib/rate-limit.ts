import { getDb } from "@/lib/db";
import { hashKey } from "@/lib/auth";

/**
 * Limitador de tentativas persistido no banco.
 * Em ambiente serverless não existe memória compartilhada entre invocações,
 * então o controle precisa viver no PostgreSQL.
 */
export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

export async function checkRateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const db = await getDb();
    const keyHash = await hashKey(key);

    const rows = await db.query<{ hits: number; oldest: string | Date }>(
      `SELECT count(*)::int AS hits,
              COALESCE(min(created_at), now()) AS oldest
         FROM rate_limit_events
        WHERE bucket = $1
          AND key_hash = $2
          AND created_at > now() - make_interval(secs => $3::int)`,
      [bucket, keyHash, windowSeconds]
    );

    const hits = rows[0]?.hits ?? 0;

    if (hits >= limit) {
      const oldest = new Date(rows[0].oldest).getTime();
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldest + windowSeconds * 1000 - Date.now()) / 1000)
      );
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    await db.query("INSERT INTO rate_limit_events (bucket, key_hash) VALUES ($1, $2)", [
      bucket,
      keyHash,
    ]);

    // Limpeza oportunista: mantém a tabela pequena sem precisar de cron.
    if (Math.random() < 0.05) {
      await db
        .query("DELETE FROM rate_limit_events WHERE created_at < now() - interval '1 day'")
        .catch(() => {});
    }

    return { allowed: true, remaining: limit - hits - 1, retryAfterSeconds: 0 };
  } catch {
    // O limitador nunca deve derrubar a aplicação: em caso de falha, libera.
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}

/** Extrai o IP do cliente a partir dos cabeçalhos do proxy da Vercel. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "desconhecido";
}
