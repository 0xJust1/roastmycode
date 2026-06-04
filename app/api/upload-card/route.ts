import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const CARDS_DIR = path.join(process.cwd(), "public", "cards");

export async function POST(req: NextRequest) {
  try {
    const { dataUrl } = await req.json();

    if (!dataUrl || !dataUrl.startsWith("data:image/png;base64,")) {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const base64 = dataUrl.replace("data:image/png;base64,", "");
    const buffer = Buffer.from(base64, "base64");
    const id = uuidv4();
    const filename = `${id}.png`;

    let cardUrl: string;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://roastmycode.wtf";

    // Production: use Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`cards/${filename}`, buffer, {
        access: "public",
        contentType: "image/png",
      });
      cardUrl = blob.url;
    } else {
      // Dev fallback: save locally
      if (!fs.existsSync(CARDS_DIR)) {
        fs.mkdirSync(CARDS_DIR, { recursive: true });
      }
      fs.writeFileSync(path.join(CARDS_DIR, filename), buffer);
      cardUrl = `${baseUrl}/cards/${filename}`;
    }

    const shareUrl = `${baseUrl}/share/${id}`;

    return NextResponse.json({ id, cardUrl, shareUrl });
  } catch (err) {
    console.error("Upload card error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
