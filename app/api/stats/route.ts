import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

const STATS_KEY = "roastmycode:total";

// Local fallback (dev without Upstash configured)
const LOCAL_FILE = path.join(process.cwd(), "data", "stats.json");

function getRedis(): Redis | null {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return null;
}

function readLocal(): number {
  try {
    const raw = fs.readFileSync(LOCAL_FILE, "utf-8");
    return JSON.parse(raw).total ?? 0;
  } catch {
    return 0;
  }
}

function writeLocal(total: number) {
  try {
    fs.writeFileSync(LOCAL_FILE, JSON.stringify({ total }, null, 2), "utf-8");
  } catch {}
}

export async function GET() {
  const redis = getRedis();
  if (redis) {
    const val = await redis.get<number>(STATS_KEY);
    return NextResponse.json({ total: val ?? 0 });
  }
  return NextResponse.json({ total: readLocal() });
}

export async function POST(_req: NextRequest) {
  const redis = getRedis();
  if (redis) {
    const total = await redis.incr(STATS_KEY);
    return NextResponse.json({ total });
  }
  const total = readLocal() + 1;
  writeLocal(total);
  return NextResponse.json({ total });
}
