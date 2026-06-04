import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const cardUrl = `${baseUrl}/cards/${id}.png`;

  return {
    title: "RoastMyCode - Mon code vient de se faire massacrer",
    description: "Une IA open-source a analyse mon code... Le verdict est brutal. Viens voir et tester le tien.",
    openGraph: {
      title: "RoastMyCode - Mon code vient de se faire massacrer",
      description: "Une IA open-source a analyse mon code. Le verdict est brutal.",
      images: [{ url: cardUrl, width: 1200, height: 630, alt: "Roast Card" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "RoastMyCode - Mon code vient de se faire massacrer",
      description: "Une IA open-source a analyse mon code. Le verdict est brutal.",
      images: [cardUrl],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const cardUrl = `${baseUrl}/cards/${id}.png`;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: "700px", width: "100%", textAlign: "center" }}>
        <div className="badge badge-pink" style={{ marginBottom: "20px" }}>
          Roast Card
        </div>
        <h1 className="font-kawaii" style={{ fontSize: "2rem", marginBottom: "24px" }}>
          Mon code s&apos;est fait <span className="gradient-text">massacrer</span>
        </h1>

        <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "32px", border: "1px solid var(--border)" }}>
          <Image
            src={cardUrl}
            alt="Roast Card"
            width={1200}
            height={700}
            style={{ width: "100%", height: "auto", display: "block" }}
            unoptimized
          />
        </div>

        <p style={{ color: "var(--text-muted)", marginBottom: "28px", fontSize: "1rem" }}>
          Et toi ? Tes collegues ont vu ton code ?
        </p>

        <Link href="/" className="btn btn-primary" style={{ fontSize: "1.05rem" }}>
          Tester mon code
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </Link>
      </div>
    </main>
  );
}
