import { Countdown } from "@/components/Countdown";
import { Aura, Decor, Sparkles, type DecorItem, type SparkleSpot } from "@/components/Decor";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarIcon,
  ClockIcon,
  DiaperIcon,
  GiftIcon,
  HeartIcon,
  PinIcon,
  Sparkle,
  Swash,
} from "@/components/Icons";
import { BigName } from "@/components/BigName";
import { PhotoWall, type Photo } from "@/components/PhotoWall";
import { Reveal } from "@/components/Reveal";
import { RsvpForm } from "@/components/RsvpForm";
import { SiteNav } from "@/components/SiteNav";
import { CALENDAR_URL, EVENT, EVENT_DATE_MS, MAPS_URL } from "@/lib/event";
import "@/styles/invite.css";

const HERO_DECOR: DecorItem[] = [
  { kind: "butterfly", x: "6%", y: "12%", size: "3.2rem", tone: "rose", delay: 0.9, duration: "17s", rotate: -12 },
  { kind: "butterfly", x: "82%", y: "30%", size: "2.4rem", tone: "lilac", delay: 1.4, duration: "21s", rotate: 14 },
  { kind: "flower", x: "88%", y: "8%", size: "2.6rem", tone: "baby", delay: 1.1, duration: "13s", rotate: -8 },
  { kind: "flower", x: "3%", y: "58%", size: "2rem", tone: "honey", delay: 1.6, duration: "15s", rotate: 12 },
  { kind: "balloon", x: "89%", y: "62%", size: "2.6rem", tone: "rose", delay: 1.3, duration: "12s", rotate: 6 },
  { kind: "balloon", x: "-2%", y: "34%", size: "2.2rem", tone: "sky", delay: 1.7, duration: "14s", rotate: -7 },
];

const COUNTDOWN_DECOR: DecorItem[] = [
  { kind: "balloon", x: "4%", y: "16%", size: "2.4rem", tone: "baby", delay: 0.2, duration: "13s", rotate: -6 },
  { kind: "butterfly", x: "90%", y: "24%", size: "2.5rem", tone: "rose", delay: 0.5, duration: "19s", rotate: 10 },
  { kind: "flower", x: "86%", y: "76%", size: "2rem", tone: "lilac", delay: 0.8, duration: "14s" },
];

const PHOTOS_DECOR: DecorItem[] = [
  { kind: "sprig", x: "1%", y: "10%", size: "3.4rem", tone: "mint", delay: 0.3, duration: "18s", rotate: -10, opacity: 0.75 },
  { kind: "butterfly", x: "92%", y: "62%", size: "2.3rem", tone: "honey", delay: 0.7, duration: "20s", rotate: 12 },
];

const DETAILS_DECOR: DecorItem[] = [
  { kind: "flower", x: "93%", y: "6%", size: "2.2rem", tone: "baby", delay: 0.3, duration: "15s", rotate: 10 },
  { kind: "butterfly", x: "2%", y: "72%", size: "2.2rem", tone: "rose", delay: 0.6, duration: "22s", rotate: -14 },
];

const GIFT_DECOR: DecorItem[] = [
  { kind: "balloon", x: "88%", y: "14%", size: "2.3rem", tone: "rose", delay: 0.3, duration: "12s", rotate: 8 },
  { kind: "flower", x: "4%", y: "24%", size: "2.1rem", tone: "honey", delay: 0.6, duration: "16s", rotate: -12 },
];

const RSVP_DECOR: DecorItem[] = [
  { kind: "butterfly", x: "4%", y: "10%", size: "2.6rem", tone: "lilac", delay: 0.4, duration: "20s", rotate: -10 },
  { kind: "flower", x: "90%", y: "14%", size: "2.2rem", tone: "baby", delay: 0.7, duration: "14s", rotate: 8 },
  { kind: "balloon", x: "92%", y: "70%", size: "2.1rem", tone: "baby", delay: 1, duration: "13s", rotate: -5 },
];

const HERO_SPARKLES: SparkleSpot[] = [
  { x: "18%", y: "34%", size: "0.85rem", delay: "0.6s", duration: "7s" },
  { x: "76%", y: "48%", size: "1.1rem", delay: "1.8s", duration: "8.5s", tone: "honey" },
  { x: "63%", y: "16%", size: "0.7rem", delay: "2.6s", duration: "6.5s", tone: "lilac" },
];

/* Contato de quem desenvolveu o convite, no crédito do rodapé. */
const DEV_WHATSAPP_URL =
  "https://api.whatsapp.com/send/?phone=5511919203415&text&type=phone_number&app_absent=0";

/* As fotos ficam publicadas na mesma origem do convite. */
const PHOTOS: Photo[] = [
  {
    src: "https://manu.cuptickers.online/Sem%20Ti%CC%81tulo-1.webp",
    alt: "Retrato guardado à espera da Manuela",
    caption: "nossa espera",
    rotate: -6,
  },
  {
    src: "https://manu.cuptickers.online/Sem%20Ti%CC%81tulo-2%20(1).webp",
    alt: "Momento registrado durante a gestação da Manuela",
    caption: "com muito amor",
    rotate: 3.5,
  },
  {
    src: "https://manu.cuptickers.online/Sem%20Ti%CC%81tulo-3.webp",
    alt: "Lembrança da contagem regressiva para a chegada da Manuela",
    caption: "10 · 10 · 26",
    rotate: -2.5,
  },
];

export default function InvitePage() {
  return (
    <>
      <SiteNav />

      <main id="conteudo">
        {/* ================================================== ABERTURA ==== */}
        <section className="hero" id="topo">
          <Aura variant="hero" />
          <Decor items={HERO_DECOR} />
          <Sparkles spots={HERO_SPARKLES} />

          <div className="shell hero__inner">
            <span className="badge hero__badge">
              <span className="badge__dot" aria-hidden="true" />
              Chá de bebê · {EVENT.weekdayLabel}, {EVENT.dateLabel}
            </span>

            <h1 className="hero__title">
              <span className="hero__title-line">
                Vem celebrar com a gente o chá de bebê da
              </span>
              <span className="hero__name">
                <BigName className="script" text={EVENT.babyName} />
                <Swash className="hero__swash" />
              </span>
            </h1>

            <p className="hero__lede">
              Reservamos uma tarde inteira de carinho para preparar a chegada dela.
              Vai ser ainda mais bonito com você por perto.
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
        <section className="section section--count" id="contagem" aria-labelledby="contagem-titulo">
          <Aura variant="soft" />
          <Decor items={COUNTDOWN_DECOR} />

          <div className="shell">
            <Reveal className="section__head section__head--center">
              <p className="eyebrow eyebrow--center">Contagem regressiva</p>
              <h2 className="title-xl" id="contagem-titulo">
                Está chegando o dia de{" "}
                <span className="script accent-word">
                  celebrar a Manuela
                  <span className="title-heart" aria-hidden="true">
                    <HeartIcon />
                  </span>
                </span>
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div className="count-card">
                <p className="count-card__date">
                  <span className="icon-chip icon-chip--sm" aria-hidden="true">
                    <CalendarIcon />
                  </span>
                  <span>
                    <strong>{EVENT.dateFull}</strong>
                    <span className="count-card__date-sub">
                      {EVENT.weekdayLabel} · {EVENT.timeLabel} · {EVENT.venue}
                    </span>
                  </span>
                </p>

                <Countdown target={EVENT_DATE_MS} />

                <div className="count-card__foot">
                  <p className="count-card__note">
                    Salve a data para não perder nada — a gente já está contando os dias.
                  </p>
                  <a
                    className="btn btn--ghost btn--sm"
                    href={CALENDAR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Adicionar ao calendário</span>
                    <span className="btn__icon" aria-hidden="true">
                      <ArrowUpRight />
                    </span>
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================================== ÁLBUM =========== */}
        <section className="section section--photos" id="album" aria-labelledby="album-titulo">
          <Decor items={PHOTOS_DECOR} />

          <div className="shell">
            <Reveal className="section__head section__head--center">
              <p className="eyebrow eyebrow--center">Álbum de memórias</p>
              <h2 className="title-xl" id="album-titulo">
                Um pedacinho da <span className="script accent-word">nossa espera</span>
              </h2>
              <p className="lede section__lede">
                Cliques que a gente guarda com carinho enquanto o grande dia não chega.
              </p>
            </Reveal>

            <PhotoWall photos={PHOTOS} />
          </div>
        </section>

        {/* ============================================ DETALHES ========== */}
        <section className="section section--tint" id="detalhes" aria-labelledby="detalhes-titulo">
          <Decor items={DETAILS_DECOR} />

          <div className="shell">
            <Reveal className="section__head section__head--center">
              <p className="eyebrow eyebrow--center">O grande dia</p>
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
                  <h3 className="detail-card__title">Quando</h3>
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
                  <h3 className="detail-card__title">Onde</h3>
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
          </div>
        </section>

        {/* ============================================== RECADO ========== */}
        <section className="section section--letter" id="recado" aria-labelledby="recado-titulo">
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

        {/* ============================================= PRESENTE ========= */}
        <section className="section section--gift" id="presente" aria-labelledby="presente-titulo">
          <Decor items={GIFT_DECOR} />

          <div className="shell shell--narrow">
            <Reveal>
              <article className="gift">
                <span className="gift__mark" aria-hidden="true">
                  <GiftIcon />
                </span>

                <p className="eyebrow eyebrow--center gift__eyebrow">Sugestão de presente</p>

                <h2 className="gift__title" id="presente-titulo">
                  Um mimo para a{" "}
                  <span className="script accent-word">
                    Manuela
                    <span className="title-heart" aria-hidden="true">
                      <HeartIcon />
                    </span>
                  </span>
                </h2>

                <p className="gift__text">
                  Se quiser presentear a Manuela, nossa sugestão é uma fraldinha tamanho
                  M ou G + um mimo especial.
                </p>

                <ul className="gift__chips">
                  <li className="gift__chip">
                    <span className="icon-chip icon-chip--sm" aria-hidden="true">
                      <DiaperIcon />
                    </span>
                    Fraldinha M ou G
                  </li>
                  <li className="gift__chip">
                    <span className="icon-chip icon-chip--sm icon-chip--honey" aria-hidden="true">
                      <HeartIcon />
                    </span>
                    Um mimo especial
                  </li>
                </ul>

                <p className="gift__note">
                  Mas o presente mesmo é ver você por aqui no dia.
                </p>
              </article>
            </Reveal>
          </div>
        </section>

        {/* ============================================ PRESENÇA ========== */}
        <section className="section section--rsvp" id="presenca" aria-labelledby="presenca-titulo">
          <Aura variant="soft" />
          <Decor items={RSVP_DECOR} />

          <div className="shell shell--narrow">
            <Reveal className="section__head section__head--center">
              <p className="eyebrow eyebrow--center">Confirmação de presença</p>
              <h2 className="title-xl" id="presenca-titulo">
                Você vem celebrar <span className="script accent-word">com a gente?</span>
              </h2>
              <p className="lede section__lede">
                Preencha em um minutinho. Assim guardamos o seu lugar — e o de quem vier
                com você.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <RsvpForm />
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

            <a
              className="site-footer__credit"
              href={DEV_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Desenvolvido por Ricardo Tenório
              <span aria-hidden="true">|</span>
              <span className="site-footer__credit-cta">Solicite um orçamento</span>
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
