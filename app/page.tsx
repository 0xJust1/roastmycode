"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Mascot from "@/components/Mascot";
import RoastCard from "@/components/RoastCard";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type RoastLevel = "doux" | "brutal" | "impitoyable" | "gordon";
type Lang = "fr" | "en";
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

const LEVELS = {
  fr: [
    { value: "doux" as RoastLevel, label: "Doux", emoji: "☕", desc: "Critique bienveillante" },
    { value: "brutal" as RoastLevel, label: "Brutal", emoji: "🔥", desc: "Stand-up comedy" },
    { value: "impitoyable" as RoastLevel, label: "Impitoyable", emoji: "💀", desc: "Zero pitie" },
    { value: "gordon" as RoastLevel, label: "Gordon Ramsay", emoji: "👨‍🍳", desc: "Hell's Kitchen mode" },
  ],
  en: [
    { value: "doux" as RoastLevel, label: "Gentle", emoji: "☕", desc: "Friendly critique" },
    { value: "brutal" as RoastLevel, label: "Brutal", emoji: "🔥", desc: "Stand-up comedy" },
    { value: "impitoyable" as RoastLevel, label: "Merciless", emoji: "💀", desc: "Zero mercy" },
    { value: "gordon" as RoastLevel, label: "Gordon Ramsay", emoji: "👨‍🍳", desc: "Hell's Kitchen mode" },
  ],
};

const T = {
  fr: {
    badge: "Analyse de code par IA — Résultats instantanés",
    tagline: "Colle ton code. Une IA open-source le massacre avec humour.",
    tagline2: "Partage ta honte. Défie tes collègues.",
    roastsCount: "Roasts effectués",
    dignityCount: "Dignité détruite",
    colleaguesCount: "Collègues humiliés",
    levelTitle: "Niveau de brutalité",
    exampleBtn: "Exemple crade",
    resetBtn: "Reset",
    roastBtn: "Roaste mon code",
    loadingBtn: "L'IA analyse ton désastre...",
    errorPrefix: "",
    resultTitle: "Le verdict est tombé...",
    resultSub: "Partage ta Roast Card et défie tes collègues",
    reRoast: "Re-roaster ce code",
    newCode: "Nouveau code",
    howTitle: "Comment ça marche ?",
    steps: [
      { title: "Colle ton code", desc: "N'importe quel langage. Plus c'est crade, mieux c'est." },
      { title: "Choisis ton niveau", desc: "De la critique douce au massacre absolu." },
      { title: "L'IA frappe", desc: "Notre IA analyse et démolit avec style." },
      { title: "Partage ta honte", desc: "Télécharge ta Roast Card. Défie tes collègues." },
    ],
    footerPowered: "Propulsé par IA",
    emptyError: "Colle du code d'abord !",
    tipTitle: "Aide la mascotte à survivre",
    tipDesc: "Chaque roast consomme de l'électricité et détruit la dignité de notre IA. Offre un café ou quelques cryptos pour payer les serveurs et des croquettes à la mascotte !",
    tipCopy: "Copier",
    tipCopied: "Copié !",
    tipCoffee: "Offrir un café",
    githubTab: "Dépôt GitHub",
    pasteTab: "Coller le code",
    githubPlaceholder: "Saisis l'URL d'un dépôt public GitHub (ex: owner/repo)",
    wallTitle: "Le Mur de la Honte",
    wallSub: "Les pires codes et les verdicts les plus brutaux de la communauté",
    wallRoastedBy: "Roasté par",
  },
  en: {
    badge: "AI-powered code analysis — Instant results",
    tagline: "Paste your code. An open-source AI destroys it with humour.",
    tagline2: "Share your shame. Challenge your colleagues.",
    roastsCount: "Roasts done",
    dignityCount: "Dignity destroyed",
    colleaguesCount: "Colleagues humiliated",
    levelTitle: "Brutality level",
    exampleBtn: "Dirty example",
    resetBtn: "Reset",
    roastBtn: "Roast my code",
    loadingBtn: "AI is analysing your disaster...",
    errorPrefix: "",
    resultTitle: "The verdict is in...",
    resultSub: "Share your Roast Card and challenge your colleagues",
    reRoast: "Re-roast this code",
    newCode: "New code",
    howTitle: "How does it work?",
    steps: [
      { title: "Paste your code", desc: "Any language. The worse, the better." },
      { title: "Pick your level", desc: "From gentle critique to absolute massacre." },
      { title: "AI strikes", desc: "Our AI analyses and demolishes with style." },
      { title: "Share your shame", desc: "Download your Roast Card. Challenge colleagues." },
    ],
    footerPowered: "Powered by AI",
    emptyError: "Paste some code first!",
    tipTitle: "Help the mascot survive",
    tipDesc: "Every roast consumes electricity and destroys our AI's dignity. Buy a coffee or send some crypto to pay for servers and buy kibbles for the mascot!",
    tipCopy: "Copy",
    tipCopied: "Copied!",
    tipCoffee: "Buy me a coffee",
    githubTab: "GitHub Repo",
    pasteTab: "Paste Code",
    githubPlaceholder: "Enter a public GitHub repository URL (e.g., owner/repo)",
    wallTitle: "The Wall of Shame",
    wallSub: "The worst code and most brutal verdicts shared by the community",
    wallRoastedBy: "Roasted by",
  },
};

const EXAMPLE_CODE = `function calcul(a,b,c,d,e,f,g) {
  var result = 0
  for(var i=0;i<a;i++){
    for(var j=0;j<b;j++){
      for(var k=0;k<c;k++){
        result = result + d * e - f / g + Math.random()
      }
    }
  }
  return result
}

var x = calcul(10,20,30,1,2,3,4)
console.log(x)`;

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [code, setCode] = useState("");
  const [level, setLevel] = useState<RoastLevel>("brutal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [totalRoasts, setTotalRoasts] = useState<number | null>(null);
  const [importMode, setImportMode] = useState<"paste" | "github">("paste");
  const [githubUrl, setGithubUrl] = useState("");
  const [wallRoasts, setWallRoasts] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const t = T[lang];
  const levels = LEVELS[lang];

  const ethAddress = process.env.NEXT_PUBLIC_DONATION_ETH_ADDRESS;
  const coffeeUrl = process.env.NEXT_PUBLIC_DONATION_COFFEE_URL;

  const handleCopyAddress = () => {
    if (!ethAddress) return;
    navigator.clipboard.writeText(ethAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchWall = () => {
    fetch("/api/wall")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setWallRoasts(data);
      })
      .catch(() => {});
  };

  // Load real counter and wall on mount
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setTotalRoasts(data.total))
      .catch(() => setTotalRoasts(0));

    fetchWall();
  }, [result]);

  const handleCodeChange = useCallback((val: string | undefined) => {
    const v = val ?? "";
    setCode(v);
    setCharCount(v.length);
  }, []);

  const handleRoast = async () => {
    const inputCode = importMode === "github" ? githubUrl : code;
    if (!inputCode.trim()) {
      setError(importMode === "github" ? (lang === "en" ? "Enter a public GitHub repository URL first!" : "Saisis un lien de depot GitHub public d'abord !") : t.emptyError);
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: inputCode,
          level,
          lang,
          isGithub: importMode === "github"
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API Error");
      setResult(data);

      // Increment real counter
      fetch("/api/stats", { method: "POST" })
        .then((r) => r.json())
        .then((stats) => setTotalRoasts(stats.total))
        .catch(() => {});

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleExample = () => {
    setCode(EXAMPLE_CODE);
    setCharCount(EXAMPLE_CODE.length);
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
    setError(null);
    setCharCount(0);
  };

  const formatCount = (n: number | null) => {
    if (n === null) return "...";
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
  };

  return (
    <main>
      {/* HERO */}
      <section style={{ paddingTop: "80px", paddingBottom: "60px", textAlign: "center" }}>
        <div className="container">
          {/* Lang toggle */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "32px" }}>
            <div style={{
              display: "flex", background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "999px", padding: "4px", gap: "4px"
            }}>
              {(["fr", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "6px 16px", borderRadius: "999px", border: "none", cursor: "pointer",
                    fontFamily: "Inter", fontWeight: 600, fontSize: "0.82rem",
                    background: lang === l ? "var(--accent-pink)" : "transparent",
                    color: lang === l ? "#fff" : "var(--text-muted)",
                    transition: "all 0.2s ease",
                  }}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="animate-float" style={{ display: "inline-block", marginBottom: "24px" }}>
            <Mascot mood={loading ? "horrified" : result ? result.mascotMood : "idle"} size={110} />
          </div>

          <div className="badge badge-pink" style={{ marginBottom: "20px" }}>
            {t.badge}
          </div>

          <h1 className="font-kawaii" style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", lineHeight: 1.1, marginBottom: "16px" }}>
            <span className="gradient-text">Roast My Code</span>
          </h1>

          <p style={{ fontSize: "1.15rem", color: "var(--text-muted)", maxWidth: "520px", margin: "0 auto 40px", lineHeight: 1.7 }}>
            {t.tagline}<br />{t.tagline2}
          </p>

          {/* Real stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
            {[
              { label: t.roastsCount, value: formatCount(totalRoasts) },
              { label: t.dignityCount, value: "∞" },
              { label: t.colleaguesCount, value: formatCount(totalRoasts) },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div className="font-kawaii" style={{ fontSize: "1.6rem", color: "var(--accent-pink)" }}>{s.value}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "Inter" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDITOR SECTION */}
      <section style={{ paddingBottom: "80px" }}>
        <div className="container">
          <div style={{ display: "grid", gap: "24px" }}>

            {/* Level selector */}
            <div className="card">
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "16px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {t.levelTitle}
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "nowrap", overflowX: "auto" }}>
                {levels.map((l) => (
                  <button
                    key={l.value}
                    className={`level-option ${
                      level === l.value
                        ? l.value === "gordon" ? "active-gordon" : "active"
                        : ""
                    }`}
                    onClick={() => setLevel(l.value)}
                    style={{ flexShrink: 0 }}
                  >
                    <span style={{ marginRight: "6px" }}>{l.emoji}</span>
                    {l.label}
                    <span style={{ marginLeft: "8px", fontSize: "0.75rem", opacity: 0.7 }}>— {l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab selector */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "-14px" }}>
              {(["paste", "github"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setImportMode(mode)}
                  style={{
                    background: importMode === mode ? "var(--bg-card)" : "transparent",
                    color: importMode === mode ? "var(--accent-pink)" : "var(--text-muted)",
                    border: "1px solid " + (importMode === mode ? "var(--border)" : "transparent"),
                    borderBottom: importMode === mode ? "1px solid var(--bg-card)" : "none",
                    borderRadius: "12px 12px 0 0",
                    padding: "10px 20px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    zIndex: 1,
                    marginBottom: "-1px",
                    transition: "all 0.2s ease",
                  }}
                >
                  {mode === "paste" ? t.pasteTab : t.githubTab}
                </button>
              ))}
            </div>

            {/* Input rendering based on mode */}
            {importMode === "github" ? (
              <div className="card" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                  {t.githubTab}
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "460px", margin: "0 auto", lineHeight: 1.6 }}>
                  {t.githubPlaceholder}
                </p>
                <div style={{ width: "100%", maxWidth: "550px", display: "flex", gap: "12px", flexDirection: "column", alignItems: "stretch" }}>
                  <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/0xJust1/roastmycode"
                    style={{
                      width: "100%",
                      background: "rgba(10, 10, 20, 0.4)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      padding: "14px 20px",
                      fontSize: "1rem",
                      color: "#fff",
                      fontFamily: "JetBrains Mono, monospace",
                      outline: "none",
                      textAlign: "center",
                      boxSizing: "border-box",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--accent-pink)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border)"}
                  />
                </div>
              </div>
            ) : (
              /* Code editor */
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 20px", borderBottom: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["#ff4757", "#ffe66d", "#7fdbca"].map((c) => (
                      <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {charCount}/8000 chars
                    </span>
                    <button
                      onClick={handleExample}
                      style={{ fontSize: "0.75rem", color: "var(--accent-teal)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                    >
                      {t.exampleBtn}
                    </button>
                    <button
                      onClick={handleReset}
                      style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      {t.resetBtn}
                    </button>
                  </div>
                </div>
                <MonacoEditor
                  height="340px"
                  defaultLanguage="javascript"
                  value={code}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: "JetBrains Mono, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    lineNumbers: "on",
                    renderLineHighlight: "gutter",
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)",
                borderRadius: "var(--radius-sm)", padding: "12px 16px", color: "var(--accent-red)", fontSize: "0.9rem"
              }}>
                {error}
              </div>
            )}

            {/* CTA */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                className="btn btn-primary"
                onClick={handleRoast}
                disabled={loading || (importMode === "github" ? !githubUrl.trim() : !code.trim())}
                style={{ fontSize: "1.1rem", padding: "16px 48px" }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    {t.loadingBtn}
                  </>
                ) : (
                  <>
                    {t.roastBtn}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RESULT */}
      {result && (
        <section ref={resultRef} style={{ paddingBottom: "100px" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <h2 className="font-kawaii" style={{ fontSize: "1.8rem", color: "var(--accent-pink)", marginBottom: "8px" }}>
                {t.resultTitle}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                {t.resultSub}
              </p>
            </div>
            <RoastCard result={result} level={level} lang={lang} />

            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <button className="btn btn-secondary" onClick={handleRoast} style={{ marginRight: "12px" }}>
                {t.reRoast}
              </button>
              <button className="btn btn-ghost" onClick={handleReset}>
                {t.newCode}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      {!result && (
        <section style={{ paddingBottom: "100px" }}>
          <div className="container">
            <h2 className="font-kawaii" style={{ textAlign: "center", fontSize: "1.8rem", marginBottom: "40px" }}>
              {t.howTitle}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              {t.steps.map((item, i) => (
                <div key={i} className="card" style={{ textAlign: "center", padding: "28px" }}>
                  <div className="font-kawaii" style={{
                    fontSize: "2rem", marginBottom: "12px",
                    color: ["var(--accent-pink)", "var(--accent-teal)", "var(--accent-yellow)", "var(--accent-purple)"][i]
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-kawaii" style={{ fontSize: "1.1rem", marginBottom: "8px" }}>{item.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WALL OF SHAME SECTION */}
      {wallRoasts.length > 0 && (
        <section style={{ paddingBottom: "80px", borderTop: "1px solid var(--border)", paddingTop: "60px" }}>
          <div className="container">
            <h2 className="font-kawaii" style={{ textAlign: "center", fontSize: "2rem", marginBottom: "12px", color: "var(--accent-pink)" }}>
              {t.wallTitle}
            </h2>
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "48px", maxWidth: "600px", margin: "0 auto" }}>
              {t.wallSub}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
              {wallRoasts.slice(0, 6).map((roast) => (
                <a
                  key={roast.id}
                  href={`/share/${roast.id}?img=${encodeURIComponent(roast.imgUrl)}&lang=${roast.lang}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                  className="card-link"
                >
                  <div className="card shadow-hover" style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "24px",
                    background: "rgba(10, 10, 20, 0.4)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  >
                    <div>
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                        <div style={{
                          fontFamily: "'Fredoka One', cursive",
                          fontSize: "1.1rem",
                          color: "#f0f0f8",
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {roast.verdict}
                        </div>
                        <span style={{
                          fontFamily: "'Fredoka One', cursive",
                          fontSize: "1rem",
                          color: roast.score >= 75 ? "var(--accent-red)" : roast.score >= 50 ? "var(--accent-yellow)" : "var(--accent-teal)"
                        }}>
                          {roast.score}/100
                        </span>
                      </div>

                      {/* Citation */}
                      <p style={{
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                        background: "rgba(255, 255, 255, 0.03)",
                        borderLeft: "2px solid var(--accent-pink)",
                        padding: "8px 12px",
                        borderRadius: "0 6px 6px 0",
                        marginBottom: "16px"
                      }}>
                        &ldquo;{roast.citation}&rdquo;
                      </p>
                    </div>

                    {/* Footer / Meta */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                      paddingTop: "12px",
                      fontSize: "0.75rem",
                      color: "var(--text-muted)"
                    }}>
                      <span>Roast {roast.level.toUpperCase()}</span>
                      {roast.twitterHandle ? (
                        <span style={{ color: "var(--accent-teal)" }}>
                          {t.wallRoastedBy} {roast.twitterHandle}
                        </span>
                      ) : (
                        <span>Anonymous</span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TIP SECTION */}
      <section style={{ paddingBottom: "80px", borderTop: "1px solid var(--border)", paddingTop: "60px" }}>
        <div className="container" style={{ maxWidth: "600px" }}>
          <div className="card" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "36px",
            background: "rgba(10, 10, 20, 0.6)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 110, 180, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(255, 110, 180, 0.05)",
          }}>
            <div className="animate-float" style={{ marginBottom: "16px" }}>
              <Mascot mood="crying" size={80} />
            </div>
            
            <h2 className="font-kawaii" style={{ fontSize: "1.6rem", color: "var(--accent-pink)", marginBottom: "12px" }}>
              {t.tipTitle}
            </h2>
            
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "24px" }}>
              {t.tipDesc}
            </p>

            <div style={{ display: "flex", gap: "12px", flexDirection: "column", width: "100%", alignItems: "center" }}>
              {coffeeUrl && (
                <a
                  href={coffeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                    padding: "12px 24px",
                    fontSize: "0.95rem",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                    <line x1="6" y1="1" x2="6" y2="4" />
                    <line x1="10" y1="1" x2="10" y2="4" />
                    <line x1="14" y1="1" x2="14" y2="4" />
                  </svg>
                  {t.tipCoffee}
                </a>
              )}

              {ethAddress && (
                <div style={{
                  width: "100%",
                  background: "var(--bg-main)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginTop: "8px",
                  maxWidth: "420px",
                }}>
                  <div style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {ethAddress}
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    style={{
                      background: copied ? "var(--accent-teal)" : "rgba(255, 110, 180, 0.15)",
                      color: copied ? "#05050a" : "var(--accent-pink)",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    {copied ? t.tipCopied : t.tipCopy}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 0", textAlign: "center" }}>
        <div className="container">
          <span className="font-kawaii" style={{ color: "var(--accent-pink)", fontSize: "1.1rem" }}>RoastMyCode</span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: "16px" }}>
            {t.footerPowered}
          </span>
        </div>
      </footer>
    </main>
  );
}
