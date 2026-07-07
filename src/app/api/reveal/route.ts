import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { logEvent } from "@/utils/logger";

export async function POST(request: Request) {
  try {
    const { folderName } = await request.json();
    if (!folderName) {
      return NextResponse.json({ error: "Folder name is required." }, { status: 400 });
    }

    const generatedDir = path.join(process.cwd(), "generated");
    const targetDir = path.join(generatedDir, folderName);

    // Safety check: ensure the target is within processed generated directory to prevent path traversal
    const resolvedPath = path.resolve(targetDir);
    if (!resolvedPath.startsWith(generatedDir)) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: "Folder does not exist." }, { status: 404 });
    }

    await logEvent(`[Reveal] Revealing folder in explorer: ${resolvedPath}`);

    // Detect OS platform and execute the corresponding native file manager open command
    let command = "";
    switch (process.platform) {
      case "win32":
        command = `explorer.exe "${resolvedPath}"`;
        break;
      case "darwin":
        command = `open "${resolvedPath}"`;
        break;
      default:
        command = `xdg-open "${resolvedPath}"`;
        break;
    }

    exec(command, (err) => {
      if (err) {
        console.error("Reveal error:", err);
      }
    });

    return NextResponse.json({ success: true, path: resolvedPath });
  } catch (error: any) {
    console.error("Reveal handler error:", error);
    return NextResponse.json({ error: error.message || "Failed to reveal folder." }, { status: 500 });
  }
}
