/**
 * Enfeites da identidade: borboletas, flores e balões desenhados em SVG.
 * Traço fino e preenchimento translúcido — a ideia é sugerir o universo
 * infantil sem virar ilustração de desenho animado. Todos herdam `color`,
 * então a paleta continua sendo decidida pelo CSS.
 */

type OrnamentProps = { className?: string };

export function Butterfly({ className }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={["butterfly", className].filter(Boolean).join(" ")}
    >
      <g className="butterfly__wing butterfly__wing--left">
        <path
          d="M49 46C40 26 21 16 12 24c-8 8 0 27 37 30Z"
          fill="currentColor"
          fillOpacity="0.34"
        />
        <path
          d="M49 52C36 58 25 66 26 76c1 8 12 6 17-2 4-6 6-14 6-22Z"
          fill="currentColor"
          fillOpacity="0.22"
        />
      </g>
      <g className="butterfly__wing butterfly__wing--right">
        <path
          d="M51 46c9-20 28-30 37-22 8 8 0 27-37 30Z"
          fill="currentColor"
          fillOpacity="0.34"
        />
        <path
          d="M51 52c13 6 24 14 23 24-1 8-12 6-17-2-4-6-6-14-6-22Z"
          fill="currentColor"
          fillOpacity="0.22"
        />
      </g>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M50 42c1.6 5 2 22 0 34-2-12-1.6-29 0-34Z" fill="currentColor" fillOpacity="0.55" />
        <path d="M50 43c-3-6-7-10-12-11" />
        <path d="M50 43c3-6 7-10 12-11" />
      </g>
    </svg>
  );
}

export function Flower({ className }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={["flower", className].filter(Boolean).join(" ")}
    >
      <g className="flower__petals" fill="currentColor">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="50"
            cy="27"
            rx="13"
            ry="21"
            fillOpacity="0.38"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="9.5" fill="currentColor" fillOpacity="0.75" />
    </svg>
  );
}

export function Balloon({ className }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 60 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={["balloon", className].filter(Boolean).join(" ")}
    >
      <ellipse cx="30" cy="33" rx="25" ry="31" fill="currentColor" fillOpacity="0.42" />
      <ellipse
        cx="21"
        cy="24"
        rx="6"
        ry="9"
        fill="#fff"
        fillOpacity="0.55"
        transform="rotate(-22 21 24)"
      />
      <path d="M26.5 63.5h7L30 69Z" fill="currentColor" fillOpacity="0.6" />
      <path
        d="M30 69c4 6-4.5 8-1.5 14.5C30.5 88 30 92 27 95"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Ramo de folhinhas: pontua cantos sem pedir atenção. */
export function Sprig({ className }: OrnamentProps) {
  return (
    <svg
      viewBox="0 0 60 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={["sprig", className].filter(Boolean).join(" ")}
    >
      <path
        d="M30 96C30 66 28 38 22 12"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g fill="currentColor" fillOpacity="0.32">
        <ellipse cx="40" cy="72" rx="11" ry="6.5" transform="rotate(-24 40 72)" />
        <ellipse cx="17" cy="57" rx="10" ry="6" transform="rotate(22 17 57)" />
        <ellipse cx="34" cy="42" rx="9.5" ry="5.5" transform="rotate(-28 34 42)" />
        <ellipse cx="15" cy="29" rx="8.5" ry="5" transform="rotate(26 15 29)" />
      </g>
    </svg>
  );
}
