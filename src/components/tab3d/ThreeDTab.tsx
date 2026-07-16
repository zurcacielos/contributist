import React, { useState, useMemo } from "react";
import { useActivityGraph } from "@/hooks/useActivityGraph";
import { AppState, AppAction } from "@/state/appReducer";
import { ThreeDAsidePanel } from "./ThreeDAsidePanel";
import { ThreeDCanvas } from "./ThreeDCanvas";
import { generateSTL, generateOBJ, StlPillar } from "@/utils/stlExporter";
import { parseYear } from "@/types";

interface ThreeDTabProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const ThreeDTab: React.FC<ThreeDTabProps> = ({ state, dispatch }) => {
  const { config } = state;

  // 1. Calculate available years from state config range
  const availableYears = useMemo(() => {
    const startYear = parseYear(config.startDate);
    const endYear = parseYear(config.endDate);
    const minYear = Math.min(startYear, endYear);
    const maxYear = Math.max(startYear, endYear);
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  }, [config.startDate, config.endDate]);

  // 2. Local settings state
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [hasInitializedSelected, setHasInitializedSelected] = useState(false);
  const [heightMultiplier, setHeightMultiplier] = useState<number>(2.0);
  const [baseThickness, setBaseThickness] = useState<number>(2.0);
  const [spacing, setSpacing] = useState<number>(1.2);
  const [palette, setPalette] = useState<"green" | "synth" | "gray">("green");

  // Username display settings
  const [showUsername, setShowUsername] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");
  const [usernamePosition, setUsernamePosition] = useState<'recent-left' | 'recent-right' | 'last-left' | 'last-right' | 'front-side-left' | 'front-side-right'>('last-left');

  const defaultUsername = useMemo(() => {
    let imported = (state.config.gitProfileOrURL_import || "").trim();
    if (imported.includes("/")) {
      const parts = imported.split("/").filter(Boolean);
      imported = parts[parts.length - 1] || "";
    }
    return imported || (state.config.gitName || "").trim() || "contributist";
  }, [state.config.gitProfileOrURL_import, state.config.gitName]);

  // Synchronize defaultUsername to local username state
  React.useEffect(() => {
    if (!username && defaultUsername) {
      setUsername(defaultUsername);
    }
  }, [defaultUsername, username]);

  // Hook for capture function ref
  const captureFnRef = React.useRef<(() => string) | null>(null);
  // Hook for zoom function ref
  const zoomFnRef = React.useRef<(() => void) | null>(null);
  // Hook for export STL function ref
  const exportStlFnRef = React.useRef<(() => string) | null>(null);
  // Hook for export OBJ function ref
  const exportObjFnRef = React.useRef<(() => string) | null>(null);

  // 3. Compute active graph composite data
  const { generatedData } = useActivityGraph({
    state,
    dispatch,
    onEditChange: () => {},
  });

  // Automatically select only non-empty years on load (max 4, skipping empty ones)
  React.useEffect(() => {
    if (generatedData.length > 0 && !hasInitializedSelected) {
      const nonReemptyYears = generatedData
        .filter((yData) => yData.days.some((d) => d.level > 0))
        .map((yData) => yData.year);

      if (nonReemptyYears.length === 0) {
        // Fallback: select the first available year (most recent) if all are empty
        setSelectedYears(availableYears.length > 0 ? [availableYears[0]] : []);
      } else {
        // Sort descending (most recent first) and select maximum of 4 years
        const sortedNonEmpty = [...nonReemptyYears].sort((a, b) => b - a);
        setSelectedYears(sortedNonEmpty.slice(0, 4));
      }
      setHasInitializedSelected(true);
    }
  }, [generatedData, availableYears, hasInitializedSelected]);

  // 4. Map active years grid to StlPillars
  const pillars = useMemo(() => {
    const list: StlPillar[] = [];
    const sortedSelected = [...selectedYears].sort((a, b) => b - a);

    sortedSelected.forEach((year, yearIdx) => {
      const yearData = generatedData.find((d) => d.year === year);
      if (!yearData) return;

      yearData.days.forEach((day, dayIdx) => {
        const row = dayIdx % 7;
        const col = Math.floor(dayIdx / 7);
        // Treat padding/out-of-bounds days as level 0 to keep printable block solid
        const level = day.level < 0 ? 0 : day.level;

        list.push({
          col,
          row,
          yearIndex: yearIdx,
          level,
        });
      });
    });

    return list;
  }, [generatedData, selectedYears]);

  // 5. Exporters
  const handleExportStl = () => {
    let stl = "";
    if (exportStlFnRef.current) {
      stl = exportStlFnRef.current();
    }
    if (!stl) {
      stl = generateSTL(
        pillars,
        selectedYears.length,
        heightMultiplier,
        baseThickness,
        spacing
      );
    }
    const blob = new Blob([stl], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contributist-design-${selectedYears.join("-")}.stl`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportObj = () => {
    let obj = "";
    if (exportObjFnRef.current) {
      obj = exportObjFnRef.current();
    }
    if (!obj) {
      obj = generateOBJ(
        pillars,
        selectedYears.length,
        heightMultiplier,
        baseThickness,
        spacing
      );
    }
    const blob = new Blob([obj], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contributist-design-${selectedYears.join("-")}.obj`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCapturePng = () => {
    if (captureFnRef.current) {
      const dataUrl = captureFnRef.current();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `contributist-3d-${selectedYears.join("-")}.png`;
      link.click();
    }
  };

  const handleResetGeometry = () => {
    setHeightMultiplier(2.0);
    setBaseThickness(2.0);
    setSpacing(1.2);
  };

  return (
    <section
      className="layout draw-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gridTemplateRows: "100%",
        gap: "20px",
        padding: "20px",
        height: "calc(100vh - 60px)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Sidebar Controls */}
      <ThreeDAsidePanel
        availableYears={availableYears}
        selectedYears={selectedYears}
        onSelectedYearsChange={setSelectedYears}
        heightMultiplier={heightMultiplier}
        onHeightMultiplierChange={setHeightMultiplier}
        baseThickness={baseThickness}
        onBaseThicknessChange={setBaseThickness}
        spacing={spacing}
        onSpacingChange={setSpacing}
        palette={palette}
        onPaletteChange={setPalette}
        onExportStl={handleExportStl}
        onExportObj={handleExportObj}
        onCapturePng={handleCapturePng}
        onZoomToFit={() => zoomFnRef.current?.()}
        onResetGeometry={handleResetGeometry}
        showUsername={showUsername}
        onShowUsernameChange={setShowUsername}
        username={username}
        onUsernameChange={setUsername}
        usernamePosition={usernamePosition}
        onUsernamePositionChange={setUsernamePosition}
      />

      {/* Main Canvas Viewport */}
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <ThreeDCanvas
          pillars={pillars}
          numYears={selectedYears.length}
          heightMultiplier={heightMultiplier}
          baseThickness={baseThickness}
          spacing={spacing}
          palette={palette}
          showUsername={showUsername}
          username={username}
          usernamePosition={usernamePosition}
          onCaptureReady={(fn) => {
            captureFnRef.current = fn;
          }}
          onZoomToFitReady={(fn) => {
            zoomFnRef.current = fn;
          }}
          onExportStlReady={(fn) => {
            exportStlFnRef.current = fn;
          }}
          onExportObjReady={(fn) => {
            exportObjFnRef.current = fn;
          }}
        />
      </div>
    </section>
  );
};
export default ThreeDTab;
