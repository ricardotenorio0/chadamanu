"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { Butterfly, Flower } from "@/components/Ornaments";

export type Photo = {
  src: string;
  alt: string;
  /** Legenda manuscrita sob a foto. */
  caption: string;
  /** Inclinação final, como se a foto tivesse sido colada à mão. */
  rotate: number;
};

/**
 * Mural de fotos no estilo Polaroid: moldura branca, sombra funda e um leve
 * giro em cada peça. As fotos entram uma a uma quando a seção aparece —
 * surgem levemente giradas e se acomodam na inclinação final.
 *
 * As imagens são carregadas direto da origem em que estão publicadas, por
 * isso usamos <img> em vez de next/image: nada precisa passar pelo servidor.
 */
export function PhotoWall({ photos }: { photos: Photo[] }) {
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
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`photos${visible ? " is-visible" : ""}`} ref={ref}>
      <span className="photos__flower" aria-hidden="true">
        <Flower />
      </span>
      <span className="photos__butterfly" aria-hidden="true">
        <Butterfly />
      </span>

      {photos.map((photo, index) => (
        <figure
          className="polaroid"
          key={photo.src}
          style={{ "--rot": `${photo.rotate}deg`, "--i": index } as CSSProperties}
        >
          <span className="polaroid__frame">
            {/* eslint-disable-next-line @next/next/no-img-element --
                as fotos vivem em outra origem e não passam pelo otimizador. */}
            <img
              className="polaroid__img"
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
            />
          </span>
          <figcaption className="polaroid__caption script">{photo.caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
