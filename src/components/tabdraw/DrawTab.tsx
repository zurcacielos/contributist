// src/components/tabdraw/DrawTab.tsx
"use client";

import React from "react";
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
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "0.85rem", color: "#ffffff", fontWeight: "bold", textAlign: "center" }}>UI mode</span>
          <FeelingToggler feelingMode={feelingMode} onChange={setFeelingMode} style={{ width: "100%" }} />
        </div>
        {feelingMode === "vibe" ? (
          <BaseVibe config={config} onChange={(c) => dispatch({ type: "SET_CONFIG", payload: c })} />
        ) : (
          <TechnicalBackground config={config} onChange={(c) => dispatch({ type: "SET_CONFIG", payload: c })} />
        )}

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
        />
        
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
        <CommunityRemix config={config} dispatch={dispatch} activeYear={state.activeYear} />
      </aside>
    </section>
  );
};
