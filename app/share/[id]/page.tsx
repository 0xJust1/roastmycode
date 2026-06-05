import type { Metadata } from "next";
import Link from "next/link";
import { list } from "@vercel/blob";
import fs from "fs";
import path from "path";

interface SharePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ img?: string; lang?: string }>;
}

async function getCardImageUrl(id: string, searchImg?: string): Promise<string | null> {
  // 1. If img is provided in searchParams, use it
  if (searchImg) {
    return decodeURIComponent(searchImg);
  }

  // 2. Try to find the card on Vercel Blob dynamically
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: `cards/${id}` });
      const found = blobs.find((b) => b.pathname === `cards/${id}.png`);
      if (found) {
        return found.url;
      }
    } catch (err) {
      console.error("Error listing blobs for card:", err);
    }
  }

  // 3. Try to find the card locally (development fallback)
  try {
    const localPath = path.join(process.cwd(), "public", "cards", `${id}.png`);
    if (fs.existsSync(localPath)) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.roastmycode.wtf";
      return `${baseUrl}/cards/${id}.png`;
    }
  } catch (err) {
    // Silent fail
  }

  return null;
}

export async function generateMetadata({ params, searchParams }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const { img, lang } = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.roastmycode.wtf";

  const resolvedImg = await getCardImageUrl(id, img);
  const cardImageUrl = resolvedImg || `${baseUrl}/opengraph-image.png`;

  const isFr = lang === "fr";
  const title = isFr
    ? "Mon code vient de se faire détruire par l'IA — RoastMyCode"
    : "My code just got absolutely destroyed by AI — RoastMyCode";
  const description = isFr
    ? "Une IA a roasté mon code sans aucune pitié. Viens voir le verdict et teste le tien."
    : "An AI roasted my code with zero mercy. Come see the verdict and test yours.";

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      images: [{ url: cardImageUrl, width: 1200, height: 630, alt: "Roast Card" }],
      type: "website",
      url: `${baseUrl}/share/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cardImageUrl],
    },
  };
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  const { id } = await params;
  const { img, lang } = await searchParams;
  const cardImageUrl = await getCardImageUrl(id, img);
  const isFr = lang === "fr";

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: "720px", width: "100%", textAlign: "center" }}>
        <div className="badge badge-pink" style={{ marginBottom: "20px" }}>
          {isFr ? "Carte Roast" : "Roast Card"}
        </div>
        <h1 className="font-kawaii" style={{ fontSize: "2rem", marginBottom: "24px" }}>
          {isFr ? (
            <>Mon code s'est fait <span className="gradient-text">complètement massacrer</span></>
          ) : (
            <>My code just got <span className="gradient-text">absolutely destroyed</span></>
          )}
        </h1>

        {cardImageUrl ? (
          <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "32px", border: "1px solid var(--border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardImageUrl}
              alt="Roast Card"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        ) : (
          <div style={{
            borderRadius: "16px", marginBottom: "32px", border: "1px solid var(--border)",
            padding: "60px", color: "var(--text-muted)", fontSize: "1rem"
          }}>
            {isFr ? "Carte non disponible" : "Card not available"}
          </div>
        )}

        <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontSize: "1rem" }}>
          {isFr ? "Tu penses que ton code est meilleur ? Prouve-le." : "Think your code is better? Prove it."}
        </p>

        <Link href="/" className="btn btn-primary" style={{ fontSize: "1.05rem" }}>
          {isFr ? "Roaster mon code" : "Roast my code"}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </Link>
      </div>
    </main>
  );
}

