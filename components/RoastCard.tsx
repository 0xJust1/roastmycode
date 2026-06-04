"use client";

import { useRef, useState, useCallback } from "react";
import Mascot from "./Mascot";
import { toPng } from "html-to-image";

type MascotMood = "dead" | "horrified" | "crying" | "laughing" | "shocked" | "idle";

interface RoastResult {
  verdict: string;
  score: number;
  language: string;
  roast: string;
  citation: string;
  worstLine: string;
  worstLineComment: string;
  badges: string[];
  mascotMood: MascotMood;
}

interface RoastCardProps {
  result: RoastResult;
  level: string;
  lang: "fr" | "en";
}

function getShameColor(score: number): string {
  if (score < 30) return "#7fdbca";
  if (score < 60) return "#ffe66d";
  if (score < 80) return "#ff8c42";
  return "#ff4757";
}

function getShameLabel(score: number, lang: "fr" | "en"): string {
  const labels: Record<"fr" | "en", [string, string, string, string, string, string]> = {
    fr: ["Propre (presque)", "Mediocre", "Honteux", "Catastrophique", "Crime contre l'humanite", "Abomination cosmique"],
    en: ["Clean (almost)", "Mediocre", "Shameful", "Catastrophic", "Crime against humanity", "Cosmic abomination"],
  };
  const arr = labels[lang];
  if (score < 20) return arr[0];
  if (score < 40) return arr[1];
  if (score < 60) return arr[2];
  if (score < 80) return arr[3];
  if (score < 95) return arr[4];
  return arr[5];
}

const LEVEL_COLORS: Record<string, string> = {
  doux: "#7fdbca",
  brutal: "#ff6eb4",
  impitoyable: "#ff4757",
};

const T = {
  fr: {
    roastPhrase: "La phrase du roast",
    worstLine: "La pire ligne detectee",
    shareX: "Partager sur X",
    copyQuote: "Copier la citation",
    download: "Telecharger la carte",
    sharing: "Preparation du partage...",
    shameIndex: "Indice de honte",
    poweredBy: "RoastMyCode — Analyse IA",
    copied: "Citation copiee !",
    downloaded: "Image telechargee !",
    errorCopy: "Erreur de copie",
    errorDownload: "Erreur lors du telechargement",
    errorShare: "Erreur lors du partage",
  },
  en: {
    roastPhrase: "The roast quote",
    worstLine: "Worst line detected",
    shareX: "Share on X",
    copyQuote: "Copy quote",
    download: "Download card",
    sharing: "Preparing share...",
    shameIndex: "Shame index",
    poweredBy: "RoastMyCode — AI Analysis",
    copied: "Quote copied!",
    downloaded: "Image downloaded!",
    errorCopy: "Copy error",
    errorDownload: "Download error",
    errorShare: "Share error",
  },
};

export default function RoastCard({ result, level, lang }: RoastCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const t = T[lang];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const shameColor = getShameColor(result.score);
  const shameLabel = getShameLabel(result.score, lang);

  const generateImage = useCallback(async (): Promise<string> => {
    if (!cardRef.current) throw new Error("Card not mounted");
    return await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
    });
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const dataUrl = await generateImage();
      // Convert data URL to Blob for reliable download across all browsers
      const fetchRes = await fetch(dataUrl);
      const blob = await fetchRes.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `roastmycode-${Date.now()}.png`;
      a.href = objectUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      showToast(t.downloaded);
    } catch {
      showToast(t.errorDownload);
    } finally {
      setDownloading(false);
    }
  };


  const handleShareX = async () => {
    setSharing(true);
    try {
      // Generate and upload the card image to get a public URL
      const dataUrl = await generateImage();
      const res = await fetch("/api/upload-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });

      if (!res.ok) throw new Error("Upload failed");
      const { shareUrl } = await res.json();

      const tweetText =
        lang === "en"
          ? `My code just got absolutely destroyed by an AI. Shame score: ${result.score}/100\n\n"${result.citation}"\n\n#RoastMyCode`
          : `Mon code vient de se faire massacrer par une IA. Score de honte: ${result.score}/100\n\n"${result.citation}"\n\n#RoastMyCode`;

      const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(xUrl, "_blank");
    } catch {
      showToast(t.errorShare);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyQuote = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(
        `"${result.citation}" — RoastMyCode (score: ${result.score}/100)`
      );
      showToast(t.copied);
    } catch {
      showToast(t.errorCopy);
    } finally {
      setCopying(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* THE ROAST CARD (exportable) */}
      <div
        ref={cardRef}
        style={{
          background: "linear-gradient(135deg, #0a0a14 0%, #1a0a2e 50%, #0a1420 100%)",
          border: "1px solid rgba(255,110,180,0.3)",
          borderRadius: "20px",
          padding: "32px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Fredoka One', 'Inter', monospace",
        }}
      >
        {/* Background decoration */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.05,
          backgroundImage: "radial-gradient(circle at 20% 20%, #ff6eb4 0%, transparent 50%), radial-gradient(circle at 80% 80%, #7fdbca 0%, transparent 50%)",
          pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px", position: "relative" }}>
          <Mascot mood={result.mascotMood} size={90} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase",
              color: LEVEL_COLORS[level] || "#ff6eb4", fontFamily: "Inter", fontWeight: 600, marginBottom: "6px"
            }}>
              Roast {level.toUpperCase()} | {result.language}
            </div>
            <div style={{
              fontSize: "1.5rem", fontFamily: "'Fredoka One', cursive",
              color: "#f0f0f8", lineHeight: 1.2, marginBottom: "8px"
            }}>
              {result.verdict}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                flex: 1, height: "8px", borderRadius: "999px",
                background: "rgba(255,255,255,0.08)", overflow: "hidden"
              }}>
                <div style={{
                  height: "100%", borderRadius: "999px",
                  width: `${result.score}%`,
                  background: `linear-gradient(90deg, #ff6eb4, ${shameColor})`,
                }} />
              </div>
              <span style={{ fontFamily: "'Fredoka One', cursive", color: shameColor, fontSize: "1rem", whiteSpace: "nowrap" }}>
                {result.score}/100
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#8888aa", fontFamily: "Inter", marginTop: "4px" }}>
              {t.shameIndex}: {shameLabel}
            </div>
          </div>
        </div>

        {/* Citation */}
        <div style={{
          background: "rgba(255,110,180,0.08)", border: "1px solid rgba(255,110,180,0.2)",
          borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", position: "relative"
        }}>
          <div style={{ fontSize: "0.7rem", color: "#ff6eb4", fontFamily: "Inter", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {t.roastPhrase}
          </div>
          <div style={{ fontSize: "1rem", color: "#f0f0f8", fontFamily: "'Fredoka One', cursive", lineHeight: 1.5, fontStyle: "italic" }}>
            &ldquo;{result.citation}&rdquo;
          </div>
        </div>

        {/* Roast text */}
        <div style={{ color: "#c0c0d8", lineHeight: 1.7, fontSize: "0.9rem", fontFamily: "Inter", marginBottom: "20px" }}>
          {result.roast}
        </div>

        {/* Worst line */}
        {result.worstLine && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.7rem", color: "#ff4757", fontFamily: "Inter", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {t.worstLine}
            </div>
            <div style={{
              background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)",
              borderRadius: "8px", padding: "12px 16px"
            }}>
              <code style={{ color: "#ff8c42", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", display: "block", marginBottom: "6px" }}>
                {result.worstLine}
              </code>
              <div style={{ color: "#8888aa", fontSize: "0.8rem", fontFamily: "Inter" }}>
                {result.worstLineComment}
              </div>
            </div>
          </div>
        )}

        {/* Badges */}
        {result.badges?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
            {result.badges.map((badge, i) => (
              <span key={i} style={{
                padding: "4px 14px", borderRadius: "999px", fontSize: "0.75rem",
                fontFamily: "Inter", fontWeight: 600,
                background: ["rgba(255,110,180,0.15)", "rgba(127,219,202,0.15)", "rgba(255,230,109,0.15)"][i % 3],
                color: ["#ff6eb4", "#7fdbca", "#ffe66d"][i % 3],
                border: `1px solid ${["rgba(255,110,180,0.3)", "rgba(127,219,202,0.3)", "rgba(255,230,109,0.3)"][i % 3]}`,
              }}>
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "16px"
        }}>
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: "1rem", color: "#ff6eb4" }}>
            roastmycode.dev
          </span>
          <span style={{ fontSize: "0.75rem", color: "#8888aa", fontFamily: "Inter" }}>
            {t.poweredBy}
          </span>
        </div>
      </div>

      {/* Share actions */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={handleShareX} disabled={sharing}>
          {sharing ? (
            <><span className="spinner" />{t.sharing}</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.736l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              {t.shareX}
            </>
          )}
        </button>
        <button className="btn btn-ghost" onClick={handleCopyQuote} disabled={copying}>
          {copying ? <span className="spinner" /> : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          {t.copyQuote}
        </button>
        <button className="btn btn-ghost" onClick={handleDownload} disabled={downloading}>
          {downloading ? <span className="spinner" /> : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
          {t.download}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}
    </div>
  );
}
