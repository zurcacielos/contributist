import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { GeneratorConfig } from "@/types";
import { AppAction } from "@/state/appReducer";
import { parseProfileUrl } from "@/git-contributions/GithubContributionsReader/urlParser";

interface GitProfileLoaderProps {
  config: GeneratorConfig;
  dispatch: React.Dispatch<AppAction>;
  initialConfig: GeneratorConfig;
}

export function GitProfileLoader({
  config,
  dispatch,
  initialConfig
}: GitProfileLoaderProps) {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleFetchContributions = async () => {
    const importUrl = (config.gitProfileOrURL_import || "").trim();
    if (!importUrl) return;
    setIsFetching(true);
    setFetchError(null);

    const { platform, username } = parseProfileUrl(importUrl);

    // Reset workspace (clear all layers of all years) before importing
    dispatch({
      type: "RESET_TO_INITIAL",
      payload: initialConfig
    });

    // Immediately dispatch action to create the placeholder "Git Profile" layers in the state
    dispatch({
      type: "START_FETCH_PROFILE",
      payload: { username, platform }
    });

    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: importUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch contributions");
      }

      const fetchedContributions = data.contributions as Record<string, number>;
      const dates = Object.keys(fetchedContributions);
      if (dates.length > 0) {
        dispatch({
          type: "FETCH_PROFILE_SUCCESS",
          payload: {
            contributions: fetchedContributions,
            platform: data.platform || platform,
            username: data.username || username
          }
        });
      }
    } catch (err: any) {
      setFetchError(err.message || "Failed to load contributions");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto 20px auto"
      }}
    >
      <div style={{ display: "flex", width: "100%", gap: "10px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
          <span
            style={{
              position: "absolute",
              left: "12px",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
              color: "var(--text-muted)"
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="GitHub / GitLab / Gitea profile or URL"
            value={config.gitProfileOrURL_import || ""}
            onChange={(e) => {
              dispatch({
                type: "SET_CONFIG",
                payload: {
                  ...config,
                  gitProfileOrURL_import: e.target.value
                }
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleFetchContributions();
              }
            }}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              backgroundColor: "rgba(0, 0, 0, 0.25)",
              color: "var(--text-main)",
              fontSize: "0.9rem",
              outline: "none",
              fontFamily: "var(--font-mono, monospace)",
              transition: "border-color 0.2s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--primary, #2ea043)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
            }}
          />
        </div>
        <button
          onClick={handleFetchContributions}
          disabled={isFetching}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(135deg, #3870ff, #2040c0)",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: isFetching ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(56, 112, 255, 0.2)",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            if (!isFetching) e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {isFetching ? (
            <RefreshCw size={16} className="spin" style={{ animation: "spin 1s linear infinite" }} />
          ) : null}
          Load
        </button>
      </div>

      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          textAlign: "left",
          marginTop: "6px",
          paddingLeft: "4px",
          fontFamily: "var(--font-mono, monospace)"
        }}
      >
        Example: zurcacielos • https://github.com/zurcacielos • gitlab.com/username • gitea.instance/user
      </div>

      {fetchError && (
        <div
          style={{
            color: "#ff7b72",
            fontSize: "0.75rem",
            marginTop: "6px",
            textAlign: "left",
            paddingLeft: "4px",
            fontFamily: "var(--font-mono, monospace)"
          }}
        >
          {fetchError}
        </div>
      )}
    </div>
  );
}
