import { Sparkle } from "@/components/Icons";

export type SparkleSpot = {
  /** Posição relativa à seção, em porcentagem. */
  x: string;
  y: string;
  size: string;
  delay?: string;
  duration?: string;
  tone?: "rose" | "honey" | "lilac" | "light";
};

/**
 * Camada decorativa das seções: auras de gradiente e alguns brilhos.
 * Tudo em CSS, sem parallax e sem imagem — o enfeite dá profundidade, mas
 * nunca disputa atenção com o conteúdo.
 */
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
export function Aura({ variant = "hero" }: { variant?: "hero" | "soft" | "dark" }) {
  return <div className={`aura aura--${variant}`} aria-hidden="true" />;
}
