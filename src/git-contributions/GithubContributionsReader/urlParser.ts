export interface ParsedProfile {
  platform: string;
  username: string;
  host: string;
}

/**
 * Parses a profile input (which can be a full Git URL or a plain username)
 * and extracts the platform (github/gitlab/gitea), the username, and the host.
 */
export function parseProfileUrl(url: string): ParsedProfile {
  const trimmed = url.trim();
  let platform = "github";
  let username = "";
  let host = "github.com";

  // Clean protocol and www prefix
  let urlString = trimmed.replace(/^(https?:\/\/)?(www\.)?/, "");

  if (urlString.includes("gitlab.com")) {
    platform = "gitlab";
    const parts = urlString.split("/");
    username = parts[1] || "";
    host = "gitlab.com";
  } else if (urlString.includes("codeberg.org")) {
    platform = "gitea";
    const parts = urlString.split("/");
    username = parts[1] || "";
    host = "codeberg.org";
  } else if (urlString.includes("gitea.com") || urlString.includes("gitea")) {
    platform = "gitea";
    const parts = urlString.split("/");
    username = parts[1] || "";
    host = parts[0] || "gitea.com";
  } else if (urlString.includes("/")) {
    if (urlString.includes("github.com")) {
      platform = "github";
      const parts = urlString.split("/");
      username = parts[1] || "";
      host = "github.com";
    } else {
      // Fallback for custom self-hosted GitLab / Gitea instances
      const parts = urlString.split("/");
      username = parts[1] || "";
      host = parts[0];
      if (urlString.includes("gitlab")) {
        platform = "gitlab";
      } else {
        platform = "gitea";
      }
    }
  } else {
    // Plain username defaults to GitHub
    platform = "github";
    username = trimmed;
  }

  // Strip query parameters, hashes, and trailing slashes
  username = username.split("?")[0].split("#")[0].replace(/\/$/, "");

  return { platform, username, host };
}
