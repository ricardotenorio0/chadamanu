"use client";

import { useEffect, useState } from "react";

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

const UNITS: Array<{ key: keyof Remaining; label: string }> = [
  { key: "days", label: "Dias" },
  { key: "hours", label: "Horas" },
  { key: "minutes", label: "Minutos" },
  { key: "seconds", label: "Segundos" },
];

function remainingFrom(target: number): Remaining {
  const diff = Math.max(0, target - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function Countdown({ target }: { target: number }) {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    setRemaining(remainingFrom(target));
    const id = window.setInterval(() => setRemaining(remainingFrom(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const arrived = remaining !== null && target - Date.now() <= 0;

  return (
    <div className="countdown" role="timer" aria-live="off">
      <ol className="countdown__grid">
        {UNITS.map((unit, index) => {
          const value = remaining?.[unit.key];
          const text = value === undefined ? "--" : String(value).padStart(2, "0");
          return (
            <li className="countdown__cell" key={unit.key} style={{ animationDelay: `${index * 70}ms` }}>
              {/* A chave muda a cada tique e reinicia a animação de entrada. */}
              <span className="countdown__value" key={text}>
                {text}
              </span>
              <span className="countdown__label">{unit.label}</span>
            </li>
          );
        })}
      </ol>

      {arrived ? (
        <p className="countdown__note">
          <span className="badge">O grande dia chegou</span>
        </p>
      ) : null}
    </div>
  );
}
