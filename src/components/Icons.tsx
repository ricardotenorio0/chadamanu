/**
 * Ícones e sinais gráficos em SVG inline: leves, nítidos em qualquer tela e
 * sem requisição extra de rede. Todos partilham o mesmo desenho — traço 1.6,
 * pontas arredondadas, grade de 24 — para parecerem uma família só.
 */

import type { SVGProps } from "react";

type IconProps = { className?: string };

const stroke: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
};

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="4.5" />
      <path d="M3 10h18M8.5 3v4M15.5 3v4" />
      <circle cx="8.5" cy="14.6" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.6" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M12 21.5c4.2-4.4 6.4-7.8 6.4-10.4A6.4 6.4 0 0 0 5.6 11c0 2.6 2.2 6 6.4 10.5Z" />
      <circle cx="12" cy="10.8" r="2.4" />
    </svg>
  );
}

export function ArrowRight({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} width="18" height="18">
      <path d="M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5" />
    </svg>
  );
}

export function ArrowUpRight({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} width="16" height="16">
      <path d="M7 17 17 7M8.5 7H17v8.5" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} width="18" height="18">
      <path d="M12 5.5v13M5.5 12h13" />
    </svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} width="18" height="18">
      <path d="M5.5 12h13" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M12 20.2c-6-3.7-8.4-7-8.4-10.2A4.6 4.6 0 0 1 12 7.3a4.6 4.6 0 0 1 8.4 2.7c0 3.2-2.4 6.5-8.4 10.2Z" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} width="16" height="16">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.6v5.2" />
      <circle cx="12" cy="16.4" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} width="20" height="20">
      <path d="M4 8h16M4 16h10" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg {...stroke} className={className} width="20" height="20">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Brilho de quatro pontas — o único enfeite recorrente da identidade. */
export function Sparkle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d="M12 0c.7 6.4 4.9 10.6 12 12-7.1 1.4-11.3 5.6-12 12-.7-6.4-4.9-10.6-12-12C7.1 10.6 11.3 6.4 12 0Z" />
    </svg>
  );
}

/** Traço manuscrito sob o nome: fecha a assinatura sem virar ilustração. */
export function Swash({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 220 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      className={className}
    >
      <path
        d="M2 11.5c34-7 62-9.5 108-9.5s72 3 108 10"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
