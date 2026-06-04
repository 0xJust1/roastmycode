import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RoastMyCode - L'IA qui demolit ton code avec style";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0a14 0%, #1a0a2e 55%, #0a1420 100%)",
          position: "relative",
          overflow: "hidden",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,110,180,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,110,180,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top center glow */}
        <div style={{
          position: "absolute", top: "-120px", left: "50%",
          transform: "translateX(-50%)", width: "900px", height: "500px",
          background: "radial-gradient(ellipse, rgba(168,85,247,0.12) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* Left glow behind mascot */}
        <div style={{
          position: "absolute", right: "0px", top: "50%",
          transform: "translateY(-50%)", width: "500px", height: "500px",
          background: "radial-gradient(ellipse, rgba(255,110,180,0.18) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* LEFT SIDE — Text content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, zIndex: 1, paddingRight: "40px" }}>

          {/* Badge */}
          <div style={{
            display: "flex", alignItems: "center",
            padding: "8px 20px", borderRadius: "999px",
            background: "rgba(255,110,180,0.12)",
            border: "1px solid rgba(255,110,180,0.3)",
            color: "#ff6eb4", fontSize: "18px", fontWeight: 700,
            marginBottom: "28px", width: "fit-content",
            letterSpacing: "0.05em", textTransform: "uppercase",
          }}>
            roastmycode.wtf
          </div>

          {/* Title */}
          <div style={{
            display: "flex", flexDirection: "column",
            fontSize: "88px", fontWeight: 900, lineHeight: 0.95,
            letterSpacing: "-3px", marginBottom: "24px",
          }}>
            <span style={{ color: "#ff6eb4" }}>Roast</span>
            <span style={{ color: "#f0f0f8" }}>My</span>
            <span style={{
              background: "linear-gradient(135deg, #a855f7, #7fdbca)",
              backgroundClip: "text", color: "transparent",
              display: "flex",
            }}>Code</span>
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: "24px", color: "#8888aa",
            lineHeight: 1.5, marginBottom: "40px",
            maxWidth: "520px",
            display: "flex",
          }}>
            Colle ton code. L'IA le massacre avec humour. Partage ta honte.
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "32px" }}>
            {[
              { icon: "🔥", text: "3 niveaux de brutalite" },
              { icon: "🃏", text: "Roast Card partageable" },
              { icon: "⚡", text: "Resultats instantanes" },
            ].map((item) => (
              <div key={item.text} style={{
                display: "flex", alignItems: "center", gap: "8px",
                color: "#c0c0d8", fontSize: "17px",
              }}>
                <span style={{ fontSize: "20px" }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE — Big mascot */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, zIndex: 1,
          filter: "drop-shadow(0 0 60px rgba(255,110,180,0.5))",
        }}>
          <svg width="320" height="320" viewBox="0 0 48 48">
            {/* Body shadow */}
            <ellipse cx="24" cy="43" rx="14" ry="4" fill="rgba(0,0,0,0.3)" />
            {/* Ears */}
            <path d="M8 20 L4 8 L14 14 Z" fill="#FF6EB4" />
            <path d="M40 20 L44 8 L34 14 Z" fill="#FF6EB4" />
            <path d="M8 18 L5.5 10 L12 14 Z" fill="#ffb3d6" />
            <path d="M40 18 L42.5 10 L36 14 Z" fill="#ffb3d6" />
            {/* Head */}
            <circle cx="24" cy="24" r="18" fill="#FF6EB4" />
            <circle cx="24" cy="24" r="15" fill="#ffb3d6" />
            {/* Cheeks */}
            <circle cx="11" cy="26" r="4.5" fill="#FF6EB4" opacity="0.55" />
            <circle cx="37" cy="26" r="4.5" fill="#FF6EB4" opacity="0.55" />
            {/* Eyes — horrified wide open */}
            <circle cx="14" cy="17" r="4.5" fill="#1a1a2e" />
            <circle cx="34" cy="17" r="4.5" fill="#1a1a2e" />
            <circle cx="15.5" cy="15.5" r="1.8" fill="white" />
            <circle cx="35.5" cy="15.5" r="1.8" fill="white" />
            {/* Nose */}
            <ellipse cx="24" cy="22" rx="2" ry="1.5" fill="#1a1a2e" opacity="0.3" />
            {/* Mouth — shocked O */}
            <ellipse cx="24" cy="29" rx="5.5" ry="4.5" fill="#1a1a2e" />
            {/* Sweat drop */}
            <ellipse cx="6" cy="15" rx="1.5" ry="2.5" fill="#7fdbca" opacity="0.8" />
            {/* Shock lines */}
            <line x1="7" y1="8" x2="11" y2="4" stroke="#ff4757" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="41" y1="8" x2="39" y2="4" stroke="#ff4757" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="4" y1="16" x2="0" y2="14" stroke="#ff4757" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="44" y1="16" x2="48" y2="14" stroke="#ff4757" strokeWidth="1.5" strokeLinecap="round" />
            {/* Speech bubble */}
            <rect x="30" y="2" width="18" height="10" rx="3" fill="#ff4757" opacity="0.9" />
            <path d="M32 12 L30 15 L35 12 Z" fill="#ff4757" opacity="0.9" />
            <text x="39" y="10" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">wtf</text>
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
