import type { Metadata } from "next";
import Link from "next/link";

interface SharePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ img?: string }>;
}

export async function generateMetadata({ params, searchParams }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const { img } = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.roastmycode.wtf";

  // Use the real Blob URL passed as ?img= param, fallback to base OG image
  const cardImageUrl = img ? decodeURIComponent(img) : `${baseUrl}/opengraph-image.png`;

  return {
    title: "My code just got absolutely destroyed by AI — RoastMyCode",
    description: "An AI roasted my code with zero mercy. Come see the verdict and test yours.",
    metadataBase: new URL(baseUrl),
    openGraph: {
      title: "My code just got absolutely destroyed by AI",
      description: "An AI roasted my code with zero mercy. Come test yours at roastmycode.wtf",
      images: [{ url: cardImageUrl, width: 1200, height: 630, alt: "Roast Card" }],
      type: "website",
      url: `${baseUrl}/share/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: "My code just got absolutely destroyed by AI",
      description: "An AI roasted my code with zero mercy. Come test yours at roastmycode.wtf",
      images: [cardImageUrl],
    },
  };
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const { img } = await searchParams;
  const cardImageUrl = img ? decodeURIComponent(img) : null;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: "720px", width: "100%", textAlign: "center" }}>
        <div className="badge badge-pink" style={{ marginBottom: "20px" }}>
          Roast Card
        </div>
        <h1 className="font-kawaii" style={{ fontSize: "2rem", marginBottom: "24px" }}>
          My code just got <span className="gradient-text">absolutely destroyed</span>
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
            Card not available
          </div>
        )}

        <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontSize: "1rem" }}>
          Think your code is better? Prove it.
        </p>

        <Link href="/" className="btn btn-primary" style={{ fontSize: "1.05rem" }}>
          Roast my code
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
