"use client";

import { useRef, useState, type FormEvent } from "react";

import { Butterfly } from "@/components/Ornaments";
import { COMPANIONS_MAX, NOTE_MAX, validateRsvpInput } from "@/lib/rsvp-shared";

type Status = "idle" | "submitting" | "success";

type Confirmation = {
  name: string;
  companions: number;
  totalPeople: number;
  alreadyRegistered: boolean;
};

function newSubmissionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Alternativa para navegadores sem contexto seguro.
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function RsvpForm() {
  const [name, setName] = useState("");
  const [companions, setCompanions] = useState(0);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  // Mantido entre tentativas: o servidor usa esta chave para ignorar reenvios.
  const submissionIdRef = useRef<string>(newSubmissionId());
  const nameInputRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return; // trava contra duplo clique

    setFieldError(null);
    setFormError(null);

    const validation = validateRsvpInput({ name, companions, note });
    if (!validation.ok) {
      setFieldError({ field: validation.field, message: validation.message });
      if (validation.field === "name") nameInputRef.current?.focus();
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: validation.name,
          companions: validation.companions,
          note: validation.note,
          submissionId: submissionIdRef.current,
          website: honeypotRef.current?.value ?? "",
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            error?: string;
            field?: string;
            mode?: string;
            rsvp?: { name: string; companions: number; totalPeople: number };
          }
        | null;

      if (!response.ok || !payload?.ok) {
        const message = payload?.error ?? "Não foi possível registrar sua confirmação. Tente novamente.";
        if (payload?.field) setFieldError({ field: payload.field, message });
        else setFormError(message);
        setStatus("idle");
        return;
      }

      setConfirmation({
        name: payload.rsvp?.name ?? validation.name,
        companions: payload.rsvp?.companions ?? validation.companions,
        totalPeople: payload.rsvp?.totalPeople ?? validation.companions + 1,
        alreadyRegistered: payload.mode === "updated" || payload.mode === "duplicate",
      });
      setStatus("success");
    } catch {
      setFormError("Falha de conexão. Verifique sua internet e tente novamente.");
      setStatus("idle");
    }
  }

  function reset() {
    setName("");
    setCompanions(0);
    setNote("");
    setConfirmation(null);
    setFieldError(null);
    setFormError(null);
    setStatus("idle");
    submissionIdRef.current = newSubmissionId();
  }

  if (status === "success" && confirmation) {
    const people = confirmation.totalPeople;
    return (
      <div className="rsvp__done" role="status" aria-live="polite">
        <span className="rsvp__done-mark">
          <Butterfly beat="4.5s" />
        </span>
        <h3 className="rsvp__done-title">
          {confirmation.alreadyRegistered ? "Confirmação atualizada" : "Presença confirmada"}
        </h3>
        <p className="rsvp__done-name">{confirmation.name}</p>
        <p className="rsvp__done-summary">
          {people === 1 ? "1 pessoa" : `${people} pessoas`}
          {confirmation.companions > 0
            ? ` · ${confirmation.companions} ${confirmation.companions === 1 ? "acompanhante" : "acompanhantes"}`
            : ""}
        </p>
        <p className="rsvp__done-text">
          Que alegria receber você. Guardamos seu lugar com todo o carinho.
        </p>
        <button type="button" className="rsvp__done-reset" onClick={reset}>
          Confirmar outro convidado
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";
  const companionsHelp = `Ate ${COMPANIONS_MAX} acompanhantes.`;

  return (
    <form className="rsvp__form" onSubmit={handleSubmit} noValidate>
      <div className={`field${fieldError?.field === "name" ? " field--invalid" : ""}`}>
        <label className="field__label" htmlFor="rsvp-name">
          Nome completo
        </label>
        <div className="field__control">
          <input
            id="rsvp-name"
            ref={nameInputRef}
            className="field__input"
            type="text"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            enterKeyHint="next"
            maxLength={80}
            placeholder="Como devemos chamar você"
            aria-invalid={fieldError?.field === "name"}
            aria-describedby={fieldError?.field === "name" ? "rsvp-name-error" : undefined}
            disabled={submitting}
            required
          />
        </div>
        {fieldError?.field === "name" ? (
          <span className="field__error" id="rsvp-name-error">
            {fieldError.message}
          </span>
        ) : null}
      </div>

      <div className={`field${fieldError?.field === "companions" ? " field--invalid" : ""}`}>
        <label className="field__label" htmlFor="rsvp-companions">
          Quantidade de acompanhantes
        </label>
        <div className="stepper">
          <button
            type="button"
            className="stepper__btn"
            onClick={() => setCompanions((value) => Math.max(0, value - 1))}
            disabled={submitting || companions <= 0}
            aria-label="Remover um acompanhante"
          >
            <svg viewBox="0 0 14 2" width="14" height="2" aria-hidden="true">
              <path d="M0 1h14" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
          <input
            id="rsvp-companions"
            className="stepper__input"
            type="number"
            inputMode="numeric"
            name="companions"
            min={0}
            max={COMPANIONS_MAX}
            step={1}
            value={companions}
            onChange={(event) => {
              const parsed = Number(event.target.value);
              if (Number.isNaN(parsed)) return setCompanions(0);
              setCompanions(Math.min(COMPANIONS_MAX, Math.max(0, Math.floor(parsed))));
            }}
            disabled={submitting}
            aria-describedby="rsvp-companions-help"
          />
          <button
            type="button"
            className="stepper__btn"
            onClick={() => setCompanions((value) => Math.min(COMPANIONS_MAX, value + 1))}
            disabled={submitting || companions >= COMPANIONS_MAX}
            aria-label="Adicionar um acompanhante"
          >
            <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
              <path d="M0 7h14M7 0v14" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>
        <span className="field__hint" id="rsvp-companions-help">
          {fieldError?.field === "companions" ? fieldError.message : companionsHelp}
        </span>
      </div>

      <div className={`field${fieldError?.field === "note" ? " field--invalid" : ""}`}>
        <label className="field__label" htmlFor="rsvp-note">
          Recado para a Manuela <span aria-hidden="true">(opcional)</span>
        </label>
        <div className="field__control">
          <textarea
            id="rsvp-note"
            className="field__textarea"
            name="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={NOTE_MAX}
            rows={2}
            placeholder="Deixe um carinho, se quiser"
            disabled={submitting}
          />
        </div>
        {fieldError?.field === "note" ? (
          <span className="field__error">{fieldError.message}</span>
        ) : null}
      </div>

      {/* Campo isca contra robos: invisivel e ignorado por leitores de tela. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="rsvp-website">Não preencha este campo</label>
        <input
          id="rsvp-website"
          ref={honeypotRef}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {formError ? (
        <p className="rsvp__alert" role="alert">
          {formError}
        </p>
      ) : null}

      <button type="submit" className="btn btn--solid rsvp__submit" disabled={submitting}>
        <span>{submitting ? "Enviando" : "Confirmar presença"}</span>
        {submitting ? <span className="spinner" aria-hidden="true" /> : null}
      </button>

      <p className="rsvp__legal">
        Usamos suas informações apenas para organizar o cha de bebe.
      </p>
    </form>
  );
}
