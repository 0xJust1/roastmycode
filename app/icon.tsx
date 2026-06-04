import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "64px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a14",
          borderRadius: "14px",
        }}
      >
        <svg width="52" height="52" viewBox="0 0 48 48">
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
          {/* Eyes horrified */}
          <circle cx="14" cy="17" r="4" fill="#1a1a2e" />
          <circle cx="34" cy="17" r="4" fill="#1a1a2e" />
          <circle cx="15" cy="15.5" r="1.5" fill="white" />
          <circle cx="35" cy="15.5" r="1.5" fill="white" />
          {/* Mouth */}
          <ellipse cx="24" cy="28" rx="5" ry="4" fill="#1a1a2e" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
