import { NextRequest, NextResponse } from "next/server";
import { GithubContributionsReader } from "@/git-contributions/GithubContributionsReader/GithubContributionsReader";
import { parseProfileUrl } from "@/git-contributions/GithubContributionsReader/urlParser";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { profileUrl } = await req.json();
    if (!profileUrl) {
      return NextResponse.json({ error: "Profile URL or username is required" }, { status: 400 });
    }

    const { platform, username, host } = parseProfileUrl(profileUrl);

    if (!username) {
      return NextResponse.json({ error: "Could not parse username from the input" }, { status: 400 });
    }

    const contributions: Record<string, number> = {};

    if (platform === "github") {
      const reader = new GithubContributionsReader();
      const fetched = await reader.getContributions(username, host);
      Object.assign(contributions, fetched);
    } else if (platform === "gitlab") {
      const url = `https://${host}/users/${username}/calendar.json`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        cache: "no-store"
      });
      if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch GitLab contributions (Status ${res.status}). Verify the username or profile URL.` }, { status: 500 });
      }
      const data = await res.json() as Record<string, number>;
      for (const [dateStr, count] of Object.entries(data)) {
        let level = 0;
        if (count > 0) {
          if (count <= 2) level = 1;
          else if (count <= 5) level = 2;
          else if (count <= 9) level = 3;
          else level = 4;
        }
        contributions[dateStr] = level;
      }
    } else if (platform === "gitea") {
      const url = `https://${host}/api/v1/users/${username}/heatmap`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        },
        cache: "no-store"
      });
      if (!res.ok) {
        return NextResponse.json({ error: `Failed to fetch Gitea/Forgejo contributions (Status ${res.status}). Verify the username or profile URL.` }, { status: 500 });
      }
      const data = await res.json() as Array<{ timestamp: number; contributions: number }>;
      for (const item of data) {
        const date = new Date(item.timestamp * 1000);
        const dateStr = date.toISOString().split("T")[0];
        const count = item.contributions;
        let level = 0;
        if (count > 0) {
          if (count <= 2) level = 1;
          else if (count <= 5) level = 2;
          else if (count <= 9) level = 3;
          else level = 4;
        }
        contributions[dateStr] = level;
      }
    }

    if (Object.keys(contributions).length === 0) {
      return NextResponse.json({ error: "No contribution data found for this profile." }, { status: 404 });
    }

    return NextResponse.json({ contributions, platform, username });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "An unexpected error occurred" }, { status: 500 });
  }
}
