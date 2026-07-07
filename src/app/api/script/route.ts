import { NextResponse } from "next/server";
import { GeneratorConfig } from "@/types";
import { generateCommits } from "@/utils/gitGenerator";
import { logEvent } from "@/utils/logger";

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
    
    await logEvent(`[Script Generation] Started for repo: ${config.repoUrl}`);

    let repoName = "fake_repo";
    const start = config.repoUrl.lastIndexOf("/") + 1;
    const end = config.repoUrl.lastIndexOf(".");
    if (start > 0 && end > start) {
      repoName = config.repoUrl.substring(start, end);
    }

    const commits = generateCommits(config);

    const authorName = config.gitName.trim();
    const authorEmail = config.gitEmail.trim();
    const authorFlag = `--author="${authorName} <${authorEmail}>"`;

    // BASH SCRIPT
    let bash = `#!/bin/bash
echo "Generating Git Activity for ${repoName}..."
mkdir -p ${repoName}_generated
cd ${repoName}_generated
git init -b main

`;

    commits.forEach((c) => {
      bash += `echo "Update" >> README.md\n`;
      bash += `git add .\n`;
      bash += `git commit -m "${c.msg}" --date="${c.dateStr}" ${authorFlag}\n`;
    });

    bash += `\ngit remote add origin ${config.repoUrl}
echo "Pushing to remote..."
git push -u origin main
echo "Done!"
`;

    // POWERSHELL SCRIPT
    let ps1 = `Write-Host "Generating Git Activity for ${repoName}..."
New-Item -ItemType Directory -Force -Path ${repoName}_generated
Set-Location ${repoName}_generated
git init -b main

`;

    commits.forEach((c) => {
      ps1 += `Add-Content -Path README.md -Value "Update"\n`;
      ps1 += `git add .\n`;
      // PowerShell requires careful quoting around dates
      ps1 += `git commit -m "${c.msg}" --date="${c.dateStr}" ${authorFlag}\n`;
    });

    ps1 += `\ngit remote add origin ${config.repoUrl}
Write-Host "Pushing to remote..."
git push -u origin main
Write-Host "Done!"
`;

    await logEvent(`[Script Generation] Completed successfully. Generated ${commits.length} commits.`);

    return NextResponse.json({ bash, ps1 });

  } catch (error: any) {
    console.error("Script generation error:", error);
    await logEvent(`[Script Generation] ERROR: ${error.message}`);
    return NextResponse.json({ 
      error: error.message || "Failed to generate scripts." 
    }, { status: 500 });
  }
}
