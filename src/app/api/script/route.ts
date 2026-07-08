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

    let readmeContent = "# Contributist Generated Activity\n";
    let markId = 1;
    let fastImportData = "";
    
    commits.forEach((c) => {
      readmeContent += "Update\n";
      const unixTime = Math.floor(new Date(c.dateStr).getTime() / 1000);
      
      fastImportData += `commit refs/heads/main\n`;
      fastImportData += `mark :${markId}\n`;
      fastImportData += `committer ${authorName} <${authorEmail}> ${unixTime} +0000\n`;
      fastImportData += `data ${Buffer.byteLength(c.msg)}\n${c.msg}\n`;
      if (markId > 1) {
        fastImportData += `from :${markId - 1}\n`;
      }
      fastImportData += `M 100644 inline README.md\n`;
      fastImportData += `data ${Buffer.byteLength(readmeContent)}\n${readmeContent}\n`;
      
      markId++;
    });

    // BASH SCRIPT
    let bash = `#!/bin/bash

# --- CONFIGURATION VARIABLES ---
REPO_URL="${config.repoUrl}"
GIT_NAME="${authorName}"
GIT_EMAIL="${authorEmail}"
REPO_NAME="${repoName}"
# -------------------------------

echo "🚀 Starting Git activity generator for \${REPO_NAME}..."

# 1. Check if Git is installed
if ! command -v git &> /dev/null; then
  echo "❌ Error: 'git' command not found. Please install Git and try again."
  exit 1
fi

# 2. Setup directory
mkdir -p "\${REPO_NAME}_generated"
cd "\${REPO_NAME}_generated"
git init -b main

# 3. Configure local repository identity
git config user.name "\${GIT_NAME}"
git config user.email "\${GIT_EMAIL}"

# 4. Generate import data file
cat << 'EOF' > import.txt
${fastImportData}EOF

# 5. Run git fast-import
echo "⚡ Generating \${REPO_NAME} commits..."
git fast-import --date-format=raw < import.txt
rm import.txt

# 6. Configure remote
git remote add origin "\${REPO_URL}" 2>/dev/null || git remote set-url origin "\${REPO_URL}"

# 7. Push with robust error handling
echo "📬 Pushing to remote repository..."
push_error=\$(git push -u origin main 2>&1)
push_status=\$?

if [ \$push_status -ne 0 ]; then
  echo "------------------------------------------------"
  echo "❌ Git push failed!"
  echo "\$push_error"
  echo "------------------------------------------------"
  
  if echo "\$push_error" | grep -qE "403|Permission to|denied"; then
    echo "💡 Authentication Error (403 / Permission Denied):"
    echo "  - HTTPS: Verify your GitHub Personal Access Token (PAT) has 'repo' write permissions."
    echo "  - SSH: Ensure your SSH key is added to your Git provider (test with: ssh -T git@github.com)."
    echo "  - Access: Confirm your account has owner/collaborator write access to this repository."
  elif echo "\$push_error" | grep -q "repository not found"; then
    echo "💡 Repository Not Found:"
    echo "  - Please check if you created the empty repository on GitHub/GitLab first."
    echo "  - Verify the Repository URL spelling is correct."
  fi
  exit 1
fi

echo "✅ Success! Commits pushed to remote main branch."
`;

    // POWERSHELL SCRIPT
    let ps1 = `# --- CONFIGURATION VARIABLES ---
\$RepoUrl = "${config.repoUrl}"
\$GitName = "${authorName}"
\$GitEmail = "${authorEmail}"
\$RepoName = "${repoName}"
# -------------------------------

Write-Host "🚀 Starting Git activity generator for \$RepoName..." -ForegroundColor Cyan

# 1. Check if Git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: 'git' command not found. Please install Git and try again." -ForegroundColor Red
    Exit 1
}

# 2. Setup directory
New-Item -ItemType Directory -Force -Path "\${RepoName}_generated" | Out-Null
Set-Location "\${RepoName}_generated"
git init -b main

# 3. Configure local repository identity
git config user.name "\$GitName"
git config user.email "\$GitEmail"

# 4. Generate import data file
\$importData = @"
${fastImportData}"@

\$importData | Out-File -FilePath import.txt -Encoding utf8

# 5. Run git fast-import
Write-Host "⚡ Generating \$RepoName commits..." -ForegroundColor Cyan
git fast-import --date-format=raw < import.txt
Remove-Item import.txt

# 6. Configure remote
try {
    git remote add origin "\$RepoUrl" 2>\$null
} catch {
    git remote set-url origin "\$RepoUrl"
}

# 7. Push with robust error handling
Write-Host "📬 Pushing to remote repository..." -ForegroundColor Cyan
\$pushErrorMsg = ""
git push -u origin main 2>&1 | ForEach-Object { \$pushErrorMsg += \$_.ToString() + "\`n" }

if (\$LASTEXITCODE -ne 0) {
    Write-Host "------------------------------------------------" -ForegroundColor Red
    Write-Host "❌ Git push failed!" -ForegroundColor Red
    Write-Host \$pushErrorMsg -ForegroundColor Yellow
    Write-Host "------------------------------------------------" -ForegroundColor Red

    if (\$pushErrorMsg -match "403|Permission to|denied") {
        Write-Host "💡 Authentication Error (403 / Permission Denied):" -ForegroundColor Cyan
        Write-Host "  - HTTPS: Verify your GitHub Personal Access Token (PAT) has 'repo' write permissions." -ForegroundColor White
        Write-Host "  - SSH: Ensure your SSH key is added to your Git provider (test with: ssh -T git@github.com)." -ForegroundColor White
        Write-Host "  - Access: Confirm your account has owner/collaborator write access to this repository." -ForegroundColor White
    } elseif (\$pushErrorMsg -match "repository not found") {
        Write-Host "💡 Repository Not Found:" -ForegroundColor Cyan
        Write-Host "  - Please check if you created the empty repository on GitHub/GitLab first." -ForegroundColor White
        Write-Host "  - Verify the Repository URL spelling is correct." -ForegroundColor White
    }
    Exit 1
}

Write-Host "✅ Success! Commits pushed to remote main branch." -ForegroundColor Green`;

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
