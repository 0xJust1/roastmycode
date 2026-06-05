import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scoreStr = searchParams.get("score") || "0";
  const level = searchParams.get("level") || "brutal";

  const score = parseInt(scoreStr, 10) || 0;

  // Determine color based on level
  let badgeColor = "#ff6eb4"; // Default pink (brutal)
  if (level === "gordon") badgeColor = "#ff8c00";
  else if (level === "impitoyable" || level === "merciless") badgeColor = "#ff4757";
  else if (level === "doux" || level === "gentle") badgeColor = "#7fdbca";

  const textColor = (level === "doux" || level === "gentle") ? "#0a0a14" : "#ffffff";

  // Dynamic SVG
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="140" height="20">
      <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>
      <mask id="a">
        <rect width="140" height="20" rx="3" fill="#fff"/>
      </mask>
      <g mask="url(#a)">
        <path fill="#0a0a14" d="M0 0h90v20H0z"/>
        <path fill="${badgeColor}" d="M90 0h50v20H90z"/>
        <path fill="url(#b)" d="M0 0h140v20H0z"/>
      </g>
      <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
        <text x="45" y="15" fill="#010101" fill-opacity=".3">RoastMyCode</text>
        <text x="45" y="14" fill="#ff6eb4">RoastMyCode</text>
        <text x="115" y="15" fill="#010101" fill-opacity=".3">${score}%</text>
        <text x="115" y="14" fill="${textColor}">${score}%</text>
      </g>
    </svg>
  `.trim();

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60, s-maxage=3600",
    },
  });
}
