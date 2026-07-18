const fs = require('fs');
const path = require('path');

const ROOT_FILES = [
  ".gitignore",
  "CONTRIBUTING.md",
  "LICENSE",
  "README.md",
  "environment-vars.md",
  "eslint.config.mjs",
  "next.config.ts",
  "package-lock.json",
  "package.json",
  "postcss.config.mjs",
  "restore.js",
  "tsconfig.json",
  "vitest.config.ts"
];

const DIRECTORIES = [
  "messages",
  "public",
  "screenshots",
  "src"
];

function refreshFiles() {
  const rootDir = path.resolve(__dirname, '..');

  // 1. Update/write refresh.txt in first-level directories
  DIRECTORIES.forEach((dir) => {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      const refreshFilePath = path.join(dirPath, 'refresh.txt');
      const timestamp = new Date().toISOString();
      fs.writeFileSync(refreshFilePath, `# refresh: ${timestamp}\n`, 'utf8');
      console.log(`Updated refresh.txt in ${dir}`);
    }
  });

  // 2. Refresh root files by toggling between 1 and 2 trailing newlines
  ROOT_FILES.forEach((file) => {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if it ends with two newlines (handling both LF and CRLF)
      const endsWithTwoNewlines = 
        content.endsWith('\n\n') || 
        content.endsWith('\r\n\r\n') || 
        content.endsWith('\r\n\n') || 
        content.endsWith('\n\r\n');
        
      // Strip all trailing carriage returns and newlines
      const stripped = content.replace(/[\r\n]+$/, '');
      
      let finalContent;
      if (endsWithTwoNewlines) {
        // If it already has 2, reduce to 1
        finalContent = stripped + '\n';
        console.log(`Reduced trailing newlines to 1 for ${file}`);
      } else {
        // If it has 0 or 1, add an extra one to make it 2
        finalContent = stripped + '\n\n';
        console.log(`Increased trailing newlines to 2 for ${file}`);
      }
      
      fs.writeFileSync(filePath, finalContent, 'utf8');
    }
  });
}

refreshFiles();
