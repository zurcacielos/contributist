// src/components/tabdraw/DrawTab.tsx
"use client";

import React, { useState } from "react";
import { BaseVibe } from "@/components/background/BaseVibe";
import { TechnicalBackground } from "@/components/background/TechnicalBackground";

import { ActivityGraph, ActivityGraphRef } from "@/components/ActivityGraph";
import { LayersPanel } from "@/components/LayersPanel";
import { GeneratorConfig, FeelingMode } from "@/types";
import { AppState, AppAction } from "@/state/appReducer";
import { CommunityRemix } from "@/components/CommunityRemix";
import { Card } from "@/components/Card";
import { ColorSelector } from "@/components/ColorSelector";
import { FeelingToggler } from "@/components/FeelingToggler";
import { useTranslations } from "next-intl";
import { Info, RefreshCw } from "lucide-react";
import { parseProfileUrl } from "@/git-contributions/GithubContributionsReader/urlParser";

interface DrawTabProps {
  config: GeneratorConfig;
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  feelingMode: FeelingMode;
  setFeelingMode: (mode: FeelingMode) => void;
  handleSaveConfig: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  graphRef: React.RefObject<ActivityGraphRef | null>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onReset: () => void;
}

export const DrawTab: React.FC<DrawTabProps> = ({
  config,
  state,
  dispatch,
  feelingMode,
  setFeelingMode,
  handleSaveConfig,
  fileInputRef,
  graphRef,
  setIsEditing,
  onReset,
}) => {
  const t = useTranslations('Sidebar');
  const [profileInput, setProfileInput] = useState(config.gitProfileUrl || "");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  React.useEffect(() => {
    setProfileInput(config.gitProfileUrl || "");
  }, [config.gitProfileUrl]);

  const handleFetchContributions = async () => {
    if (!profileInput.trim()) return;
    setIsFetching(true);
    setFetchError(null);

    const { platform, username } = parseProfileUrl(profileInput);

    if (platform === "github") {
      console.log(`https://github.com/users/${username}/contributions`);
    }

    // Immediately dispatch action to create the placeholder "Git Profile" layers in the state
    dispatch({
      type: "START_FETCH_PROFILE",
      payload: { username, platform }
    });

    try {
      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileUrl: profileInput.trim() }),
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
    <section
      className="layout draw-layout"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("draw-layout") || target.classList.contains("workspace")) {
          dispatch({ type: "DESELECT_ALL_YEARS" });
        }
      }}
    >
      {/* Left Sidebar */}
      <aside
        className="sidebar-left panel"
        style={{
          position: "sticky",
          top: "0px",
          zIndex: 10,
          alignSelf: "start",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}
      >
        <Card title={
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>{t('gitProfileTitle')}</span>
            <span
              className="info-icon"
              data-tooltip-id="info-tooltip"
              data-tooltip-content={t('gitProfileTooltip')}
              style={{ cursor: "pointer" }}
            >
              i
            </span>
          </div>
        }>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="text"
              placeholder="e.g. torvalds"
              value={profileInput}
              onChange={(e) => {
                setProfileInput(e.target.value);
                dispatch({ type: "SET_GIT_PROFILE_URL", payload: e.target.value });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFetchContributions();
                }
              }}
              style={{
                flex: 1,
                padding: "8px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "var(--text-main)",
                fontSize: "0.85rem",
                outline: "none"
              }}
            />
            <button
              onClick={handleFetchContributions}
              disabled={isFetching}
              title="Fetch contributions"
              style={{
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "var(--text-main)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if (!isFetching) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
              }}
            >
              <RefreshCw
                size={16}
                style={{
                  animation: isFetching ? "spin 1s linear infinite" : "none"
                }}
              />
            </button>
          </div>
          {fetchError && (
            <div style={{ color: "#ff7b72", fontSize: "0.75rem", marginTop: "6px" }}>
              {fetchError}
            </div>
          )}
        </Card>
        {feelingMode === "vibe" ? (
          <BaseVibe config={config} onChange={(c) => dispatch({ type: "SET_CONFIG", payload: c })} />
        ) : (
          <TechnicalBackground config={config} activeYear={state.activeYear} onChange={(c) => dispatch({ type: "SET_CONFIG", payload: c })} />
        )}

      </aside>

      {/* Main Workspace */}
      <section className="workspace">

        <ActivityGraph ref={graphRef} state={state} dispatch={dispatch} onEditChange={setIsEditing} feelingMode={feelingMode} />
      </section>

      {/* Right Sidebar */}
      <aside
        className="sidebar-right panel"
        style={{
          position: "sticky",
          top: "0px",
          zIndex: 10,
          alignSelf: "start",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}
      >
        <LayersPanel
          state={state}
          dispatch={dispatch}
          showAlgoLayer={config.showAlgoLayer}
          onToggleAlgoLayer={() =>
            dispatch({ type: "SET_CONFIG", payload: { ...config, showAlgoLayer: !config.showAlgoLayer } })
          }
          onClearAlgoLayer={() => dispatch({ type: "SET_CONFIG", payload: { ...config, frequencies: "0" } })}
          showPaintedInOrange={config.showPaintedInOrange}
          onTogglePaintedInOrange={() =>
            dispatch({
              type: "SET_CONFIG",
              payload: { ...config, showPaintedInOrange: !config.showPaintedInOrange },
            })
          }
        />

        {/* Draw Color Selector */}
        <ColorSelector
          selectedLevel={state.selectedLevel}
          showPaintedInOrange={config.showPaintedInOrange}
          onSelect={(level, isSynth) => {
            dispatch({ type: "UPDATE_LAYER_COLOR", payload: { level } });
            if (config.showPaintedInOrange !== isSynth) {
              dispatch({
                type: "SET_CONFIG",
                payload: { ...config, showPaintedInOrange: isSynth }
              });
            }
          }}
          onTogglePaintedInOrange={() =>
            dispatch({
              type: "SET_CONFIG",
              payload: { ...config, showPaintedInOrange: !config.showPaintedInOrange }
            })
          }
        />

        <Card title={t('uiMode')}>
          <FeelingToggler feelingMode={feelingMode} onChange={setFeelingMode} style={{ width: "100%" }} />
        </Card>
        <CommunityRemix config={config} dispatch={dispatch} activeYear={state.activeYear} />
      </aside>
    </section>
  );
};
