import type { Metadata, Viewport } from "next";
import { Antic_Didone, Jost, Parisienne } from "next/font/google";

import { EVENT } from "@/lib/event";
import "./globals.css";

// Didone delicada, de alto contraste: sustenta o nome "Manuela" em tamanho
// grande e traz o ar de convite editorial.
const display = Antic_Didone({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-sans",
  display: "swap",
});

const script = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${EVENT.title} · ${EVENT.dateLabel}`,
    template: `%s · ${EVENT.babyName}`,
  },
  description: `${EVENT.tagline} Chá de bebê da Manuela em ${EVENT.dateLabel}, às ${EVENT.timeLabel}, no ${EVENT.venue}.`,
  applicationName: EVENT.title,
  authors: [{ name: "Família da Manuela" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: EVENT.title,
    description: `${EVENT.tagline} ${EVENT.dateLabel}, ${EVENT.timeLabel} — ${EVENT.venue}.`,
    siteName: EVENT.title,
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fcfaf8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${script.variable}`}>
      <body>
        {/* Sem JavaScript, o conteúdo continua visível. */}
        <noscript>
          <style>{".reveal{opacity:1 !important;transform:none !important}"}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
