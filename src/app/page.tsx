import { Countdown } from "@/components/Countdown";
import { Aura, Sparkles, type SparkleSpot } from "@/components/Decor";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  HeartIcon,
  PinIcon,
  Sparkle,
  Swash,
} from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { RsvpForm } from "@/components/RsvpForm";
import { SiteNav } from "@/components/SiteNav";
import { CALENDAR_URL, EVENT, EVENT_DATE_MS, MAPS_URL } from "@/lib/event";
import "@/styles/invite.css";

const HERO_SPARKLES: SparkleSpot[] = [
  { x: "8%", y: "18%", size: "0.9rem", delay: "0.4s", duration: "7s" },
  { x: "86%", y: "26%", size: "1.3rem", delay: "1.6s", duration: "8.5s", tone: "honey" },
  { x: "72%", y: "72%", size: "0.75rem", delay: "2.4s", duration: "6.5s", tone: "lilac" },
  { x: "16%", y: "76%", size: "1.05rem", delay: "3.1s", duration: "9s" },
];

const LETTER_SPARKLES: SparkleSpot[] = [
  { x: "10%", y: "22%", size: "1.15rem", delay: "1.1s", duration: "8s" },
  { x: "88%", y: "70%", size: "0.85rem", delay: "2.6s", duration: "7.5s", tone: "lilac" },
];

const RSVP_SPARKLES: SparkleSpot[] = [
  { x: "6%", y: "12%", size: "1rem", delay: "0.8s", duration: "8s" },
  { x: "91%", y: "64%", size: "0.8rem", delay: "2.2s", duration: "7s", tone: "honey" },
];

const GUARANTEES = [
  "Leva menos de um minuto",
  "Pode atualizar depois",
  "Só pedimos o essencial",
];

export default function InvitePage() {
  return (
    <>
      <SiteNav />

      <main id="conteudo">
        {/* ================================================== ABERTURA ==== */}
        <section className="hero" id="topo">
          <Aura variant="hero" />
          <Sparkles spots={HERO_SPARKLES} />

          <div className="shell hero__inner">
            <span className="badge hero__badge">
              <span className="badge__dot" aria-hidden="true" />
              Chá de bebê · {EVENT.weekdayLabel}, {EVENT.dateLabel}
            </span>

            <h1 className="hero__title">
              <span className="hero__title-line">Um amor pequenininho</span>
              <span className="hero__title-line">está chegando:</span>
              <span className="hero__name script">
                {EVENT.babyName}
                <Swash className="hero__swash" />
              </span>
            </h1>

            <p className="hero__lede lede">
              Antes do primeiro abraço, queremos dividir com você a alegria que já não cabe
              mais no peito. Venha celebrar a chegada da Manuela com a gente.
            </p>

            <div className="hero__actions">
              <a className="btn btn--lg" href="#presenca">
                <span>Confirmar presença</span>
                <span className="btn__icon" aria-hidden="true">
                  <HeartIcon />
                </span>
              </a>
              <a className="btn btn--lg btn--ghost" href="#detalhes">
                <span>Ver os detalhes</span>
                <span className="btn__icon" aria-hidden="true">
                  <ArrowRight />
                </span>
              </a>
            </div>

            {/* Cartão-resumo: tudo o que o convidado precisa saber em um olhar. */}
            <div className="hero__card">
              <p className="hero__card-label">
                <Sparkle className="hero__card-spark" />
                O convite em um olhar
              </p>

              <dl className="facts">
                <div className="facts__item">
                  <span className="icon-chip" aria-hidden="true">
                    <CalendarIcon />
                  </span>
                  <div>
                    <dt className="facts__label">Data</dt>
                    <dd className="facts__value">{EVENT.dateFull}</dd>
                  </div>
                </div>

                <div className="facts__item">
                  <span className="icon-chip icon-chip--honey" aria-hidden="true">
                    <ClockIcon />
                  </span>
                  <div>
                    <dt className="facts__label">Horário</dt>
                    <dd className="facts__value">
                      {EVENT.timeLabel} · {EVENT.weekdayLabel}
                    </dd>
                  </div>
                </div>

                <div className="facts__item">
                  <span className="icon-chip icon-chip--lilac" aria-hidden="true">
                    <PinIcon />
                  </span>
                  <div>
                    <dt className="facts__label">Local</dt>
                    <dd className="facts__value">{EVENT.venue}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ============================================ CONTAGEM ========== */}
        <section className="band band--dark" id="contagem" aria-labelledby="contagem-titulo">
          <div className="shell">
            <Reveal className="band__head">
              <p className="eyebrow eyebrow--on-dark">Contagem regressiva</p>
              <h2 className="title-xl" id="contagem-titulo">
                Falta pouco para o <span className="script band__title-accent">primeiro abraço</span>
              </h2>
            </Reveal>

            <Reveal delay={120}>
              <Countdown target={EVENT_DATE_MS} />
            </Reveal>

            <Reveal delay={200} className="band__foot">
              <p className="band__note">
                Salve a data para não perder nada — a gente já está contando os dias.
              </p>
              <a
                className="btn btn--on-dark"
                href={CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Adicionar ao calendário</span>
                <span className="btn__icon" aria-hidden="true">
                  <ArrowUpRight />
                </span>
              </a>
            </Reveal>
          </div>
        </section>

        {/* ============================================ DETALHES ========== */}
        <section className="section" id="detalhes" aria-labelledby="detalhes-titulo">
          <div className="shell">
            <Reveal className="section__head">
              <p className="eyebrow">O grande dia</p>
              <h2 className="title-xl" id="detalhes-titulo">
                Onde e quando a gente se encontra
              </h2>
              <p className="lede section__lede">
                Anote tudo com carinho: é uma tarde só de celebrar a Manuela.
              </p>
            </Reveal>

            <div className="detail-grid">
              <Reveal delay={80}>
                <article className="card card--lift detail-card">
                  <span className="icon-chip" aria-hidden="true">
                    <CalendarIcon />
                  </span>
                  <h3 className="detail-card__title title-md">Quando</h3>
                  <p className="detail-card__value script">{EVENT.dateLabel}</p>
                  <p className="detail-card__support">
                    {EVENT.weekdayLabel}, às {EVENT.timeLabel}
                  </p>
                  <ul className="detail-card__list">
                    <li>Recepção a partir do horário marcado</li>
                    <li>Traga a família e o bom humor</li>
                  </ul>
                </article>
              </Reveal>

              <Reveal delay={160}>
                <article className="card card--lift detail-card">
                  <span className="icon-chip icon-chip--lilac" aria-hidden="true">
                    <PinIcon />
                  </span>
                  <h3 className="detail-card__title title-md">Onde</h3>
                  <p className="detail-card__value script">{EVENT.venue}</p>
                  <p className="detail-card__support">{EVENT.address}</p>
                  <a
                    className="btn btn--ghost btn--sm detail-card__cta"
                    href={MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Como chegar</span>
                    <span className="btn__icon" aria-hidden="true">
                      <ArrowUpRight />
                    </span>
                  </a>
                </article>
              </Reveal>
            </div>

            <Reveal delay={220}>
              <div className="callout">
                <div className="callout__text">
                  <p className="callout__title title-md">A sua presença é o presente</p>
                  <p className="callout__sub">
                    Confirme para a gente organizar os lugares e receber você do jeito certo.
                  </p>
                </div>
                <a className="btn" href="#presenca">
                  <span>Confirmar agora</span>
                  <span className="btn__icon" aria-hidden="true">
                    <ArrowRight />
                  </span>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================== RECADO ========== */}
        <section className="band band--soft" id="recado" aria-labelledby="recado-titulo">
          <Sparkles spots={LETTER_SPARKLES} />

          <div className="shell">
            <Reveal>
              <figure className="letter">
                <span className="letter__quote script" aria-hidden="true">
                  &ldquo;
                </span>
                <h2 className="sr-only" id="recado-titulo">
                  Um recado da família
                </h2>
                <blockquote className="letter__text">
                  Depois de tanta espera, a Manuela já ocupa todo o nosso pensamento. Cada
                  detalhe desta tarde foi pensado para receber quem caminhou com a gente
                  até aqui.
                </blockquote>
                <figcaption className="letter__sign">
                  <span className="letter__sign-script script">com todo o nosso amor</span>
                  <span className="letter__sign-name">Família da Manuela</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* ============================================ PRESENÇA ========== */}
        <section className="section section--rsvp" id="presenca" aria-labelledby="presenca-titulo">
          <Aura variant="soft" />
          <Sparkles spots={RSVP_SPARKLES} />

          <div className="shell shell--narrow">
            <Reveal className="section__head section__head--center">
              <p className="eyebrow eyebrow--center">Confirmação de presença</p>
              <h2 className="title-xl" id="presenca-titulo">
                Você vem celebrar <span className="script">com a gente?</span>
              </h2>
              <p className="lede section__lede">
                Preencha em um minutinho. Assim guardamos o seu lugar — e o de quem vier
                com você.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <RsvpForm />
            </Reveal>

            <Reveal delay={200}>
              <ul className="guarantees">
                {GUARANTEES.map((item) => (
                  <li className="guarantees__item" key={item}>
                    <span className="guarantees__mark" aria-hidden="true">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ============================================== RODAPÉ ========== */}
        <footer className="site-footer">
          <div className="shell site-footer__inner">
            <p className="site-footer__name script">{EVENT.babyName}</p>
            <p className="site-footer__meta">
              {EVENT.dateFull} · {EVENT.timeLabel} · {EVENT.venue}
            </p>
            <span className="site-footer__mark" aria-hidden="true">
              <HeartIcon />
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}
