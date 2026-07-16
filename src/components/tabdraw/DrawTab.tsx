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
