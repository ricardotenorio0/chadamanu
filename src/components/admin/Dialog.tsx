"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { CloseIcon } from "@/components/admin/icons";

type DialogProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Diálogo modal simples: fecha com Escape ou clique fora, e devolve o foco. */
export function Dialog({ title, onClose, children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="dialog"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panelRef}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <h2 className="dialog__title">{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
