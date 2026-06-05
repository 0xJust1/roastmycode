import { NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import fs from "fs";
import path from "path";

const LOCAL_FILE = path.join(process.cwd(), "data", "wall-of-shame.json");

interface WallRoast {
  id: string;
  verdict: string;
  score: number;
  level: string;
  lang: string;
  citation: string;
  mascotMood: string;
  twitterHandle?: string;
  imgUrl: string;
  createdAt: string;
}

async function getWallData(): Promise<WallRoast[]> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: "wall-of-shame.json" });
      const file = blobs.find((b) => b.pathname === "wall-of-shame.json");
      if (file) {
        const res = await fetch(file.url, { cache: "no-store" });
        if (res.ok) {
          const list = await res.json();
          return Array.isArray(list) ? list : [];
        }
      }
    } catch (err) {
      console.error("Error reading wall from Blob:", err);
    }
  } else {
    try {
      if (fs.existsSync(LOCAL_FILE)) {
        const raw = fs.readFileSync(LOCAL_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("Error reading wall from local file:", err);
    }
  }
  return [];
}

async function saveWallData(data: WallRoast[]) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await put("wall-of-shame.json", JSON.stringify(data, null, 2), {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json",
      });
    } catch (err) {
      console.error("Error writing wall to Blob:", err);
    }
  } else {
    try {
      const dir = path.dirname(LOCAL_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing wall to local file:", err);
    }
  }
}

export async function GET() {
  const data = await getWallData();
  // Sort by createdAt descending
  const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json(sorted);
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { id, verdict, score, level, lang, citation, mascotMood, twitterHandle, imgUrl } = payload;

    if (!id || !verdict || score === undefined || !level || !lang || !citation || !mascotMood || !imgUrl) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const currentList = await getWallData();

    // Check if already exists in list to avoid duplicates
    if (currentList.some((item) => item.id === id)) {
      return NextResponse.json({ success: true, message: "Already added" });
    }

    const newRoast: WallRoast = {
      id,
      verdict,
      score,
      level,
      lang,
      citation,
      mascotMood,
      twitterHandle: twitterHandle || "",
      imgUrl,
      createdAt: new Date().toISOString(),
    };

    currentList.push(newRoast);
    await saveWallData(currentList);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Wall add error:", err);
    return NextResponse.json({ error: "Failed to add roast to wall" }, { status: 500 });
  }
}
