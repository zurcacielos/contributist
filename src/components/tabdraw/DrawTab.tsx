// src/components/tabdraw/DrawTab.tsx
"use client";

import React, { useState } from "react";
import { TechnicalBackground } from "@/components/background/TechnicalBackground";

import { ActivityGraph, ActivityGraphRef } from "@/components/ActivityGraph";
import { LayersPanel } from "@/components/LayersPanel";
import { GeneratorConfig } from "@/types";
import { AppState, AppAction } from "@/state/appReducer";

import { GitProfileLoader } from "@/components/GitProfileLoader";
import { GreenFont } from "@/components/GreenFont";
import { ColorSelector } from "@/components/ColorSelector";
import { useTranslations } from "next-intl";
import { generateShareUrl } from "@/utils/shareSerializer";
import { useToast } from "@/components/Toast";

interface DrawTabProps {
  config: GeneratorConfig;
  state: AppState;
  dispatch: React.Dispatch<AppAction>;

  handleSaveConfig: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  graphRef: React.RefObject<ActivityGraphRef | null>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onReset: () => void;
  initialConfig: GeneratorConfig;
}

export const DrawTab: React.FC<DrawTabProps> = ({
  config,
  state,
  dispatch,

  handleSaveConfig,
  fileInputRef,
  graphRef,
  setIsEditing,
  onReset,
  initialConfig,
}) => {
  const t = useTranslations('Sidebar');
  const { showToast } = useToast();

  const handleShareUrl = async () => {
    try {
      const shareUrl = await generateShareUrl(state, "draw");
      navigator.clipboard.writeText(shareUrl);
      showToast("Link copied to clipboard!");
    } catch (e) {
      console.error("Failed to generate share URL", e);
    }
  };

  const handleClearProfileLayers = () => {
    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        layers: (config.layers || []).filter(l => l.type !== 'git-profile')
      }
    });
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
        <button
          onClick={handleShareUrl}
          style={{
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            color: "var(--greenbash-selected, #39d353)",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: "600",
            fontFamily: "var(--font-mono, monospace)",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s ease",
            outline: "none",
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
          <span>🔗 Share this 2D URL</span>
        </button>

        <TechnicalBackground config={config} activeYear={state.activeYear} onChange={(c) => dispatch({ type: "SET_CONFIG", payload: c })} />

      </aside>

      {/* Main Workspace */}
      <section className="workspace">
        <GitProfileLoader config={config} dispatch={dispatch} initialConfig={initialConfig} />
        <ActivityGraph ref={graphRef} state={state} dispatch={dispatch} onEditChange={setIsEditing} />
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



      </aside>
    </section>
  );
};
