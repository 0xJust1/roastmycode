import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoastMyCode - L'IA qui demolit ton code avec style",
  description: "Colle ton code, une IA open-source le massacre avec humour. Partage ta Roast Card et defie tes collegues.",
  openGraph: {
    title: "RoastMyCode",
    description: "L'IA qui demolit ton code avec style",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoastMyCode",
    description: "L'IA qui demolit ton code avec style",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
