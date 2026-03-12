import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "J'adore Ristorante - Pomigliano d'Arco",
  description: "J'adore Ristorante - Cucina tradizionale nel cuore di Pomigliano d'Arco. Giardino esterno, menu digitale e prenotazioni online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
