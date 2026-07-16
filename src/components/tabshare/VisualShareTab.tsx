"use client";

import React, { useState, useRef } from "react";
import { AppState, AppAction } from "@/state/appReducer";
import { GeneratorConfig } from "@/types";
import { ActivityGraph } from "@/components/ActivityGraph";
import { Card } from "@/components/Card";
import { Eye, Flame, Trophy, Zap, Share2 } from "lucide-react";
import { exportAsPNG } from "@/utils/canvasExport";
import { serializeDesign, collapseYearsToRanges, isPureGitProfileDesign, generateShareUrl } from "@/utils/shareSerializer";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/Toast";

interface VisualShareTabProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  aspectRatio: "square" | "story" | "landscape";
  setAspectRatio: (val: "square" | "story" | "landscape") => void;
  config: GeneratorConfig;
}

export const VisualShareTab: React.FC<VisualShareTabProps> = ({
  state,
  dispatch,
  aspectRatio,
  setAspectRatio,
  config,
}) => {
  const t = useTranslations('Share');
  const { showToast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const [localStyle, setLocalStyle] = useState<"simplegit" | "flatgit">("simplegit");
  const [localShowPaintedInOrange, setLocalShowPaintedInOrange] = useState<boolean>(config.showPaintedInOrange);

  const handleDownload = async () => {
    // Deselect any years or layers to hide visual helpers during capture
    dispatch({ type: "DESELECT_ALL_LAYERS" });
    dispatch({ type: "DESELECT_ALL_YEARS" });
    await exportAsPNG(previewRef.current, setIsCapturing);
  };

  const handleCopyLink = async () => {
    const shareUrl = await generateShareUrl(state, "share");
    navigator.clipboard.writeText(shareUrl);
    showToast(t('copiedAlert'));
  };

  const activeStyle = localStyle;

  const handleStyleChange = (style: "simplegit" | "flatgit") => {
    setLocalStyle(style);
  };

  const handlePaletteToggle = () => {
    setLocalShowPaintedInOrange(prev => !prev);
  };

  // Dimensions & styling classes dynamically mapped
  let previewStyle: React.CSSProperties = {
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    background: "#0d1117",
    border: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px 8px",
    width: "100%",
  };

  if (aspectRatio === "square") {
    previewStyle = {
      ...previewStyle,
      width: "500px",
      height: "500px",
      borderRadius: "16px",
      boxShadow: "0 0 30px rgba(144, 92, 255, 0.15)",
      border: "1px solid rgba(144, 92, 255, 0.2)",
    };
  } else if (aspectRatio === "story") {
    previewStyle = {
      ...previewStyle,
      width: "360px",
      height: "640px",
      borderRadius: "16px",
      boxShadow: "0 0 30px rgba(144, 92, 255, 0.15)",
      border: "1px solid rgba(144, 92, 255, 0.2)",
    };
  } else {
    previewStyle = {
      ...previewStyle,
      borderRadius: "12px",
      minHeight: "300px",
      justifyContent: "flex-start",
      overflow: "visible",
    };
  }

  return (
    <section className="layout share-layout" style={{ marginTop: "14px" }}>
      {/* Left Sidebar - Export Config */}
      <aside className="sidebar-left panel" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <Card collapsible={false} title={t('presetTitle')}>
          <div className="export-preset-container" id="export-preset-container" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Rendering Style */}
            <div className="render-style-section" id="render-style-section">
              <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                {t('renderStyle')}
              </span>
              <div className="render-style-buttons" id="render-style-buttons" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                  <button
                    onClick={() => handleStyleChange("simplegit")}
                    style={{
                      flex: 1,
                      backgroundColor: activeStyle === "simplegit" ? "rgba(57, 211, 83, 0.15)" : "rgba(0, 0, 0, 0.4)",
                      border: activeStyle === "simplegit" ? "1px solid var(--greenbash-selected, #39d353)" : "1px solid var(--border)",
                      color: activeStyle === "simplegit" ? "var(--greenbash-selected, #39d353)" : "var(--text-muted)",
                      padding: "8px 0",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontFamily: "var(--font-mono, monospace)",
                      cursor: "pointer",
                      fontSize: "11px",
                      textAlign: "center",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {t('simpleGit')}
                  </button>
                  <button
                    onClick={() => handleStyleChange("flatgit")}
                    style={{
                      flex: 1,
                      backgroundColor: activeStyle === "flatgit" ? "rgba(57, 211, 83, 0.15)" : "rgba(0, 0, 0, 0.4)",
                      border: activeStyle === "flatgit" ? "1px solid var(--greenbash-selected, #39d353)" : "1px solid var(--border)",
                      color: activeStyle === "flatgit" ? "var(--greenbash-selected, #39d353)" : "var(--text-muted)",
                      padding: "8px 0",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      fontFamily: "var(--font-mono, monospace)",
                      cursor: "pointer",
                      fontSize: "11px",
                      textAlign: "center",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {t('flatGit')}
                  </button>
                </div>
              </div>
            </div>

            <hr style={{ border: "0", borderTop: "1px solid var(--border)", margin: "6px 0" }} />

            {/* Theme Palettes */}
            <div className="palette-alternator-section" id="palette-alternator-section">
              <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                {t('palette')}
              </span>
              <div className="palette-alternator-button-wrapper" id="palette-alternator-button-wrapper" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Classic Green Option */}
                <button
                  type="button"
                  onClick={() => setLocalShowPaintedInOrange(false)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: !localShowPaintedInOrange ? "rgba(57, 211, 83, 0.15)" : "rgba(0, 0, 0, 0.4)",
                    border: !localShowPaintedInOrange ? "1.5px solid var(--greenbash-selected, #39d353)" : "1.5px solid var(--border)",
                    boxShadow: !localShowPaintedInOrange ? "0 0 10px rgba(57, 211, 83, 0.1)" : "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono, monospace)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: !localShowPaintedInOrange ? "var(--greenbash-selected, #39d353)" : "var(--text-muted)" }}>{t('classicGreen')}</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"].map((c, i) => (
                      <div key={i} style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: c, border: i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }} />
                    ))}
                  </div>
                </button>

                {/* Synth Option */}
                <button
                  type="button"
                  onClick={() => setLocalShowPaintedInOrange(true)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    backgroundColor: localShowPaintedInOrange ? "rgba(57, 211, 83, 0.15)" : "rgba(0, 0, 0, 0.4)",
                    border: localShowPaintedInOrange ? "1.5px solid var(--greenbash-selected, #39d353)" : "1.5px solid var(--border)",
                    boxShadow: localShowPaintedInOrange ? "0 0 10px rgba(57, 211, 83, 0.1)" : "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono, monospace)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: localShowPaintedInOrange ? "var(--greenbash-selected, #39d353)" : "var(--text-muted)" }}>Amber</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {["#161b22", "#5c0900", "#d53a00", "#ff7f00", "#ffcf26"].map((c, i) => (
                      <div key={i} style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: c, border: i === 0 ? "1px solid rgba(255, 255, 255, 0.08)" : "none" }} />
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </Card>
      </aside>

      {/* Center Preview */}
      <section className="workspace" id="export-workspace-section" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", minHeight: "60vh", paddingTop: "10px" }}>

        {/* Optional Step Notice */}
        <div
          className="card help-card no-print"
          style={{
            width: "100%",
            maxWidth: aspectRatio === "square" ? "500px" : (aspectRatio === "story" ? "360px" : "100%"),
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            fontSize: "13px",
            color: "var(--text-muted)",
            lineHeight: 1.5
          }}
        >
          <span style={{ fontSize: "16px", flexShrink: 0 }}>ℹ️</span>
          <span>
            {t('notice')}
          </span>
        </div>

        <div ref={previewRef} className="preview-container-main" id="preview-container-main" style={previewStyle}>
          {/* Header Title inside share frame */}
          {(aspectRatio === "square" || aspectRatio === "story") && (
            <div className="preview-header-logo" id="preview-header-logo" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: aspectRatio === "square" ? "20px" : "30px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
              <div className="preview-logo-wrapper" id="preview-logo-wrapper" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="/images/contributist-web.png" alt="logo" style={{ width: "24px", height: "24px" }} />
                <h3 style={{ margin: 0, fontSize: "16px", color: "#fff", fontWeight: "bold", letterSpacing: "0.03em" }}>
                  Contributist
                </h3>
              </div>
              <p style={{ margin: "2px 0 0", fontSize: "10px", color: "var(--text-muted)" }}>
                Turn your year into pixel art
              </p>
            </div>
          )}

          {/* Actual ActivityGraph Preview */}
          <div className="preview-graph-inner" id="preview-graph-inner" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <ActivityGraph
              state={state}
              dispatch={dispatch}
              onEditChange={() => { }}
              preview={true}
              showPaintedInOrangeOverride={localShowPaintedInOrange}
              template={localStyle}
            />
          </div>

          {/* Footer content inside square or story frame */}
          {aspectRatio === "square" && (
            <div className="preview-footer-square" id="preview-footer-square" style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>commitcanvas.com</span>
              <div className="preview-streak-badge" id="preview-streak-badge" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#10b981", fontWeight: "bold" }}>
                <Flame size={12} color="#10b981" /> 37 DAY STREAK
              </div>
            </div>
          )}

          {aspectRatio === "story" && (
            <div className="preview-footer-story" id="preview-footer-story" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginTop: "auto", paddingTop: "20px" }}>
              <div className="preview-story-badges" id="preview-story-badges" style={{ display: "flex", gap: "12px" }}>
                <div className="preview-badge-days" id="preview-badge-days" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#ff8e31", fontWeight: "bold" }}>
                  <Flame size={12} /> 37 DAYS
                </div>
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>commitcanvas.com</span>
            </div>
          )}
        </div>
      </section>

      {/* Right Sidebar - Achievements & Download */}
      <aside className="sidebar-right panel" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>


        {/* Share the Hype & Download */}
        <div className="share-download-container" id="share-download-container" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "0px" }}>
          <button
            onClick={handleDownload}
            disabled={isCapturing}
            style={{
              width: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              border: "1px solid var(--border)",
              color: "var(--greenbash-selected, #39d353)",
              padding: "12px 14px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px",
              fontFamily: "var(--font-mono, monospace)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(57, 211, 83, 0.12)";
              e.currentTarget.style.borderColor = "var(--greenbash-selected, #39d353)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--greenbash-selected, #39d353)";
            }}
          >
            <Share2 size={16} /> {isCapturing ? t('capturing') : t('exportPng')}
          </button>

          <button
            onClick={handleCopyLink}
            style={{
              width: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              border: "1px solid var(--border)",
              color: "var(--greenbash-selected, #39d353)",
              padding: "12px 14px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px",
              fontFamily: "var(--font-mono, monospace)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              marginTop: "4px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(57, 211, 83, 0.12)";
              e.currentTarget.style.borderColor = "var(--greenbash-selected, #39d353)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--greenbash-selected, #39d353)";
            }}
          >
            <Share2 size={16} /> {t('shareUrl')}
          </button>

          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              backgroundColor: "rgba(255, 255, 255, 0.01)",
              border: "1px dashed rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              padding: "8px",
              marginTop: "4px",
              lineHeight: "1.4"
            }}
          >
            <span style={{ display: "block", fontWeight: "bold", color: "#e1e4e8", marginBottom: "4px" }}>
              {t('privacyTitle')}
            </span>
            <span>{t('privacyDesc')}</span>
          </div>

          <div className="share-the-hype-card" id="share-the-hype-card" style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px", marginTop: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: "bold", color: "var(--text-muted)", textAlign: "center", display: "block" }}>
              {t('shareHype')}
            </span>
            <div className="share-hype-icons" id="share-hype-icons" style={{ display: "flex", justifyContent: "center", gap: "12px", fontSize: "20px" }}>
              <span title="TikTok" style={{ cursor: "pointer" }}>🎵</span>
              <span title="Instagram" style={{ cursor: "pointer" }}>📸</span>
              <span title="Twitter" style={{ cursor: "pointer" }}>🐦</span>
              <span title="Discord" style={{ cursor: "pointer" }}>💬</span>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
};
