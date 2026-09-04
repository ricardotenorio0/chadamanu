"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Sparkle } from "@/components/Icons";
import { Balloon, Butterfly, Flower, Sprig } from "@/components/Ornaments";

export type DecorItem = {
  kind: "butterfly" | "flower" | "balloon" | "sprig" | "sparkle";
  /** Posição relativa à seção. */
  x: string;
  y: string;
  size: string;
  tone?: "rose" | "baby" | "honey" | "lilac" | "mint" | "sky";
  /** Atraso da entrada e do balanço, em segundos. */
  delay?: number;
  /** Duração do movimento contínuo. */
  duration?: string;
  rotate?: number;
  opacity?: number;
};

export type SparkleSpot = {
  x: string;
  y: string;
  size: string;
  delay?: string;
  duration?: string;
  tone?: "rose" | "honey" | "lilac" | "light";
};

const SHAPES = {
  butterfly: Butterfly,
  flower: Flower,
  balloon: Balloon,
  sprig: Sprig,
  sparkle: Sparkle,
} as const;

/**
 * Camada de enfeites da seção. Os elementos entram um a um quando a seção
 * aparece na tela e depois ficam num movimento lento e contínuo — voo, balanço
 * ou flutuação, conforme a peça. Nada disso é clicável nem lido por leitores
 * de tela.
 */
export function Decor({ items }: { items: DecorItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`decor${visible ? " is-visible" : ""}`}
      aria-hidden="true"
    >
      {items.map((item, index) => {
        const Shape = SHAPES[item.kind];
        return (
          <span
            key={index}
            className={`decor__item decor__item--${item.kind} decor__item--${item.tone ?? "rose"}`}
            style={
              {
                left: item.x,
                top: item.y,
                width: item.size,
                "--delay": `${item.delay ?? 0}s`,
                "--dur": item.duration ?? "16s",
                "--rot": `${item.rotate ?? 0}deg`,
                "--o": item.opacity ?? 1,
              } as CSSProperties
            }
          >
            <span className="decor__move">
              <Shape />
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** Brilhos discretos, usados junto aos títulos e às fotos. */
export function Sparkles({ spots }: { spots: SparkleSpot[] }) {
  return (
    <div className="sparkles" aria-hidden="true">
      {spots.map((spot, index) => (
        <span
          key={index}
          className={`sparkles__item sparkles__item--${spot.tone ?? "rose"}`}
          style={{
            left: spot.x,
            top: spot.y,
            width: spot.size,
            height: spot.size,
            animationDelay: spot.delay ?? "0s",
            animationDuration: spot.duration ?? "6s",
          }}
        >
          <Sparkle />
        </span>
      ))}
    </div>
  );
}

/** Manchas de luz suaves ao fundo. As posições variam por seção. */
export function Aura({ variant = "hero" }: { variant?: "hero" | "soft" | "cream" }) {
  return <div className={`aura aura--${variant}`} aria-hidden="true" />;
}
