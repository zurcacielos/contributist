import { NextResponse } from "next/server";
import { GeneratorConfig } from "@/types";
import { generateCommits } from "@/utils/gitGenerator";
import { exec, spawn } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { logEvent } from "@/utils/logger";
import { getFileTimestamp } from "@/utils/dateHelper";

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const config: GeneratorConfig = await request.json();

    if (!config.repoUrl) {
      return NextResponse.json({ error: "Repository URL is required." }, { status: 400 });
    }
    if (!config.gitName || !config.gitName.trim()) {
      return NextResponse.json({ error: "Git Username is required." }, { status: 400 });
    }
    if (!config.gitEmail || !config.gitEmail.trim()) {
      return NextResponse.json({ error: "Git Email is required." }, { status: 400 });
    }

    await logEvent(`[Button 1] Started Local Generation for: ${config.repoUrl}`);

    let repoName = "fake_repo";
    const start = config.repoUrl.lastIndexOf("/") + 1;
    const end = config.repoUrl.lastIndexOf(".");
    if (start > 0 && end > start) {
      repoName = config.repoUrl.substring(start, end);
    }

    const timestamp = getFileTimestamp();
    
    const folderName = `${repoName}-${timestamp}`;
    const generatedDir = path.join(process.cwd(), "generated");
    const targetDir = path.join(generatedDir, folderName);
    const logsDir = path.join(process.cwd(), "logs");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.mkdirSync(logsDir, { recursive: true });

    // Generate pure algorithmic layer for the logs
    const pureAlgoCommits = generateCommits({ ...config, paintedLayer: {} });
    const algoLayer: Record<string, number> = {};
    pureAlgoCommits.forEach(c => {
      const dStr = c.dateStr.split("T")[0];
      algoLayer[dStr] = (algoLayer[dStr] || 0) + 1;
    });
    
    // Convert counts to levels
    Object.keys(algoLayer).forEach(dStr => {
      const c = algoLayer[dStr];
      let level = 0;
      if (c === 1) level = 1;
      else if (c > 1 && c <= 3) level = 2;
      else if (c > 3 && c <= 5) level = 3;
      else if (c > 5) level = 4;
      algoLayer[dStr] = level;
    });

    const logData = {
      ...config,
      algoLayer
    };

    // Dump config to logs for debugging
    fs.writeFileSync(path.join(logsDir, `${folderName}.json`), JSON.stringify(logData, null, 2));

    const runGit = async (args: string) => {
      const cmd = `git ${args}`;
      await execAsync(cmd, { cwd: targetDir });
    };

    await runGit("init -b main");

    // Use Git identity from frontend config
    let authorName = config.gitName.trim();
    let authorEmail = config.gitEmail.trim();

    // Configure Git identity locally to prevent "Please tell me who you are" errors on machines with no global git config
    const escapedName = authorName.replace(/"/g, '\\"');
    const escapedEmail = authorEmail.replace(/"/g, '\\"');
    await runGit(`config user.name "${escapedName}"`);
    await runGit(`config user.email "${escapedEmail}"`);

    const commits = generateCommits(config);

    // Run git fast-import
    await new Promise<void>((resolve, reject) => {
      const fastImport = spawn("git", ["fast-import"], { cwd: targetDir });

      let stderr = "";
      if (fastImport.stderr) {
        fastImport.stderr.on("data", (data) => {
          stderr += data.toString();
        });
      }

      fastImport.on("error", (err) => reject(err));
      fastImport.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`git fast-import exited with code ${code}. Stderr: ${stderr.trim()}`));
        } else {
          resolve();
        }
      });

      let fastImportInput = "";

      for (const c of commits) {
        const fileContent = `Update: ${c.dateStr} - ${c.msg}\n`;
        const unixTime = Math.floor(new Date(c.dateStr).getTime() / 1000);
        
        fastImportInput += `commit refs/heads/main\n`;
        fastImportInput += `committer ${authorName} <${authorEmail}> ${unixTime} +0000\n`;
        fastImportInput += `data ${Buffer.byteLength(c.msg, "utf8")}\n${c.msg}\n`;
        fastImportInput += `M 100644 inline README.md\n`;
        fastImportInput += `data ${Buffer.byteLength(fileContent, "utf8")}\n${fileContent}\n`;
      }

      // Save input stream to log file for debugging and auditing purposes
      fs.writeFileSync(path.join(logsDir, `${folderName}.input`), fastImportInput);

      fastImport.stdin.write(fastImportInput);
      fastImport.stdin.end();
    });

    // Check out the generated files to the working directory
    await runGit("checkout main");

    await logEvent(`[Button 1] Completed Local Generation. Folder: ${folderName}, Commits: ${commits.length}`);

    return NextResponse.json({ 
      success: true, 
      folderName,
      absolutePath: targetDir,
      message: `Successfully generated ${commits.length} commits in ./generated/${folderName}`
    });

  } catch (error: any) {
    console.error("Local generate error:", error);
    await logEvent(`[Button 1] ERROR: ${error.message}`);
    return NextResponse.json({ 
      error: error.message || "Failed to generate local commits." 
    }, { status: 500 });
  }
}
