import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";

import { EVENT } from "@/lib/event";
import "./globals.css";

// Sora é a voz da interface: títulos, textos, botões e dados.
// A fonte de personalidade (Kissing Season) é declarada em globals.css e
// aparece só em nomes e palavras-chave.
const sans = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${EVENT.title} · ${EVENT.dateLabel}`,
    template: `%s · ${EVENT.babyName}`,
  },
  description: `${EVENT.tagline} Chá de bebê da Manuela em ${EVENT.dateFull}, às ${EVENT.timeLabel}, no ${EVENT.venue}.`,
  applicationName: EVENT.title,
  authors: [{ name: "Família da Manuela" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: EVENT.title,
    description: `${EVENT.dateFull}, ${EVENT.timeLabel} — ${EVENT.venue}. Confirme sua presença.`,
    siteName: EVENT.title,
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fdf2f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={sans.variable}>
      <head>
        {/* A fonte decorativa vem de outra origem: adianta a conexão. */}
        <link rel="preconnect" href="https://manu.cuptickers.online" crossOrigin="anonymous" />
      </head>
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
