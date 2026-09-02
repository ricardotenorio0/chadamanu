/**
 * Sessão do painel administrativo.
 *
 * Token assinado com HMAC-SHA256 via Web Crypto, compativel tanto com o runtime
 * Node quanto com o Edge (usado pelo middleware). Nenhum segredo chega ao
 * cliente: o cookie e httpOnly e guarda apenas o payload assinado.
 */

const encoder = new TextEncoder();

export const SESSION_COOKIE = "manuela_admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

export type SessionPayload = {
  /** usuário */
  u: string;
  /** emitido em (segundos) */
  iat: number;
  /** expira em (segundos) */
  exp: number;
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error(
      "SESSION_SECRET ausente ou muito curta. Defina uma chave aleatoria com pelo menos 32 caracteres."
    );
  }
  return secret;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

/** Comparacao em tempo constante, para não vazar informação por timing. */
export function timingSafeEqual(a: string, b: string): boolean {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  const length = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;
  for (let i = 0; i < length; i += 1) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

export async function createSessionToken(username: string): Promise<string> {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { u: username, iat: now, exp: now + SESSION_MAX_AGE_SECONDS };
  const body = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(body, secret);
  return `${body}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return null;
  }

  let expected: string;
  try {
    expected = await sign(body, secret);
  } catch {
    return null;
  }
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body))) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (typeof payload.u !== "string" || payload.u.length === 0) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME?.trim() || "admin";
}

/** Confere as credenciais informadas contra as variáveis de ambiente. */
export function checkAdminCredentials(username: string, password: string): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    throw new Error("ADMIN_PASSWORD não configurada nas variáveis de ambiente.");
  }
  // As duas comparacoes sempre executam, para manter o tempo de resposta estável.
  const userOk = timingSafeEqual(username.trim().toLowerCase(), getAdminUsername().toLowerCase());
  const passOk = timingSafeEqual(password, expectedPassword);
  return userOk && passOk;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && Boolean(process.env.SESSION_SECRET);
}

export function sessionCookieOptions(maxAge: number = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Hash estável do IP: permite limitar tentativas sem armazenar o IP em claro. */
export async function hashKey(value: string): Promise<string> {
  const salt = process.env.SESSION_SECRET ?? "manuela";
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${salt}:${value}`));
  return base64UrlEncode(new Uint8Array(digest)).slice(0, 32);
}
