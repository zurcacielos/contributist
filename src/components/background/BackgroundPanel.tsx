"use client";

import React from "react";
import { GeneratorConfig } from "@/types";
import { TechnicalBackground } from "./TechnicalBackground";

interface BackgroundPanelProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
}

export function BackgroundPanel({ config, onChange }: BackgroundPanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "8px" }}>
      <TechnicalBackground config={config} onChange={onChange} />
    </div>
  );
}

