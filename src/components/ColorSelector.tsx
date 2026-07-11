"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface ColorSelectorProps {
  selectedLevel: number;
  showPaintedInOrange: boolean;
  onSelect: (level: number, isSynth: boolean) => void;
}

export function ColorSelector({ selectedLevel, showPaintedInOrange, onSelect }: ColorSelectorProps) {
  const t = useTranslations('Calendar');
  const greenColors = [
    "var(--level-0)", 
    "var(--level-1)", 
    "var(--level-2)", 
    "var(--level-3)", 
    "var(--level-4)"
  ];

  const synthColors = [
    "var(--surface)", 
    "#2d0a4e", // Deep Violet
    "#008e43", // Neon Green
    "#00d2ff", // Celeste
    "#ff007f"  // Fluo Pink
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
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
        {renderPaletteRow(greenColors, false)}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", width: "100%" }} />
        {renderPaletteRow(synthColors, true)}
      </div>
    </section>
  );
}
