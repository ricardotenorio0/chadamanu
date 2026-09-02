"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { Balloon, Butterfly, Sprig } from "@/components/Ornaments";

export type DecorItem = {
  kind: "butterfly" | "balloon" | "sprig";
  /** Posição relativa a secao. */
  x: string;
  y: string;
  size: string;
  opacity?: number;
  /** Intensidade do parallax: valores baixos mantém o efeito discreto. */
  depth?: number;
  rotate?: number;
  delay?: string;
  duration?: string;
  color?: string;
  /** Ritmo do bater de asas das borboletas. */
  beat?: string;
  still?: boolean;
};

/**
 * Camada decorativa das secoes.
 * O parallax e calculado a partir da posição da secao na viewport e limitado a
 * poucos pixels, apenas o suficiente para dar profundidade.
 */
export function Decor({ items }: { items: DecorItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const nodes = Array.from(container.querySelectorAll<HTMLElement>(".decor__item"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = container.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = window.innerHeight / 2 - center;

      for (const node of nodes) {
        const depth = Number(node.dataset.depth ?? 0);
        node.style.setProperty("--py", `${(offset * depth).toFixed(2)}px`);
      }
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="decor" ref={containerRef} aria-hidden="true">
      {items.map((item, index) => {
        const style = {
          "--x": item.x,
          "--y": item.y,
          "--size": item.size,
          "--o": item.opacity ?? 0.5,
          "--delay": item.delay ?? "0s",
          "--dur": item.duration ?? "18s",
          color: item.color,
        } as CSSProperties;

        return (
          <div
            key={index}
            className={[
              "decor__item",
              item.kind === "balloon" ? "decor__item--balloon" : "",
              item.still ? "decor__item--still" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            data-depth={item.depth ?? 0.05}
            style={style}
          >
            <span
              className="decor__float"
              style={item.rotate ? { rotate: `${item.rotate}deg`, display: "block" } : undefined}
            >
              {item.kind === "butterfly" ? <Butterfly beat={item.beat} /> : null}
              {item.kind === "balloon" ? <Balloon /> : null}
              {item.kind === "sprig" ? <Sprig /> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
