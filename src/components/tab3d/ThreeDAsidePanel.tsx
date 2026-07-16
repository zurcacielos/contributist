import React from "react";
import { Card } from "../Card";
import { SynthFont } from "../SynthFont";
import { useTranslations } from "next-intl";

interface ThreeDAsidePanelProps {
  availableYears: number[];
  selectedYears: number[];
  onSelectedYearsChange: (years: number[]) => void;
  heightMultiplier: number;
  onHeightMultiplierChange: (val: number) => void;
  baseThickness: number;
  onBaseThicknessChange: (val: number) => void;
  spacing: number;
  onSpacingChange: (val: number) => void;
  palette: "green" | "synth" | "gray";
  onPaletteChange: (val: "green" | "synth" | "gray") => void;
  onExportStl: () => void;
  onExportObj: () => void;
  onCapturePng: () => void;
  onZoomToFit: () => void;
  onResetGeometry: () => void;
  showUsername: boolean;
  onShowUsernameChange: (val: boolean) => void;
  username: string;
  onUsernameChange: (val: string) => void;
  usernamePosition: 'recent-left' | 'recent-right' | 'last-left' | 'last-right' | 'front-side-left' | 'front-side-right';
  onUsernamePositionChange: (val: 'recent-left' | 'recent-right' | 'last-left' | 'last-right' | 'front-side-left' | 'front-side-right') => void;
}

export const ThreeDAsidePanel: React.FC<ThreeDAsidePanelProps> = ({
  availableYears,
  selectedYears,
  onSelectedYearsChange,
  heightMultiplier,
  onHeightMultiplierChange,
  baseThickness,
  onBaseThicknessChange,
  spacing,
  onSpacingChange,
  palette,
  onPaletteChange,
  onExportStl,
  onExportObj,
  onCapturePng,
  onZoomToFit,
  onResetGeometry,
  showUsername,
  onShowUsernameChange,
  username,
  onUsernameChange,
  usernamePosition,
  onUsernamePositionChange,
}) => {
  const t = useTranslations("ThreeD");

  const handleYearToggle = (year: number) => {
    if (selectedYears.includes(year)) {
      // Keep at least one year selected
      if (selectedYears.length > 1) {
        onSelectedYearsChange(selectedYears.filter((y) => y !== year));
      }
    } else {
      onSelectedYearsChange([...selectedYears, year].sort((a, b) => b - a));
    }
  };

  const handleSelectAll = () => {
    onSelectedYearsChange([...availableYears]);
  };

  const handleDeselectAll = () => {
    onSelectedYearsChange([]);
  };

  return (
    <aside
      className="sidebar-left panel"
      style={{
        position: "sticky",
        top: "0px",
        zIndex: 10,
        alignSelf: "start",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        maxHeight: "100%",
        overflowY: "auto",
        paddingRight: "6px",
      }}
    >
      {/* Legends Customization Card */}
      <Card
        title={
          <SynthFont variation="pink-cyan" style={{ textTransform: "none" }}>
            {t("legendsTitle")}
          </SynthFont>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Username Checkbox */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.85rem",
              color: "var(--text-main)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showUsername}
              onChange={(e) => onShowUsernameChange(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            {t("showUsername")}
          </label>

          {/* Conditional Input and Select */}
          {showUsername && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {t("usernameInput")}
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-main)",
                    fontSize: "0.8rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {t("positionLabel")}
                </span>
                <select
                  value={usernamePosition}
                  onChange={(e) => onUsernamePositionChange(e.target.value as any)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--border)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "var(--text-main)",
                    fontSize: "0.8rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="recent-left" style={{ backgroundColor: "#111", color: "#fff" }}>
                    {t("posRecentLeft")}
                  </option>
                  <option value="recent-right" style={{ backgroundColor: "#111", color: "#fff" }}>
                    {t("posRecentRight")}
                  </option>
                  <option value="last-left" style={{ backgroundColor: "#111", color: "#fff" }}>
                    {t("posLastLeft")}
                  </option>
                  <option value="last-right" style={{ backgroundColor: "#111", color: "#fff" }}>
                    {t("posLastRight")}
                  </option>
                  <option value="front-side-left" style={{ backgroundColor: "#111", color: "#fff" }}>
                    {t("posFrontSideLeft")}
                  </option>
                  <option value="front-side-right" style={{ backgroundColor: "#111", color: "#fff" }}>
                    {t("posFrontSideRight")}
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Zoom to Fit Button */}
      <button
        onClick={onZoomToFit}
        className="btn btn-primary"
        style={{
          padding: "10px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.9rem",
          fontWeight: "bold",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        🔍 {t("zoomToFit")}
      </button>

      {/* Year Selection Card */}
      <Card
        title={
          <SynthFont variation="pink-cyan" style={{ textTransform: "none" }}>
            {t("yearsTitle")}
          </SynthFont>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSelectAll}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "var(--text-main)",
                cursor: "pointer",
                fontSize: "0.75rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
            >
              {t("selectAll")}
            </button>
            <button
              onClick={handleDeselectAll}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "var(--text-main)",
                cursor: "pointer",
                fontSize: "0.75rem",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
            >
              {t("deselectAll")}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px 12px",
              maxHeight: "120px",
              overflowY: "auto",
              paddingRight: "4px",
              marginTop: "4px",
            }}
          >
            {availableYears.map((y) => {
              const isChecked = selectedYears.includes(y);
              return (
                <label
                  key={y}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.85rem",
                    color: "var(--text-main)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleYearToggle(y)}
                    style={{ cursor: "pointer" }}
                  />
                  {y}
                </label>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Color Palette Card */}
      <Card
        title={
          <SynthFont variation="pink-cyan" style={{ textTransform: "none" }}>
            {t("paletteTitle")}
          </SynthFont>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <select
            value={palette}
            onChange={(e) => onPaletteChange(e.target.value as any)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "var(--text-main)",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="green" style={{ backgroundColor: "#161b22", color: "#c9d1d9" }}>
              Classic Green
            </option>
            <option value="synth" style={{ backgroundColor: "#090314", color: "#ec4899" }}>
              Synthwave
            </option>
            <option value="gray" style={{ backgroundColor: "#111111", color: "#dddddd" }}>
              Monochrome Gray
            </option>
          </select>
        </div>
      </Card>

      {/* Geometry Customization Card */}
      <Card
        title={
          <SynthFont variation="pink-cyan" style={{ textTransform: "none" }}>
            {t("geometryTitle")}
          </SynthFont>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Height Multiplier Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span>{t("height")}</span>
              <span>{heightMultiplier.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={heightMultiplier}
              onChange={(e) => onHeightMultiplierChange(parseFloat(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          {/* Base Plate Thickness Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span>{t("baseThickness")}</span>
              <span>{baseThickness.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={baseThickness}
              onChange={(e) => onBaseThicknessChange(parseFloat(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          {/* Column Spacing Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span>{t("spacing")}</span>
              <span>{spacing.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={spacing}
              onChange={(e) => onSpacingChange(parseFloat(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
          </div>

          {/* Reset Geometry Button */}
          <button
            onClick={onResetGeometry}
            style={{
              padding: "5px 10px",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "0.75rem",
              marginTop: "4px",
              width: "100%",
              textAlign: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "var(--text-main)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            {t("reset")}
          </button>
        </div>
      </Card>



      {/* Export Actions Card */}
      <Card
        title={
          <SynthFont variation="pink-cyan" style={{ textTransform: "none" }}>
            {t("exportTitle")}
          </SynthFont>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={onExportStl}
            className="btn btn-primary"
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "bold",
              width: "100%",
            }}
          >
            {t("downloadStl")}
          </button>

          <button
            onClick={onExportObj}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "var(--text-main)",
              cursor: "pointer",
              fontSize: "0.85rem",
              width: "100%",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
          >
            {t("downloadObj")}
          </button>

          <button
            onClick={onCapturePng}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "var(--text-main)",
              cursor: "pointer",
              fontSize: "0.85rem",
              width: "100%",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
          >
            {t("savePng")}
          </button>
        </div>
      </Card>
    </aside>
  );
};
