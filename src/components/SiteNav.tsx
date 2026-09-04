"use client";

import { useEffect, useState } from "react";

import { ArrowRight, HeartIcon } from "@/components/Icons";
import { EVENT } from "@/lib/event";

const LINKS = [
  { id: "contagem", label: "Contagem" },
  { id: "album", label: "Fotos" },
  { id: "detalhes", label: "Detalhes" },
  { id: "presente", label: "Presente" },
];

/**
 * Barra fixa do convite. No celular ela guarda só a marca e um atalho para a
 * confirmação; a partir do tablet aparecem os links das seções, com o item
 * atual destacado conforme a rolagem.
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [pastHero, setPastHero] = useState(false);
  const [atRsvp, setAtRsvp] = useState(false);

  // Estado compacto da barra depois dos primeiros pixels de rolagem.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Seção visível no momento: alimenta o destaque dos links.
  useEffect(() => {
    const ids = [...LINKS.map((link) => link.id), "presenca"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // A barra flutuante entra depois do topo e some quando o formulário aparece.
  useEffect(() => {
    const hero = document.getElementById("topo");
    const rsvp = document.getElementById("presenca");
    if (typeof IntersectionObserver === "undefined") return;

    const observers: IntersectionObserver[] = [];

    if (hero) {
      const heroObserver = new IntersectionObserver(
        ([entry]) => setPastHero(!entry.isIntersecting),
        { rootMargin: "-72% 0px 0px 0px" }
      );
      heroObserver.observe(hero);
      observers.push(heroObserver);
    }

    if (rsvp) {
      const rsvpObserver = new IntersectionObserver(
        ([entry]) => setAtRsvp(entry.isIntersecting),
        { rootMargin: "0px 0px -25% 0px" }
      );
      rsvpObserver.observe(rsvp);
      observers.push(rsvpObserver);
    }

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const showBar = pastHero && !atRsvp;

  return (
    <>
      <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="nav__inner">
          <a className="nav__brand" href="#topo">
            <span className="nav__brand-mark" aria-hidden="true">
              <HeartIcon />
            </span>
            <span className="nav__brand-name script">{EVENT.babyName}</span>
          </a>

          <nav className="nav__links" aria-label="Seções do convite">
            {LINKS.map((link) => (
              <a
                key={link.id}
                className={`nav__link${active === link.id ? " is-active" : ""}`}
                href={`#${link.id}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a className="btn btn--sm nav__cta" href="#presenca">
            <span>Confirmar</span>
            <span className="btn__icon" aria-hidden="true">
              <ArrowRight />
            </span>
          </a>
        </div>
      </header>

      {/* Atalho permanente no celular: o CTA acompanha a rolagem. */}
      <div className={`float-cta${showBar ? " is-visible" : ""}`}>
        <div className="float-cta__inner">
          <p className="float-cta__text">
            <strong>{EVENT.shortDate}</strong>
            <span>{EVENT.venue}</span>
          </p>
          <a className="btn btn--sm" href="#presenca">
            <span>Confirmar presença</span>
          </a>
        </div>
      </div>
    </>
  );
}
