"use client";

import React, { useState } from "react";
import { GeneratorConfig } from "@/types";
import { BaseVibe } from "./BaseVibe";
import { TechnicalBackground } from "./TechnicalBackground";

interface BackgroundPanelProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
}

export function BackgroundPanel({ config, onChange }: BackgroundPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "8px" }}>
      <BaseVibe config={config} onChange={onChange} />

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          textAlign: "left",
          cursor: "pointer",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "5px"
        }}
      >
        <span>{showAdvanced ? "▼" : "▶"}</span> Background
      </button>

      {showAdvanced && (
        <TechnicalBackground config={config} onChange={onChange} />
      )}
    </div>
  );
}
