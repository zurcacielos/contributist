// src/components/tabexport/ExportTab.tsx
"use client";

import React, { useState } from "react";
import { GeneratorConfig } from "@/types";
import { AppAction } from "@/state/appReducer";
import { isValidExportConfig, isValidEmail, isValidRepoUrl } from "@/utils/validators";
import { downloadFile } from "@/utils/downloadFile";
import { getFileTimestamp } from "@/utils/dateHelper";
import { SynthFont } from "@/components/SynthFont";

interface ExportTabProps {
  config: GeneratorConfig;
  dispatch: React.Dispatch<AppAction>;
}

export const ExportTab: React.FC<ExportTabProps> = ({
  config,
  dispatch,
}) => {
  const [overrideText, setOverrideText] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [localFolder, setLocalFolder] = useState<string | null>(null);
  const [localPath, setLocalPath] = useState<string | null>(null);
  const [pushFailed, setPushFailed] = useState(false);

  const isConfigValid = isValidExportConfig(config);
  const isPushDisabled = isWorking || !localFolder || !isConfigValid || !config.repoUrl;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'SET_CONFIG',
      payload: {
        ...config,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleDownloadScript = async (type: "bash" | "ps1") => {
    if (!isConfigValid) return;
    setIsWorking(true);
    setResult(null);
    try {
      const response = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (response.ok) {
        let repoName = "repo";
        if (config.repoUrl) {
          const start = config.repoUrl.lastIndexOf("/") + 1;
          const end = config.repoUrl.lastIndexOf(".");
          if (start > 0 && end > start) {
            repoName = config.repoUrl.substring(start, end);
          }
        }
        const timestamp = getFileTimestamp();
        const extension = type === "bash" ? "sh" : "ps1";
        const filename = `contributist-generated-${repoName}-${timestamp}.${extension}`;

        downloadFile(filename, type === "bash" ? data.bash : data.ps1);
        setResult({ success: true, message: `Successfully downloaded script: ${filename}` });
      } else {
        setResult({ success: false, message: data.error || "Failed to generate scripts." });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || "An unexpected error occurred." });
    } finally {
      setIsWorking(false);
    }
  };

  // Internal handler to generate local repository
  const handleGenerateLocal = async () => {
    if (!isConfigValid) return;
    setIsWorking(true);
    setResult(null);
    setLocalFolder(null);
    setLocalPath(null);
    setPushFailed(false);
    try {
      const response = await fetch("/api/generate-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await response.json();
      if (response.ok) {
        setLocalFolder(data.folderName);
        setLocalPath(data.absolutePath || null);
        setResult({ success: true, message: data.message });
      } else {
        setResult({ success: false, message: data.error || "Failed to generate local repo." });
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || "An unexpected error occurred." });
    } finally {
      setIsWorking(false);
    }
  };

  // Internal handler to open the folder in explorer
  const handleReveal = async () => {
    if (!localFolder) return;
    try {
      await fetch("/api/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: localFolder }),
      });
    } catch (err) {
      console.error("Failed to reveal folder", err);
    }
  };

  // Internal handler to open the default shell terminal
  const handleOpenTerminal = async () => {
    if (!localFolder) return;
    try {
      await fetch("/api/open-terminal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: localFolder }),
      });
    } catch (err) {
      console.error("Failed to open terminal", err);
    }
  };

  // Internal handler to push remote repository
  const handlePushRemote = async () => {
    if (!localFolder || !isConfigValid) return;
    setIsWorking(true);
    setResult(null);
    setPushFailed(false);
    try {
      const response = await fetch("/api/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: localFolder, repoUrl: config.repoUrl, force: overrideText === "OVERRIDE" }),
      });
      const data = await response.json();
      if (response.ok) {
        setResult({ success: true, message: data.message });
        setPushFailed(false);
      } else {
        setResult({ success: false, message: data.error || "Failed to push to remote." });
        setPushFailed(true);
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || "An unexpected error occurred." });
      setPushFailed(true);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <section className="layout" style={{ display: "block", padding: 0 }}>
      {/* Centered content wrapper to constrain width while keeping scrollbar at the far right */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "18px 24px 24px"
      }}>
        {/* Main Content Area */}
        <section className="workspace" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Prerequisite Info Card */}
          <div className="card" style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              Create a Remote Repository
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-main)", margin: "0", lineHeight: "1.5" }}>
              Create a BRAND NEW dummy contributions repository with a NEW name, in your Gitea/Gogs, GitHub, GitLab or other remote. <strong>Do not</strong> add a README, license, or gitignore file.
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0", lineHeight: "1.4", display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <SynthFont variation="pink-cyan">
                If the repository already exists, DELETE IT, and create it different one with a DIFFERENT name each time.
              </SynthFont>
              <span
                className="info-icon"
                style={{ pointerEvents: "auto" }}
                data-tooltip-id="info-tooltip"
                data-tooltip-content="If you reuse the same repository, or same name, orphan commits may distort your graph."
              >
                i
              </span>
            </p>
          </div>

          {/* Git Identity Card */}
          <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
              Git Identity
              <span
                className="info-icon"
                style={{ pointerEvents: "auto" }}
                data-tooltip-id="info-tooltip"
                data-tooltip-content="This is the URL of your Remote Repo, and the info needed to sign your commits. No password required."
              >
                i
              </span>
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label htmlFor="repoUrl" style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  Repository URL - HTTPS or SSH - e.g: git@remote.com:username/reponame.git
                </label>
                <input
                  id="repoUrl"
                  name="repoUrl"
                  type="url"
                  value={config.repoUrl || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/username/repo.git"
                  style={{
                    fontSize: "0.95rem",
                    padding: "8px",
                    backgroundColor: "var(--surface)",
                    border: `1px solid ${config.repoUrl && !isValidRepoUrl(config.repoUrl) ? "#f85149" : "var(--border)"}`,
                    borderRadius: "4px",
                    width: "100%",
                    color: "white"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
                  <label htmlFor="gitName" style={{ fontSize: "0.9rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    Git Username:
                  </label>
                  <input
                    id="gitName"
                    name="gitName"
                    type="text"
                    value={config.gitName || ""}
                    onChange={handleChange}
                    placeholder="Your Git user name"
                    style={{ fontSize: "0.95rem", padding: "8px", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px", color: "white", flex: 1 }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
                  <label htmlFor="gitEmail" style={{ fontSize: "0.9rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                    Git Email:
                  </label>
                  <input
                    id="gitEmail"
                    name="gitEmail"
                    type="email"
                    value={config.gitEmail || ""}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    style={{
                      fontSize: "0.95rem",
                      padding: "8px",
                      backgroundColor: "var(--surface)",
                      border: `1px solid ${config.gitEmail && !isValidEmail(config.gitEmail) ? "#f85149" : "var(--border)"}`,
                      borderRadius: "4px",
                      color: "white",
                      flex: 1
                    }}
                  />
                </div>
              </div>
            </div>

            {!isConfigValid && (
              <div style={{
                marginTop: "8px",
                padding: "12px 16px",
                backgroundColor: "rgba(248, 81, 73, 0.08)",
                border: "1px solid rgba(248, 81, 73, 0.25)",
                borderRadius: "6px",
                color: "#ff7b72",
                fontSize: "0.85rem",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}>
                <div style={{ fontWeight: "600", marginBottom: "2px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚠️</span> Configuration Required:
                </div>
                {!config.repoUrl ? (
                  <div>• <strong>Repository URL</strong> is required to set up the push origin.</div>
                ) : !isValidRepoUrl(config.repoUrl) ? (
                  <div>• <strong>Repository URL</strong> must start with <code>https://</code>, <code>git@</code>, or <code>ssh://</code>.</div>
                ) : null}
                {!config.gitName || !config.gitName.trim() ? (
                  <div>• <strong>Git Username</strong> is required to sign the commits.</div>
                ) : null}
                {!config.gitEmail ? (
                  <div>• <strong>Git Email</strong> is required.</div>
                ) : !isValidEmail(config.gitEmail) ? (
                  <div>• <strong>Git Email</strong> must be a valid email format (e.g. <code>user@example.com</code>).</div>
                ) : null}
              </div>
            )}
          </div>
          {result && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: result.success ? "rgba(56, 139, 253, 0.15)" : "rgba(248, 81, 73, 0.15)",
                border: `1px solid ${result.success ? "rgba(56, 139, 253, 0.4)" : "rgba(248, 81, 73, 0.4)"}`,
                color: result.success ? "#58a6ff" : "#f85149",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                <span style={{ userSelect: "none" }}>
                  {result.success ? "✅" : "⚠️"}
                </span>
                <span style={{ wordBreak: "break-word" }}>{result.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  opacity: 0.6,
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
                title="Dismiss message"
              >
                ✕
              </button>
            </div>
          )}

          {/* Self-Service Script */}
          <div className="card" style={{ padding: "20px" }}>
            <h3
              style={{
                fontSize: "1.1rem",
                margin: "0 0 10px 0",
                color: "var(--text-main)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Option 1: Self-Service Script
              <span
                className="info-icon"
                style={{ pointerEvents: "auto" }}
                data-tooltip-id="info-tooltip"
                data-tooltip-content={`How to run:

Mac/Linux:
bash generate-activity.sh

Windows:
Right-click .ps1 → Run with PowerShell`}
              >
                i
              </span>
            </h3>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                className="btn btn-primary"
                onClick={() => handleDownloadScript("bash")}
                disabled={isWorking || !isConfigValid}
                style={{ flex: 1, backgroundColor: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text-main)", padding: "10px 16px", fontSize: "0.95rem" }}
              >
                ⬇️ Download Bash Script (.sh)
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleDownloadScript("ps1")}
                disabled={isWorking || !isConfigValid}
                style={{ flex: 1, backgroundColor: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text-main)", padding: "10px 16px", fontSize: "0.95rem" }}
              >
                ⬇️ Download PowerShell Script (.ps1)
              </button>
            </div>
          </div>

          {/* Cloud Generator */}
          {process.env.NEXT_PUBLIC_LOCAL_GIT_GENERATION_ENABLED === "true" && (
            <div className="card" style={{ padding: "20px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  margin: "0 0 10px 0",
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Option 2: Cloud Generator (Auto-Push)
                <span
                  className="info-icon"
                  style={{ pointerEvents: "auto" }}
                  data-tooltip-id="info-tooltip"
                  data-tooltip-content="We will create a dummy repo locally on the server and push it directly to your remote URL. Your repo MUST be completely empty."
                >
                  i
                </span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleGenerateLocal}
                    disabled={isWorking || !isConfigValid}
                    style={{ padding: "10px 24px", height: "46px", fontSize: "1rem", width: "fit-content" }}
                  >
                    {isWorking && !localFolder ? (
                      <span className="loader" style={{ width: "14px", height: "14px", borderWidth: "2px" }} />
                    ) : (
                      "💻"
                    )}{" "}1. Generate Local Repository
                  </button>
                  {localFolder && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                        generated at: <span style={{ color: "#58a6ff" }}>{localPath || `./generated/${localFolder}`}</span>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          type="button"
                          className="btn"
                          onClick={handleReveal}
                          style={{
                            backgroundColor: "var(--surface-hover)",
                            border: "1px solid var(--border)",
                            color: "var(--text-main)",
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                        >
                          📁 Reveal in File Explorer
                        </button>
                        <button
                          type="button"
                          className="btn"
                          onClick={handleOpenTerminal}
                          style={{
                            backgroundColor: "var(--surface-hover)",
                            border: "1px solid var(--border)",
                            color: "var(--text-main)",
                            padding: "6px 12px",
                            fontSize: "0.85rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--border)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                        >
                          💻 Open in Terminal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", opacity: isPushDisabled ? 0.5 : 1, transition: "opacity 0.2s", width: "100%" }}>
                  {process.env.NEXT_PUBLIC_GIT_OVERRIDE_ENABLED === "true" && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                      <label style={{ fontSize: "0.75rem", color: "#ff7b72", fontWeight: "600", textTransform: "uppercase", margin: 0 }}>
                        Write OVERRIDE to override the remote git commit history (Optional and probably useless).
                      </label>
                      <input
                        type="text"
                        value={overrideText}
                        onChange={(e) => setOverrideText(e.target.value)}
                        placeholder="OVERRIDE"
                        disabled={isPushDisabled}
                        style={{
                          backgroundColor: "#160505",
                          border: "1px solid #f85149",
                          color: "#ff7b72",
                          padding: "6px 10px",
                          fontSize: "0.85rem",
                          borderRadius: "6px",
                          width: "100px",
                          textAlign: "center",
                        }}
                      />
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={handlePushRemote}
                    disabled={isPushDisabled}
                    style={{
                      width: "fit-content",
                      backgroundColor: localFolder ? (overrideText === "OVERRIDE" ? "#da3633" : "var(--primary)") : "var(--surface-hover)",
                      color: localFolder ? "#fff" : "var(--text-muted)",
                      padding: "10px 24px",
                      height: "46px",
                      fontSize: "1rem",
                      border: overrideText === "OVERRIDE" && localFolder ? "1px solid #b62324" : "1px solid transparent",
                    }}
                  >
                    {isWorking && localFolder ? <span className="loader" /> : "🚀"}
                    {overrideText === "OVERRIDE" ? " 2. Push to Remote & Override" : " 2. Push to Remote"}
                    {config.repoUrl ? ` ➔ ${config.repoUrl}` : ""}
                  </button>
                  {pushFailed && (
                    <div style={{ fontSize: "0.85rem", color: "#ff7b72", marginTop: "8px", fontWeight: "500", lineHeight: "1.4" }}>
                      💡 Did you deleted and created from scratch an empty dummy contrib repo in your remote?
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
};
