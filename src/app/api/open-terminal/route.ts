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

    // Safety check: prevent path traversal
    const resolvedPath = path.resolve(targetDir);
    if (!resolvedPath.startsWith(generatedDir)) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: "Folder does not exist." }, { status: 404 });
    }

    await logEvent(`[Terminal] Opening terminal in folder: ${resolvedPath}`);

    // Detect OS platform and execute the corresponding native terminal command
    let command = "";
    switch (process.platform) {
      case "win32":
        // start /D opens cmd and sets the working directory directly
        command = `start /D "${resolvedPath}" cmd.exe`;
        break;
      case "darwin":
        // AppleScript to open default macOS Terminal and cd to the target directory
        command = `osascript -e 'tell application "Terminal" to do script "cd \\"${resolvedPath}\\""' -e 'tell application "Terminal" to activate'`;
        break;
      default:
        // Linux terminal command: try gnome-terminal, then fallback to generic xterm
        command = `gnome-terminal --working-directory="${resolvedPath}" || xterm -hold -e "cd '${resolvedPath}' && exec bash"`;
        break;
    }

    exec(command, (err) => {
      if (err) {
        console.error("Open terminal error:", err);
      }
    });

    return NextResponse.json({ success: true, path: resolvedPath });
  } catch (error: any) {
    console.error("Open terminal handler error:", error);
    return NextResponse.json({ error: error.message || "Failed to open terminal." }, { status: 500 });
  }
}
