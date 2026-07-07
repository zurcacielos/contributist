import { GeneratorConfig } from "../types";

export function isValidEmail(email: string | undefined): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidRepoUrl(url: string | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  // Very basic check for common git URL formats (http, https, git@, ssh://)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("git@") || trimmed.startsWith("ssh://")) {
    return trimmed.length > 10; // basic length check to ensure it's not just "git@"
  }
  return false;
}

export function isValidExportConfig(config: Partial<GeneratorConfig>): boolean {
  const hasValidName = !!config.gitName && config.gitName.trim().length > 0;
  const hasValidEmail = isValidEmail(config.gitEmail);
  const hasValidRepo = isValidRepoUrl(config.repoUrl);
  
  return hasValidName && hasValidEmail && hasValidRepo;
}
