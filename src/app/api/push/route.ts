import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { logEvent } from "@/utils/logger";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { folderName, repoUrl, force } = await request.json();

    if (!folderName || !repoUrl) {
      return NextResponse.json({ error: "folderName and repoUrl are required." }, { status: 400 });
    }

    await logEvent(`[Button 2] Started Push for folder: ${folderName} to URL: ${repoUrl} (Force: ${!!force})`);

    const generatedDir = path.join(process.cwd(), "generated");
    const targetDir = path.join(generatedDir, folderName);

    if (!fs.existsSync(targetDir)) {
      return NextResponse.json({ error: "Local repository not found. Did you generate it?" }, { status: 404 });
    }

    const runGit = async (args: string) => {
      const cmd = `git ${args}`;
      await execAsync(cmd, { cwd: targetDir });
    };

    try {
      await runGit(`remote add origin ${repoUrl}`);
    } catch (err) {
      // If remote already exists, just update its URL in case they changed it
      await runGit(`remote set-url origin ${repoUrl}`);
    }
    
    if (force) {
      await runGit("push -f -u origin main");
    } else {
      await runGit("push -u origin main");
    }

    await logEvent(`[Button 2] Completed Push successfully.`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully pushed to remote${force ? ' (forced)' : ''}!`
    });

  } catch (error: any) {
    console.error("Push error:", error);
    await logEvent(`[Button 2] ERROR: ${error.message}`);
    return NextResponse.json({ 
      error: error.message || "Failed to push to remote." 
    }, { status: 500 });
  }
}
