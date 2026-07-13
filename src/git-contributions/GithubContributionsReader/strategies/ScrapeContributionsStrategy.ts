import { ContributionsReaderStrategy } from "../types";

export class ScrapeContributionsStrategy implements ContributionsReaderStrategy {
  async fetchContributions(username: string, host: string = "github.com"): Promise<Record<string, number>> {
    if (!host.includes("github.com")) {
      throw new Error(`ScrapeContributionsStrategy only supports github.com (Requested: ${host})`);
    }

    const fetchHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "accept": "text/html",
      "x-requested-with": "XMLHttpRequest",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    };

    // 1. Fetch contributions tab to extract active years
    const profileUrl = `https://github.com/${username}?action=show&controller=profiles&tab=contributions&user_id=${username}`;
    const profileRes = await fetch(profileUrl, {
      headers: fetchHeaders,
      cache: "no-store"
    });
    if (!profileRes.ok) {
      throw new Error(`Failed to fetch GitHub profile for ${username} (Status ${profileRes.status}). Verify the username.`);
    }

    const profileHtml = await profileRes.text();
    const years = this.extractYears(profileHtml);

    const contributions: Record<string, number> = {};

    // 2. Fetch contributions for each year in parallel
    const fetchYear = async (year: number) => {
      const contributionsUrl = `https://github.com/users/${username}/contributions?tab=overview&from=${year}-12-01&to=${year}-12-31`;
      console.log(contributionsUrl); // Clean console.log of the URL being requested

      const res = await fetch(contributionsUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        cache: "no-store"
      });
      if (!res.ok) {
        console.warn(`Failed to fetch contributions for year ${year} (Status ${res.status})`);
        return;
      }

      const html = await res.text();

      // Check total contributions header to handle 0-contribution years safely
      let h2Text = "";
      const h2Regex = /<h2\b[^>]*>([\s\S]*?)<\/h2>/g;
      let h2Match;
      while ((h2Match = h2Regex.exec(html)) !== null) {
        if (/contribution/i.test(h2Match[1])) {
          h2Text = h2Match[1].trim();
          break;
        }
      }

      const totalMatch = /([0-9,]+)\s+contribution/i.exec(h2Text);
      const noContributions = /no\s+contribution/i.test(h2Text);
      let total = 0;
      if (totalMatch) {
        total = parseInt(totalMatch[1].replace(/,/g, ""), 10);
      }

      if ((total === 0 && totalMatch) || noContributions) {
        // Year has no contributions; skip parsing cells to keep it at 0
        return;
      }
      
      // Parse SVG/HTML calendar cells
      const tagRegex = /<(rect|td)\b([^>]+)>/g;
      let match;
      while ((match = tagRegex.exec(html)) !== null) {
        const attrs = match[2];
        const dateMatch = /data-date="(\d{4}-\d{2}-\d{2})"/.exec(attrs);
        const levelMatch = /data-level="(\d)"/.exec(attrs);
        if (dateMatch && levelMatch) {
          contributions[dateMatch[1]] = parseInt(levelMatch[1], 10);
        }
      }
    };

    await Promise.all(years.map(y => fetchYear(y)));

    return contributions;
  }

  /**
   * Parse profile HTML to find all year links.
   */
  private extractYears(html: string): number[] {
    const years = new Set<number>();
    
    // Match class="...js-year-link..." >YYYY</a>
    const linkRegex = /class="[^"]*js-year-link[^"]*"[^>]*>\s*(\d{4})\s*<\/a>/g;
    let match;
    const currentYear = new Date().getFullYear();
    while ((match = linkRegex.exec(html)) !== null) {
      const yr = parseInt(match[1], 10);
      if (yr >= 2005 && yr <= currentYear + 1) {
        years.add(yr);
      }
    }

    // Match id="year-link-YYYY"
    const idRegex = /year-link-(\d{4})/g;
    while ((match = idRegex.exec(html)) !== null) {
      const yr = parseInt(match[1], 10);
      if (yr >= 2005 && yr <= currentYear + 1) {
        years.add(yr);
      }
    }

    const result = Array.from(years).sort((a, b) => b - a);
    
    // Fallback to current year if none found
    if (result.length === 0) {
      result.push(currentYear);
    }
    
    return result;
  }
}
