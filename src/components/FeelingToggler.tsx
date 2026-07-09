import React from "react";
import { FeelingMode } from "@/types";

interface FeelingTogglerProps {
  feelingMode: FeelingMode;
  onChange: (mode: FeelingMode) => void;
  style?: React.CSSProperties;
}

export const FeelingToggler: React.FC<FeelingTogglerProps> = ({ feelingMode, onChange, style }) => {
  const isVibe = feelingMode === "vibe";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px",
        background: "rgba(10, 15, 30, 0.65)",
        border: "1px solid rgba(168, 85, 247, 0.5)",
        backdropFilter: "blur(8px)",
        borderRadius: "999px",
        position: "relative",
        userSelect: "none",
        width: "210px", // Set fixed width for perfect 50/50 split
        ...style
      }}
    >
      {/* Sliding background pill */}
      <div
        style={{
          position: "absolute",
          top: "2px",
          bottom: "2px",
          left: isVibe ? "2px" : "calc(50% + 1px)",
          width: "calc(50% - 3px)",
          borderRadius: "999px",
          background: isVibe
            ? "linear-gradient(135deg, #a855f7, #ec4899)" // Vibe gradient (Purple to Pink)
            : "var(--greenbash)", // Solid Green
          boxShadow: isVibe
            ? "0 0 14px rgba(168, 85, 247, 0.55), inset 0 1px rgba(255, 255, 255, 0.2)"
            : "inset 0 1px rgba(255, 255, 255, 0.2)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1,
          pointerEvents: "none"
        }}
      />

      {/* Vibes label button */}
      <button
        type="button"
        onClick={() => onChange("vibe")}
        style={{
          background: "none",
          border: "none",
          padding: "6px 0", // vertical padding only
          flex: 1, // take equal 50% width
          justifyContent: "center", // center horizontally
          fontSize: "0.80rem",
          fontWeight: "bold",
          color: isVibe ? "#ffffff" : "var(--text-muted)",
          cursor: "pointer",
          borderRadius: "999px",
          transition: "color 0.25s ease",
          zIndex: 2,
          position: "relative",
          outline: "none",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        <span>Vibes</span>
      </button>

      {/* Advanced label button */}
      <button
        type="button"
        aria-label="Toggle Advanced Mode"
        onClick={() => onChange("advanced")}
        style={{
          background: "none",
          border: "none",
          padding: "6px 0", // vertical padding only
          flex: 1, // take equal 50% width
          justifyContent: "center", // center horizontally
          fontSize: "0.80rem",
          fontWeight: "bold",
          fontFamily: !isVibe ? "Consolas, Monaco, monospace" : "inherit",
          color: !isVibe ? "#ffffff" : "var(--text-muted)",
          cursor: "pointer",
          borderRadius: "999px",
          transition: "color 0.25s ease",
          zIndex: 2,
          position: "relative",
          outline: "none",
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        <span>#!/bin/bash</span>
      </button>
    </div>
  );
};
