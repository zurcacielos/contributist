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

          // Glow effect
          let glowColor = color;
          if (color === "var(--surface)") {
            glowColor = "rgba(255, 255, 255, 0.4)";
          } else if (isSynth && level === 0) {
            glowColor = "rgba(255, 0, 127, 0.4)";
          }

          // Custom Level 0 borders
          const extraStyles: React.CSSProperties = {};
          if (isSynth && level === 0) {
            extraStyles.border = isSelected ? "2px solid #fff" : "1px solid #ff007f";
          } else {
            extraStyles.border = isSelected ? "2px solid #fff" : "1px solid rgba(255,255,255,0.12)";
          }

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
                boxShadow: isSelected ? `0 0 8px ${glowColor}` : "none",
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
              background: "rgba(0, 0, 0, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              position: "relative",
              cursor: "pointer",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.6)",
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
                background: !showPaintedInOrange ? "#39d353" : "#ff007f",
                boxShadow: !showPaintedInOrange
                  ? "0 0 10px #39d353, 0 0 20px #39d353"
                  : "0 0 10px #ff007f, 0 0 20px #ff007f",
                top: !showPaintedInOrange ? "4px" : "28px",
                transition: "all 0.25s cubic-bezier(0.25, 1, 0.5, 1)"
              }}
            />
          </div>
        </div>

        {/* Right side: Palettes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          {renderPaletteRow(greenColors, false)}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", width: "100%" }} />
          {renderPaletteRow(synthColors, true)}
        </div>
      </div>
    </section>
  );
}
