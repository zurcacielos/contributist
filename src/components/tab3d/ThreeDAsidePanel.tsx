import React from "react";
import { Card } from "../Card";
import { GreenFont } from "../GreenFont";
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
  onZoomToFit: () => void;
  onResetGeometry: () => void;
  showUsername: boolean;
  onShowUsernameChange: (val: boolean) => void;
  username: string;
  onUsernameChange: (val: string) => void;
  usernamePosition: 'recent-left' | 'recent-right' | 'last-left' | 'last-right' | 'front-side-left' | 'front-side-right';
  onUsernamePositionChange: (val: 'recent-left' | 'recent-right' | 'last-left' | 'last-right' | 'front-side-left' | 'front-side-right') => void;
  onShareUrl: () => void;
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
  onZoomToFit,
  onResetGeometry,
  showUsername,
  onShowUsernameChange,
  username,
  onUsernameChange,
  usernamePosition,
  onUsernamePositionChange,
  onShareUrl,
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
      {/* Share 3D URL Button */}
      <button
        onClick={onShareUrl}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid var(--btn-border)",
          backgroundColor: "var(--btn-bg)",
          color: "var(--btn-green-text)",
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
          e.currentTarget.style.backgroundColor = "var(--btn-green-hover-bg)";
          e.currentTarget.style.borderColor = "var(--btn-green-text)";
          e.currentTarget.style.color = "var(--btn-green-text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--btn-bg)";
          e.currentTarget.style.borderColor = "var(--btn-border)";
          e.currentTarget.style.color = "var(--btn-green-text)";
        }}
      >
        <span>🔗 {t('share3DUrl')}</span>
      </button>

      {/* Zoom to Fit Button */}
      <button
        onClick={onZoomToFit}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid var(--btn-secondary-border)",
          backgroundColor: "var(--btn-secondary-bg)",
          color: "var(--btn-secondary-text)",
          cursor: "pointer",
          fontSize: "0.85rem",
          fontWeight: "600",
          fontFamily: "var(--font-mono, monospace)",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          outline: "none",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--btn-hover-bg)";
          e.currentTarget.style.borderColor = "var(--btn-border)";
          e.currentTarget.style.color = "var(--text-main)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)";
          e.currentTarget.style.borderColor = "var(--btn-secondary-border)";
          e.currentTarget.style.color = "var(--btn-secondary-text)";
        }}
      >
        <span>{t("zoomToFit")}</span>
      </button>

      {/* Legends Customization Card */}
      <Card title="">
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
                <input
                  type="text"
                  value={username}
                  onChange={(e) => onUsernameChange(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--input-border)",
                    backgroundColor: "var(--input-bg)",
                    color: "var(--input-text)",
                    fontSize: "0.8rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <select
                  value={usernamePosition}
                  onChange={(e) => onUsernamePositionChange(e.target.value as any)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--select-border)",
                    backgroundColor: "var(--select-bg)",
                    color: "var(--select-text)",
                    fontSize: "0.8rem",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="recent-left" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>
                    {t("posRecentLeft")}
                  </option>
                  <option value="recent-right" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>
                    {t("posRecentRight")}
                  </option>
                  <option value="last-left" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>
                    {t("posLastLeft")}
                  </option>
                  <option value="last-right" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>
                    {t("posLastRight")}
                  </option>
                  <option value="front-side-left" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>
                    {t("posFrontSideLeft")}
                  </option>
                  <option value="front-side-right" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>
                    {t("posFrontSideRight")}
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>


      {/* Year Selection Card */}
      <Card
        title={
          <GreenFont variation="green-bright" style={{ textTransform: "none" }}>
            {t("yearsTitle")}
          </GreenFont>
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
                border: "1px solid var(--btn-secondary-border)",
                backgroundColor: "var(--btn-secondary-bg)",
                color: "var(--btn-secondary-text)",
                cursor: "pointer",
                fontSize: "0.75rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)")}
            >
              {t("selectAll")}
            </button>
            <button
              onClick={handleDeselectAll}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid var(--btn-secondary-border)",
                backgroundColor: "var(--btn-secondary-bg)",
                color: "var(--btn-secondary-text)",
                cursor: "pointer",
                fontSize: "0.75rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)")}
            >
              {t("deselectAll")}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px 12px",
              maxHeight: "90px",
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
      <Card title="">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <select
            value={palette}
            onChange={(e) => onPaletteChange(e.target.value as any)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid var(--select-border)",
              backgroundColor: "var(--select-bg)",
              color: "var(--select-text)",
              fontSize: "0.85rem",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="green" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>
              Classic Green
            </option>
            <option value="synth" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>
              Amber
            </option>
            <option value="gray" style={{ backgroundColor: "var(--select-bg)", color: "var(--select-text)" }}>
              Monochrome Gray
            </option>
          </select>
        </div>
      </Card>

      {/* Geometry Customization Card */}
      <Card
        title={
          <GreenFont variation="green-bright" style={{ textTransform: "none" }}>
            {t("geometryTitle")}
          </GreenFont>
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
              borderRadius: "8px",
              border: "1px solid var(--btn-border)",
              backgroundColor: "var(--btn-bg)",
              color: "var(--btn-green-text)",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono, monospace)",
              marginTop: "4px",
              width: "100%",
              textAlign: "center",
              transition: "all 0.2s ease",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--btn-green-hover-bg)";
              e.currentTarget.style.borderColor = "var(--btn-green-text)";
              e.currentTarget.style.color = "var(--btn-green-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--btn-bg)";
              e.currentTarget.style.borderColor = "var(--btn-border)";
              e.currentTarget.style.color = "var(--btn-green-text)";
            }}
          >
            {t("reset")}
          </button>
        </div>
      </Card>
    </aside>
  );
};
