import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoastMyCode - AI destroys your code with style",
  description: "Paste your code. AI roasts it with humour. Share your shame card and challenge your colleagues.",
  metadataBase: new URL("https://www.roastmycode.wtf"),
  openGraph: {
    title: "RoastMyCode",
    description: "Paste your code. AI destroys it with style.",
    type: "website",
    url: "https://www.roastmycode.wtf",
    siteName: "RoastMyCode",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoastMyCode",
    description: "Paste your code. AI destroys it with style.",
    site: "@roastmycode",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

