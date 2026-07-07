"use client";

import React from "react";
import { GeneratorConfig } from "@/types";
import { Card } from "@/components/Card";

interface BaseVibeProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
}

export function BaseVibe({ config, onChange }: BaseVibeProps) {
  const chaos = config.chaos ?? 50;
  const realism = config.realism ?? 100;

  const deriveVibeConfig = (chaosVal: number, realismVal: number, currentConfig: GeneratorConfig): GeneratorConfig => {
    let newFrequencies = currentConfig.frequencies;
    if (chaosVal < 20) newFrequencies = "40";
    else if (chaosVal < 50) newFrequencies = "30,50";
    else if (chaosVal < 80) newFrequencies = "20,60,30,80";
    else newFrequencies = "10,90,5,100,0,50";

    const newMaxCommits = Math.max(1, Math.floor(50 - (realismVal * 0.45)));

    return {
      ...currentConfig,
      chaos: chaosVal,
      realism: realismVal,
      frequencies: newFrequencies,
      maxCommitsPerDay: newMaxCommits,
      noWeekends: true,
      vacationsPerYear: "2"
    };
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = parseInt(value, 10);

    const targetChaos = name === "chaos" ? val : chaos;
    const targetRealism = name === "realism" ? val : realism;

    const derived = deriveVibeConfig(targetChaos, targetRealism, config);
    onChange(derived);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextConfig = { ...config, [e.target.name]: e.target.value };
    const derived = deriveVibeConfig(chaos, realism, nextConfig);
    onChange(derived);
  };

  const handleApply = () => {
    const derived = deriveVibeConfig(chaos, realism, config);
    onChange(derived);
  };

  const isConfigModified = () => {
    const defaultChaos = 50;
    const defaultRealism = 100;
    const defaultStartDate = "2014";
    const defaultEndDate = "present";

    const currentChaos = config.chaos ?? defaultChaos;
    const currentRealism = config.realism ?? defaultRealism;
    const currentStartDate = config.startDate ?? defaultStartDate;
    const currentEndDate = config.endDate ?? defaultEndDate;

    if (currentChaos !== defaultChaos) return true;
    if (currentRealism !== defaultRealism) return true;
    if (currentStartDate !== defaultStartDate) return true;
    if (currentEndDate !== defaultEndDate) return true;

    const hasCustomBg = (config.layers || []).some(l => {
      if (l.type === 'background') {
        const bg = l as any;
        return bg.customFrequency !== undefined || bg.cleared === true;
      }
      return false;
    });
    if (hasCustomBg) return true;

    return false;
  };

  const handleReset = () => {
    const resetLayers = (config.layers || []).map(l => {
      if (l.type === 'background') {
        const { customFrequency, cleared, ...rest } = l as any;
        return { ...rest, cleared: false };
      }
      return l;
    });

    onChange({
      ...config,
      chaos: 50,
      realism: 100,
      noWeekends: true,
      vacationsPerYear: "2",
      startDate: "2014",
      endDate: "present",
      frequencies: "30,50,45,35,53",
      maxCommitsPerDay: 5,
      vacationLengthDays: "14,28,21",
      layers: resetLayers
    });
  };

  return (
    <Card
      title="💖 Base vibe"
      className="base-vibe"
      collapsible={true}
      extraHeaderActions={
        isConfigModified() && (
          <button
            type="button"
            onClick={handleReset}
            title="Reset to default vibe"
            style={{
              width: "28px",
              height: "28px",
              padding: 0,
              borderRadius: "50%",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              background: "rgba(168, 85, 247, 0.15)",
              color: "#c084fc",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 8px rgba(168, 85, 247, 0.2)",
              transition: "all 0.2s ease"
            }}
          >
            🔄
          </button>
        )
      }
    >
      <div style={{ display: "flex", gap: "10px", margin: "10px 0", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
          <span style={{ fontSize: "0.85rem", color: "#dce1ff" }}>From</span>
          <input
            type="text"
            name="startDate"
            className="form-control"
            style={{ width: "100%", minWidth: "50px", padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem", borderRadius: "6px", textAlign: "center" }}
            placeholder="2014"
            value={config.startDate}
            onChange={handleTextChange}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
          <span style={{ fontSize: "0.85rem", color: "#dce1ff" }}>To</span>
          <input
            type="text"
            name="endDate"
            className="form-control"
            style={{ width: "100%", minWidth: "50px", padding: "4px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem", borderRadius: "6px", textAlign: "center" }}
            placeholder="present"
            value={config.endDate}
            onChange={handleTextChange}
          />
        </div>
      </div>

      <div className="control-row">
        <span>🎢 Chaos</span>
        <input type="range" name="chaos" min="0" max="100" value={chaos} onChange={handleSliderChange} />
        <b>{chaos}%</b>
      </div>
      <div className="control-row">
        <span>😎 Realism</span>
        <input type="range" name="realism" min="0" max="100" value={realism} onChange={handleSliderChange} />
        <b>{realism}%</b>
      </div>

      <button
        type="button"
        onClick={handleApply}
        style={{
          width: "100%",
          backgroundColor: "rgba(168, 85, 247, 0.12)",
          border: "1px solid rgba(168, 85, 247, 0.4)",
          color: "#c084fc",
          padding: "8px 12px",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "0.85rem",
          cursor: "pointer",
          marginTop: "12px",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(168, 85, 247, 0.22)";
          e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(168, 85, 247, 0.12)";
          e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.4)";
        }}
      >
        Apply
      </button>
    </Card>
  );
}
