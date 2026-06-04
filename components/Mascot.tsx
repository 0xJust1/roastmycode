"use client";

type MascotMood = "dead" | "horrified" | "crying" | "laughing" | "shocked" | "idle";

interface MascotProps {
  mood: MascotMood;
  size?: number;
  className?: string;
}

const expressions: Record<MascotMood, { eyes: string; mouth: string; extras: string }> = {
  idle: {
    eyes: `<circle cx="14" cy="18" r="3" fill="#1a1a2e"/>
            <circle cx="34" cy="18" r="3" fill="#1a1a2e"/>
            <circle cx="15" cy="17" r="1" fill="white"/>
            <circle cx="35" cy="17" r="1" fill="white"/>`,
    mouth: `<path d="M18 26 Q24 30 30 26" stroke="#1a1a2e" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    extras: "",
  },
  laughing: {
    eyes: `<path d="M11 18 Q14 15 17 18" stroke="#1a1a2e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M31 18 Q34 15 37 18" stroke="#1a1a2e" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    mouth: `<path d="M15 25 Q24 35 33 25" stroke="#1a1a2e" stroke-width="2" fill="#FF6EB4" stroke-linecap="round"/>`,
    extras: `<text x="3" y="12" font-size="8" opacity="0.7">ha</text>
              <text x="36" y="10" font-size="7" opacity="0.7">ha</text>
              <text x="20" y="5" font-size="9" opacity="0.8">HA</text>`,
  },
  crying: {
    eyes: `<circle cx="14" cy="18" r="3" fill="#1a1a2e"/>
            <circle cx="34" cy="18" r="3" fill="#1a1a2e"/>
            <circle cx="15" cy="17" r="1" fill="white"/>
            <circle cx="35" cy="17" r="1" fill="white"/>
            <path d="M13 21 Q12 26 14 30" stroke="#7fdbca" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M35 21 Q34 26 36 30" stroke="#7fdbca" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    mouth: `<path d="M18 28 Q24 24 30 28" stroke="#1a1a2e" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    extras: `<text x="2" y="14" font-size="10" opacity="0.6">TT</text>
              <text x="35" y="12" font-size="9" opacity="0.6">QQ</text>`,
  },
  horrified: {
    eyes: `<circle cx="14" cy="17" r="4" fill="#1a1a2e"/>
            <circle cx="34" cy="17" r="4" fill="#1a1a2e"/>
            <circle cx="15" cy="15.5" r="1.5" fill="white"/>
            <circle cx="35" cy="15.5" r="1.5" fill="white"/>`,
    mouth: `<ellipse cx="24" cy="28" rx="5" ry="4" fill="#1a1a2e"/>`,
    extras: `<path d="M8 8 L12 4" stroke="#ff4757" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M38 8 L36 4" stroke="#ff4757" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M5 15 L1 13" stroke="#ff4757" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M43 15 L47 13" stroke="#ff4757" stroke-width="1.5" stroke-linecap="round"/>`,
  },
  shocked: {
    eyes: `<circle cx="14" cy="17" r="4.5" fill="white"/>
            <circle cx="14" cy="17" r="2.5" fill="#1a1a2e"/>
            <circle cx="34" cy="17" r="4.5" fill="white"/>
            <circle cx="34" cy="17" r="2.5" fill="#1a1a2e"/>`,
    mouth: `<ellipse cx="24" cy="27" rx="4" ry="3" fill="#1a1a2e"/>`,
    extras: `<text x="1" y="10" font-size="11" opacity="0.7">!!</text>
              <text x="37" y="10" font-size="11" opacity="0.7">!!</text>`,
  },
  dead: {
    eyes: `<line x1="11" y1="15" x2="17" y2="21" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="17" y1="15" x2="11" y2="21" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="31" y1="15" x2="37" y2="21" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="37" y1="15" x2="31" y2="21" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round"/>`,
    mouth: `<path d="M18 28 Q24 23 30 28" stroke="#1a1a2e" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    extras: `<text x="20" y="5" font-size="10">💀</text>`,
  },
};

export default function Mascot({ mood, size = 120, className = "" }: MascotProps) {
  const expr = expressions[mood] || expressions.idle;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      style={{ filter: "drop-shadow(0 0 12px rgba(255,110,180,0.5))" }}
    >
      {/* Body */}
      <ellipse cx="24" cy="40" rx="12" ry="5" fill="rgba(0,0,0,0.2)" />

      {/* Ears */}
      <path d="M8 20 L4 8 L14 14 Z" fill="#FF6EB4" />
      <path d="M40 20 L44 8 L34 14 Z" fill="#FF6EB4" />
      <path d="M8 18 L5.5 10 L12 14 Z" fill="#ffb3d6" />
      <path d="M40 18 L42.5 10 L36 14 Z" fill="#ffb3d6" />

      {/* Head */}
      <circle cx="24" cy="24" r="18" fill="#FF6EB4" />
      <circle cx="24" cy="24" r="15" fill="#ffb3d6" />

      {/* Cheeks */}
      <circle cx="11" cy="26" r="4" fill="#FF6EB4" opacity="0.5" />
      <circle cx="37" cy="26" r="4" fill="#FF6EB4" opacity="0.5" />

      {/* Eyes */}
      <g dangerouslySetInnerHTML={{ __html: expr.eyes }} />

      {/* Nose */}
      <ellipse cx="24" cy="22" rx="2" ry="1.5" fill="#1a1a2e" opacity="0.4" />

      {/* Mouth */}
      <g dangerouslySetInnerHTML={{ __html: expr.mouth }} />

      {/* Extras (tears, symbols, etc.) */}
      <g dangerouslySetInnerHTML={{ __html: expr.extras }} />
    </svg>
  );
}
