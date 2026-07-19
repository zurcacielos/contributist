"use client";

import React from "react";
import { GeneratorConfig } from "@/types";
import { Card } from "@/components/Card";

interface PaletteCardProps {
  config: GeneratorConfig;
  onChange: (newConfig: GeneratorConfig) => void;
}

export const PaletteCard: React.FC<PaletteCardProps> = ({ config, onChange }) => {
  const isSynth = config.showPaintedInOrange;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChange({
      ...config,
      showPaintedInOrange: val === "synthwave",
    });
  };

  const synthColors = ["#161b22", "#5c0900", "#d53a00", "#ff7f00", "#ffcf26"];
  const greenColors = ["#161b22", "#103625", "#176d39", "#2ab24e", "#99df3f"];
  const activeColors = isSynth ? synthColors : greenColors;

  return (
    <Card collapsible={false} title="Palette">
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <select
          value={isSynth ? "synthwave" : "classic"}
          onChange={handleSelectChange}
          style={{
            width: "100%",
            backgroundColor: "var(--select-bg)",
            border: "1px solid var(--select-border)",
            color: "var(--text-main)",
            padding: "8px 12px",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="classic" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>Classic Green</option>
          <option value="synthwave" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>Amber</option>
        </select>
        <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginTop: "4px" }}>
          {activeColors.map((color, idx) => (
            <div
              key={idx}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "5px",
                backgroundColor: color,
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: `0 0 10px ${color}33`,
              }}
              title={`Level ${idx}`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};
