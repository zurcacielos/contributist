import fs from 'fs';
import path from 'path';

export async function logEvent(message: string) {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const now = new Date();
    const timestamp = now.toISOString();
    
    const logMessage = `[${timestamp}] ${message}\n`;
    
    const logFile = path.join(logDir, 'execution.log');
    
    // We use promises appendFile so we don't block the event loop
    await fs.promises.appendFile(logFile, logMessage);
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}
