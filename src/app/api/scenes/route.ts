import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const scenesDir = path.join(process.cwd(), "public", "templates", "scenes");
    
    // Check if directory exists
    if (!fs.existsSync(scenesDir)) {
      return NextResponse.json({ scenes: [] });
    }

    const files = fs.readdirSync(scenesDir);
    const jsonFiles = files.filter(f => f.endsWith(".json"));

    const scenes = jsonFiles.map(filename => {
      try {
        const filePath = path.join(scenesDir, filename);
        const content = fs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(content);
        
        return {
          id: filename.replace(".json", ""),
          title: parsed.title || filename.replace(".json", ""),
          description: parsed.description || "",
          emoji: parsed.emoji || "✨",
          config: parsed.config || null,
          filename
        };
      } catch (e) {
        console.error(`Failed to parse scene file ${filename}:`, e);
        return null;
      }
    }).filter(s => s !== null);

    return NextResponse.json({ scenes });
  } catch (error: any) {
    console.error("Scenes API error:", error);
    return NextResponse.json({ error: error.message || "Failed to load scenes." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Only allowed in development mode." }, { status: 403 });
    }

    const body = await request.json();
    const { filename, content } = body;

    if (!filename || !filename.endsWith(".json")) {
      return NextResponse.json({ error: "Invalid filename." }, { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const baseName = path.basename(filename);
    const scenesDir = path.join(process.cwd(), "public", "templates", "scenes");
    const filePath = path.join(scenesDir, baseName);

    const fileContentStr = JSON.stringify(content, null, 2);
    fs.writeFileSync(filePath, fileContentStr, "utf8");

    // Create a backup copy under public/templates/scenes/backup/
    try {
      const backupDir = path.join(scenesDir, "backup");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      const mixName = baseName.replace(/\.json$/, "");
      const backupFilePath = path.join(backupDir, `${mixName}_${timestamp}.json`);
      fs.writeFileSync(backupFilePath, fileContentStr, "utf8");
    } catch (backupError) {
      console.error("Failed to create scene backup copy:", backupError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to save scene:", error);
    return NextResponse.json({ error: error.message || "Failed to save scene." }, { status: 500 });
  }
}
