"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { GreenFont } from "@/components/GreenFont";

interface ColorSelectorProps {
  selectedLevel: number;
  showPaintedInOrange: boolean;
  onSelect: (level: number, isSynth: boolean) => void;
  onTogglePaintedInOrange: () => void;
}

export function ColorSelector({
  selectedLevel,
  showPaintedInOrange,
  onSelect,
  onTogglePaintedInOrange
}: ColorSelectorProps) {
  const t = useTranslations('Calendar');
  const tSidebar = useTranslations('Sidebar');
  const greenColors = [
    "var(--level-0)",
    "var(--level-1)",
    "var(--level-2)",
    "var(--level-3)",
    "var(--level-4)"
  ];

  const synthColors = [
    "var(--surface)",
    "#5c0900", // Burgundy
    "#d53a00", // Red Orange
    "#ff7f00", // Orange
    "#ffcf26"  // Amber Yellow
  ];

  const renderPaletteRow = (colors: string[], isSynth: boolean) => {
    const isRowActive = showPaintedInOrange === isSynth;

    return (
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          justifyContent: "center",
          opacity: isRowActive ? 1 : 0.45,
          transition: "opacity 0.2s ease"
        }}
      >
        {colors.map((color, level) => {
          const isSelected = isRowActive && selectedLevel === level;

          const extraStyles: React.CSSProperties = {
            border: isSelected ? "2px solid var(--swatch-active-border)" : "1px solid var(--swatch-border)"
          };

          return (
            <button
              key={level}
              type="button"
              onClick={() => onSelect(level, isSynth)}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "5px",
                backgroundColor: color,
                cursor: "pointer",
                transition: "transform 0.1s, border-color 0.1s",
                padding: 0,
                flexShrink: 0,
                ...extraStyles
              }}
              title={t('tooltipLevel', { style: isSynth ? 'Synth' : 'Classic', level })}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          );
        })}
      </div>
    );
  };

  const handleToggleClick = () => {
    onSelect(selectedLevel, !showPaintedInOrange);
  };

  return (
    <section
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "center",
        justifyContent: "center",
        padding: "14px 16px",
        marginBottom: 0
      }}
    >
      {/* Top: Show art in Synth checkbox */}
      <div style={{ display: "flex", width: "100%", justifyContent: "flex-start", marginBottom: "2px" }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            id="show-art-synth"
            checked={showPaintedInOrange}
            onChange={onTogglePaintedInOrange}
            style={{ marginRight: '4px' }}
          />
          <GreenFont variation="green-bright">
            {tSidebar('showSynthArt')}
          </GreenFont>
        </label>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: "16px", alignItems: "center", width: "100%" }}>
        {/* Left side: Vertical Toggler */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div
            onClick={handleToggleClick}
            style={{
              width: "16px",
              height: "44px",
              borderRadius: "999px",
              background: "var(--toggle-track-bg)",
              border: "1px solid var(--toggle-track-border)",
              position: "relative",
              cursor: "pointer",
              boxShadow: "var(--toggle-track-shadow)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Switch Palette"
          >
            {/* Sliding Knob */}
            <div
              style={{
                position: "absolute",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: !showPaintedInOrange ? "var(--toggle-knob-green)" : "var(--toggle-knob-synth)",
                top: !showPaintedInOrange ? "4px" : "28px",
                transition: "all 0.25s cubic-bezier(0.25, 1, 0.5, 1)"
              }}
            />
          </div>
        </div>

        {/* Right side: Palettes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          {renderPaletteRow(greenColors, false)}
          <div style={{ borderTop: "1px solid var(--border)", width: "100%" }} />
          {renderPaletteRow(synthColors, true)}
        </div>
      </div>
    </section>
  );
}
