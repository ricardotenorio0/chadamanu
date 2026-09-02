/**
 * Ornamentos desenhados em SVG inline: leves, nitidos em qualquer densidade de
 * tela e sem nenhuma requisição extra de rede.
 */

import type React from "react";

type OrnamentProps = { className?: string; beat?: string };

export function Butterfly({ className, beat = "5.5s" }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={["butterfly", className].filter(Boolean).join(" ")}
    >
      <g
        className="butterfly__wings"
        style={{ "--beat": beat } as React.CSSProperties}
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      >
        {/* Asas superiores: maiores, abertas para cima. */}
        <path
          d="M50 32C42 13 22 3 12 11 3 19 12 41 50 52Z"
          fill="currentColor"
          fillOpacity={0.13}
        />
        <path
          d="M50 32C58 13 78 3 88 11c9 8 0 30-38 41Z"
          fill="currentColor"
          fillOpacity={0.13}
        />
        {/* Asas inferiores: menores, voltadas para baixo. */}
        <path
          d="M50 52C34 58 22 66 22 76c0 8 11 8 18 0 5-6 9-14 10-24Z"
          fill="currentColor"
          fillOpacity={0.08}
        />
        <path
          d="M50 52c16 6 28 14 28 24 0 8-11 8-18 0-5-6-9-14-10-24Z"
          fill="currentColor"
          fillOpacity={0.08}
        />
      </g>
      <g stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        {/* Corpo e antenas. */}
        <path
          d="M50 27c2.4 7 3 32 0 51-3-19-2.4-44 0-51Z"
          fill="currentColor"
          fillOpacity={0.5}
        />
        <path d="M50 28c-4-8-10-13-16-15" />
        <path d="M50 28c4-8 10-13 16-15" />
        <circle cx="33" cy="12.4" r="1.5" fill="currentColor" fillOpacity={0.45} />
        <circle cx="67" cy="12.4" r="1.5" fill="currentColor" fillOpacity={0.45} />
      </g>
    </svg>
  );
}

export function Balloon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 80" fill="none" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M24 2c11.2 0 20 9.5 20 21.2 0 12.6-9.7 22.9-20 27.3C13.7 46.1 4 35.8 4 23.2 4 11.5 12.8 2 24 2Z"
        fill="currentColor"
        fillOpacity={0.34}
      />
      <path
        d="M24 2c11.2 0 20 9.5 20 21.2 0 12.6-9.7 22.9-20 27.3C13.7 46.1 4 35.8 4 23.2 4 11.5 12.8 2 24 2Z"
        stroke="currentColor"
        strokeOpacity={0.28}
        strokeWidth={0.7}
      />
      <path d="M21.8 50.2h4.4L24 54.2Z" fill="currentColor" fillOpacity={0.42} />
      <path
        d="M24 54.4c3.2 5.4-4 7.4-1.1 13.2 1.7 3.4 1.1 6-1.1 7.6"
        stroke="currentColor"
        strokeOpacity={0.26}
        strokeWidth={0.7}
        strokeLinecap="round"
      />
      <ellipse
        cx="15.5"
        cy="17"
        rx="3.8"
        ry="5.6"
        fill="#ffffff"
        fillOpacity={0.42}
        transform="rotate(-24 15.5 17)"
      />
    </svg>
  );
}

export function Sprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 44 112"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={["sprig", className].filter(Boolean).join(" ")}
    >
      <g stroke="currentColor" strokeWidth={0.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 112c0-27-2-55-10-82-2-6.4-4-12-4-18" />
        <path d="M21.2 93.5c6.4-1.6 10.6-7 10.6-13.4-6.4 0-10.8 5.2-10.6 13.4Z" />
        <path d="M18.6 75.5c-6.2-2.2-9.4-8-8.4-14.2 6.2 1.2 9.2 6.2 8.4 14.2Z" />
        <path d="M15.8 57c6.2-2.8 9.2-8.4 8-14.4-6 1.4-8.8 6.6-8 14.4Z" />
        <path d="M12.6 39c-5.4-2.8-7.6-8-6.4-13.4 5.4 1.8 7.4 6.8 6.4 13.4Z" />
        <path d="M9 12.6c1.9 0 3.4-1.7 3.4-3.8S10.9 5 9 5 5.6 6.7 5.6 8.8s1.5 3.8 3.4 3.8Z" />
      </g>
    </svg>
  );
}

/** Losango duplo usado como pontuacao entre blocos de texto. */
export function Diamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" className={className}>
      <path d="M12 3l4.2 9L12 21 7.8 12 12 3Z" stroke="currentColor" strokeWidth={0.8} />
      <path d="M12 8.6l1.8 3.4-1.8 3.4-1.8-3.4L12 8.6Z" fill="currentColor" fillOpacity={0.35} />
    </svg>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
      width="18"
      height="11"
      className={className}
    >
      <path
        d="M0 6h18m0 0-5-5m5 5-5 5"
        stroke="currentColor"
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
