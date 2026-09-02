import type { CSSProperties } from "react";

import { Countdown } from "@/components/Countdown";
import { Decor, type DecorItem } from "@/components/Decor";
import { ArrowRight, Diamond } from "@/components/Ornaments";
import { Reveal } from "@/components/Reveal";
import { RsvpForm } from "@/components/RsvpForm";
import { EVENT, EVENT_DATE_MS, MAPS_URL } from "@/lib/event";
import "@/styles/invite.css";

const NAME_LETTERS = EVENT.babyName.split("");

const HERO_DECOR: DecorItem[] = [
  { kind: "sprig", x: "-3%", y: "-4%", size: "4.5rem", opacity: 0.26, depth: 0.02, rotate: 12, still: true, delay: "2.6s" },
  { kind: "sprig", x: "88%", y: "70%", size: "5rem", opacity: 0.2, depth: 0.03, rotate: -168, still: true, delay: "2.9s" },
  { kind: "balloon", x: "-5%", y: "52%", size: "3.4rem", opacity: 0.5, depth: 0.03, duration: "13s", delay: "2.2s", color: "var(--blush)", rotate: -6 },
  { kind: "balloon", x: "84%", y: "36%", size: "2.7rem", opacity: 0.42, depth: 0.05, duration: "16s", delay: "2.5s", color: "var(--nude)", rotate: 7 },
  { kind: "butterfly", x: "9%", y: "20%", size: "2.7rem", opacity: 0.34, depth: 0.06, duration: "19s", beat: "5s", delay: "1.9s", rotate: -8 },
  { kind: "butterfly", x: "76%", y: "13%", size: "3.4rem", opacity: 0.26, depth: 0.09, duration: "24s", beat: "6.5s", delay: "2.3s", rotate: 12 },
  { kind: "butterfly", x: "66%", y: "76%", size: "1.9rem", opacity: 0.22, depth: 0.07, duration: "21s", beat: "4.5s", delay: "2.7s", rotate: 18 },
];

const COUNTDOWN_DECOR: DecorItem[] = [
  { kind: "butterfly", x: "6%", y: "16%", size: "2rem", opacity: 0.2, depth: 0.08, duration: "22s", beat: "6s" },
  { kind: "sprig", x: "90%", y: "22%", size: "4rem", opacity: 0.18, depth: 0.04, rotate: -14, still: true },
];

const DETAILS_DECOR: DecorItem[] = [
  { kind: "balloon", x: "86%", y: "8%", size: "2.4rem", opacity: 0.34, depth: 0.05, duration: "15s", color: "var(--blush)", rotate: 8 },
  { kind: "butterfly", x: "4%", y: "62%", size: "2.3rem", opacity: 0.2, depth: 0.07, duration: "20s", beat: "5.5s", rotate: -14 },
];

const RSVP_DECOR: DecorItem[] = [
  { kind: "sprig", x: "-4%", y: "10%", size: "4.6rem", opacity: 0.2, depth: 0.03, rotate: 10, still: true },
  { kind: "butterfly", x: "85%", y: "8%", size: "2.6rem", opacity: 0.24, depth: 0.08, duration: "23s", beat: "5.5s", rotate: 10 },
];

export default function InvitePage() {
  return (
    <main>
      {/* ---------------------------------------------------------------- */}
      <header className="hero">
        <Decor items={HERO_DECOR} />

        <div className="hero__inner">
          <p className="eyebrow hero__eyebrow">Chá de Bebê</p>

          <div className="rule hero__rule">
            <span />
          </div>

          <h1 className="hero__name" aria-label={EVENT.babyName}>
            {NAME_LETTERS.map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className="hero__letter"
                style={{ "--i": index } as CSSProperties}
                aria-hidden="true"
              >
                {letter}
              </span>
            ))}
          </h1>

          <div className="rule hero__rule">
            <span />
          </div>

          <p className="hero__tagline">{EVENT.tagline}</p>

          <p className="hero__meta">
            <span>10 · 10 · 2026</span>
            <i aria-hidden="true" />
            <span>14h30</span>
          </p>
        </div>

        <a className="hero__scroll" href="#contagem" aria-label="Ver os detalhes do convite">
          <span aria-hidden="true" />
          Role
        </a>
      </header>

      {/* ---------------------------------------------------------------- */}
      <section className="section section--tinted" id="contagem" aria-labelledby="contagem-titulo">
        <Decor items={COUNTDOWN_DECOR} />
        <div className="shell">
          <Reveal>
            <div className="section__head">
              <p className="eyebrow">Faltam</p>
              <h2 className="section-title" id="contagem-titulo">
                Para o grande dia
              </h2>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <Countdown target={EVENT_DATE_MS} />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="section" id="evento" aria-labelledby="evento-titulo">
        <Decor items={DETAILS_DECOR} />
        <div className="shell">
          <h2 className="sr-only" id="evento-titulo">
            Data, horário e local
          </h2>

          <div className="details">
            <Reveal>
              <div className="detail">
                <p className="eyebrow detail__label">Quando</p>
                <p className="detail__value">{EVENT.dateLabel}</p>
                <p className="detail__support">
                  {EVENT.weekdayLabel} · {EVENT.timeLabel}
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="detail__divider" />
            </Reveal>

            <Reveal delay={160}>
              <div className="detail">
                <p className="eyebrow detail__label">Onde</p>
                <p className="detail__value">{EVENT.venue}</p>
                <p className="detail__address">{EVENT.address}</p>
                <div className="detail__action">
                  <a
                    className="btn"
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Como chegar</span>
                    <span className="btn__icon">
                      <ArrowRight />
                    </span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="section section--tinted" id="mensagem" aria-labelledby="mensagem-titulo">
        <div className="shell shell--narrow message">
          <Reveal>
            <span className="message__mark">
              <Diamond />
            </span>
            <h2 className="sr-only" id="mensagem-titulo">
              Uma mensagem
            </h2>
            <p className="message__text">
              Depois de tanta espera, a Manuela já ocupa todo o nosso pensamento. Antes do primeiro
              abraço, queremos dividir com você a alegria que não cabe mais no peito.
            </p>
          </Reveal>

          <Reveal delay={140}>
            <p className="script message__signature">com todo o nosso amor</p>
            <p className="message__parents">Família da Manuela</p>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="section" id="presenca" aria-labelledby="presenca-titulo">
        <Decor items={RSVP_DECOR} />
        <div className="shell shell--narrow">
          <Reveal>
            <div className="section__head">
              <p className="eyebrow">Confirmação de presença</p>
              <h2 className="section-title" id="presenca-titulo">
                Você vem celebrar com a gente?
              </h2>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <RsvpForm />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <footer className="site-footer">
        <div className="rule">
          <span />
        </div>
        <p className="site-footer__name">{EVENT.babyName}</p>
        <p className="site-footer__meta">
          {EVENT.shortDate} · {EVENT.venue}
        </p>
      </footer>
    </main>
  );
}
