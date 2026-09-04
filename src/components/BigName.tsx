"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_PX = 288; // teto: 18rem, para não estourar no desktop
const MIN_PX = 56;
const FILL = 0.99; // margem de segurança nas laterais

/**
 * O nome é o elemento mais forte da página, então ele ocupa toda a largura
 * disponível — seja qual for a fonte que o navegador conseguir carregar.
 *
 * Como a Kissing Season é decorativa (e pode nem chegar, se a origem estiver
 * fora do ar), medir é mais seguro do que confiar num `clamp` fixo: renderiza
 * uma vez, mede o texto e escolhe o tamanho que preenche a linha. Antes disso
 * — e sem JavaScript — vale o tamanho declarado no CSS.
 */
export function BigName({ text, className }: { text: string; className?: string }) {
  const boxRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState<number | null>(null);

  const measure = useCallback(() => {
    const box = boxRef.current;
    const node = textRef.current;
    if (!box || !node) return;

    const available = box.clientWidth;
    if (available === 0) return;

    // Mede numa base conhecida e regra de três: uma medição só por ciclo.
    const previous = node.style.fontSize;
    node.style.fontSize = "100px";
    const width = node.getBoundingClientRect().width;
    node.style.fontSize = previous;
    if (width === 0) return;

    const ideal = (available * FILL * 100) / width;
    setSize(Math.max(MIN_PX, Math.min(MAX_PX, ideal)));
  }, []);

  useEffect(() => {
    measure();

    // A fonte decorativa costuma chegar depois da primeira pintura.
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    if (boxRef.current) observer.observe(boxRef.current);
    return () => observer.disconnect();
  }, [measure]);

  return (
    <span className={["big-name", className].filter(Boolean).join(" ")} ref={boxRef}>
      <span
        className="big-name__text"
        ref={textRef}
        style={size ? { fontSize: `${size}px` } : undefined}
      >
        {text}
      </span>
    </span>
  );
}
