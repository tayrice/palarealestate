import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

// Max 10MB pro Datei, nur Bilder
const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "Keine Dateien" }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Ungültiger Dateityp: ${file.type}` }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Datei zu groß (max. 10 MB)" }, { status: 400 });
      }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filename = `${randomUUID()}.${ext}`;
      const bytes = await file.arrayBuffer();
      await writeFile(join(uploadDir, filename), Buffer.from(bytes));
      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 500 });
  }
}
