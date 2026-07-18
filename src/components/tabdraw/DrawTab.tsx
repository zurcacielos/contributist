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

  const handleBeforeSad = () => {
    const updatedLayers = (config.layers || []).map(layer => {
      if (layer.type === 'git-profile') {
        return layer;
      }
      return { ...layer, visible: false };
    });
    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        layers: updatedLayers
      }
    });
  };

  const handleAfterHappy = () => {
    const updatedLayers = (config.layers || []).map(layer => {
      return { ...layer, visible: true };
    });
    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        layers: updatedLayers
      }
    });
  };

  const [isSadPressed, setIsSadPressed] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handlePressSad = () => {
    setIsSadPressed(true);
    handleBeforeSad();
  };

  const handleReleaseHappy = () => {
    setIsSadPressed(false);
    handleAfterHappy();
  };

  return (
    <section
      className="layout draw-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "264px minmax(0, 1fr) 240px",
        gridTemplateRows: "auto 1fr",
        gap: "14px 18px",
        padding: "18px 12px 24px",
      }}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("draw-layout") || target.classList.contains("workspace")) {
          dispatch({ type: "DESELECT_ALL_YEARS" });
        }
      }}
    >
      {/* Row 1, Column 1: Share 2D URL Button */}
      <div
        style={{
          gridColumn: "1",
          gridRow: "1",
          display: "flex",
          alignItems: "flex-start",
        }}
      >
        <button
          onClick={handleShareUrl}
          style={{
            padding: "10px 14px",
            height: "40px",
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
          <span>🔗 {t('share2DUrl')}</span>
        </button>
      </div>

      {/* Row 2, Column 1: Left Sidebar (Background Settings Panel) */}
      <aside
        className="sidebar-left panel"
        style={{
          gridColumn: "1",
          gridRow: "2",
          position: "sticky",
          top: "0px",
          zIndex: 10,
          alignSelf: "start",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          padding: "0px",
          border: "none",
          background: "transparent",
          boxShadow: "none"
        }}
      >
        <TechnicalBackground config={config} activeYear={state.activeYear} onChange={(c) => dispatch({ type: "SET_CONFIG", payload: c })} />
      </aside>

      {/* Row 1, Column 2: Profile Loader in the middle column */}
      <div style={{ gridColumn: "2", gridRow: "1" }}>
        <GitProfileLoader config={config} dispatch={dispatch} initialConfig={initialConfig} />
      </div>

      {/* Row 1, Column 3: Before/Sad | After/Happy Terminal Button */}
      <div
        onMouseDown={handlePressSad}
        onMouseUp={handleReleaseHappy}
        onMouseLeave={() => {
          handleReleaseHappy();
          setIsButtonHovered(false);
        }}
        onMouseEnter={() => setIsButtonHovered(true)}
        onTouchStart={(e) => { e.preventDefault(); handlePressSad(); }}
        onTouchEnd={handleReleaseHappy}
        onTouchCancel={handleReleaseHappy}
        style={{
          gridColumn: "3",
          gridRow: "1",
          width: "fit-content",
          justifySelf: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "40px",
          border: "1px solid",
          borderColor: isButtonHovered 
            ? "var(--greenbash-selected, #39d353)"
            : "var(--border)",
          borderRadius: "8px",
          backgroundColor: isButtonHovered ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.4)",
          fontFamily: "var(--font-mono, monospace)",
          fontWeight: "600",
          userSelect: "none",
          cursor: "pointer",
          padding: "0 16px"
        }}
      >
        <span
          style={{
            color: isSadPressed ? "var(--text-main, #ffffff)" : "var(--text-muted)",
            fontSize: isSadPressed ? "0.8rem" : "0.72rem",
            padding: "0 8px"
          }}
        >
          {t('beforeSad')}
        </span>
        <span style={{ color: "var(--border)", padding: "0 4px" }}>|</span>
        <span
          style={{
            color: !isSadPressed 
              ? "var(--greenbash-selected, #39d353)" 
              : "var(--text-muted)",
            fontSize: !isSadPressed ? "0.8rem" : "0.72rem",
            padding: "0 8px"
          }}
        >
          {t('afterHappy')}
        </span>
      </div>

      {/* Row 2, Column 2: Main Activity Graph */}
      <div style={{ gridColumn: "2", gridRow: "2" }}>
        <ActivityGraph ref={graphRef} state={state} dispatch={dispatch} onEditChange={setIsEditing} />
      </div>

      {/* Columns 3: Right Sidebar starting on Row 2 */}
      <aside
        className="sidebar-right panel"
        style={{
          gridColumn: "3",
          gridRow: "2",
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
