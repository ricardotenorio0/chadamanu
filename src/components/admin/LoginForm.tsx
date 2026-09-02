"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);

    if (password.trim().length === 0) {
      setError("Informe a senha de acesso.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Não foi possível entrar. Tente novamente.");
        setPassword("");
        setSubmitting(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Falha de conexão. Verifique sua internet e tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <form className="login__form" onSubmit={handleSubmit} noValidate>
      {error ? (
        <p className="notice notice--error" role="alert" style={{ marginBottom: 0 }}>
          {error}
        </p>
      ) : null}

      <div>
        <label className="field-label" htmlFor="admin-user">
          Usuário
        </label>
        <input
          id="admin-user"
          className="input"
          type="text"
          name="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          disabled={submitting}
        />
      </div>

      <div>
        <label className="field-label" htmlFor="admin-password">
          Senha
        </label>
        <input
          id="admin-password"
          className="input"
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          disabled={submitting}
          required
        />
      </div>

      <button type="submit" className="ui-btn ui-btn--primary ui-btn--block" disabled={submitting}>
        {submitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
