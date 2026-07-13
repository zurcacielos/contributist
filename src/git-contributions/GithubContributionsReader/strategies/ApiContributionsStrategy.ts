import { ContributionsReaderStrategy } from "../types";
import { ScrapeContributionsStrategy } from "./ScrapeContributionsStrategy";

export class ApiContributionsStrategy implements ContributionsReaderStrategy {
  private localScraper = new ScrapeContributionsStrategy();

  async fetchContributions(username: string, host: string = "github.com"): Promise<Record<string, number>> {
    if (!host.includes("github.com")) {
      throw new Error(`ApiContributionsStrategy only supports github.com (Requested: ${host})`);
    }

    const contributions: Record<string, number> = {};

    // 1. Try jogruber's API first
    try {
      const url = `https://github-contributions-api.jogruber.de/v4/${username}`;
      console.log(url); // Clean console.log of the URL being requested
      
      const res = await fetch(url, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.contributions)) {
          data.contributions.forEach((day: any) => {
            if (day && day.date && typeof day.level === "number") {
              contributions[day.date] = day.level;
            }
          });
          if (Object.keys(contributions).length > 0) {
            return contributions;
          }
        }
      }
      console.warn(`[API Strategy] grubersjoe API returned non-OK status: ${res.status}`);
    } catch (e: any) {
      console.warn(`[API Strategy] Failed to fetch from grubersjoe API: ${e.message}`);
    }

    // 2. Fallback to Vercel API
    try {
      const url = `https://github-contributions.vercel.app/api/v1/${username}`;
      console.log(url); // Clean console.log of the URL being requested

      const res = await fetch(url, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.contributions)) {
          data.contributions.forEach((day: any) => {
            if (day && day.date && typeof day.intensity === "number") {
              contributions[day.date] = day.intensity;
            }
          });
          if (Object.keys(contributions).length > 0) {
            return contributions;
          }
        }
      }
      console.warn(`[API Strategy] Vercel API returned non-OK status: ${res.status}`);
    } catch (e: any) {
      console.warn(`[API Strategy] Failed to fetch from Vercel API: ${e.message}`);
    }

    // 3. Fallback to our local scraping strategy
    console.log("[API Strategy] Both APIs failed. Falling back to local scraper strategy...");
    return this.localScraper.fetchContributions(username, host);
  }
}
