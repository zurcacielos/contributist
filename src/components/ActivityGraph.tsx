"use client";
import React from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { AppState, AppAction } from "@/state/appReducer";
import { FeelingMode } from "@/types";
import { useActivityGraph } from "@/hooks/useActivityGraph";
import { YearCard } from "./activity-graph/YearCard";

export interface ActivityGraphRef {
  hasUnsavedChanges: () => boolean;
  saveChanges: () => void;
  discardChanges: () => void;
  exportAsPNG: () => Promise<void>;
}

export interface ActivityGraphProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  onEditChange: (isEditing: boolean) => void;
  feelingMode?: FeelingMode;
  preview?: boolean;
  showPaintedInOrangeOverride?: boolean;
  template?: "vibe" | "simplegit" | "flatgit";
}

export const ActivityGraph = React.forwardRef<ActivityGraphRef, ActivityGraphProps>(({ state, dispatch, onEditChange, feelingMode, preview, showPaintedInOrangeOverride, template }, ref) => {
  const {
    mounted,
    isCapturing,
    hoveredDay,
    setHoveredDay,
    draggedLayerId,
    captureRef,
    generatedData,
    formatDate,
    handleDownloadMockup,
    handleCellMouseDown,
    handleCellMouseEnter
  } = useActivityGraph({ state, dispatch, onEditChange });

  React.useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => false,
    saveChanges: () => { },
    discardChanges: () => { },
    exportAsPNG: handleDownloadMockup,
  }));

  const handleAddYear = () => {
    const currentStartYear = parseInt(state.config.startDate, 10);
    if (isNaN(currentStartYear)) return;

    const newStartYear = currentStartYear - 1;
    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...state.config,
        startDate: newStartYear.toString()
      }
    });
  };

  if (!mounted) {
    return (
      <div className="card">
        <h2>Live Activity Preview</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
          Loading preview...
        </p>
      </div>
    );
  }

  const highestYear = generatedData[0]?.year;

  return (
    <>
      <div 
        ref={captureRef} 
        className="activity-graph-main" 
        id="activity-graph-main" 
        style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}
      >
        {generatedData.map(({ year, days, meta }) => (
          <YearCard
            key={year}
            year={year}
            days={days}
            meta={meta}
            state={state}
            dispatch={dispatch}
            isCapturing={isCapturing}
            hoveredDay={hoveredDay}
            setHoveredDay={setHoveredDay}
            draggedLayerId={draggedLayerId}
            handleCellMouseDown={handleCellMouseDown}
            handleCellMouseEnter={handleCellMouseEnter}
            formatDate={formatDate}
            feelingMode={feelingMode}
            preview={preview}
            showPaintedInOrangeOverride={showPaintedInOrangeOverride}
            activeYearOverride={preview ? highestYear : undefined}
            template={template}
          />
        ))}
      </div>

      {!preview && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
          <button
            onClick={handleAddYear}
            className="no-print"
            data-html2canvas-ignore="true"
            style={{
              padding: "8px 16px",
              fontSize: "0.85rem",
              fontWeight: "600",
              color: "#a855f7",
              background: "rgba(168, 85, 247, 0.08)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              borderRadius: "20px",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(168, 85, 247, 0.1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(168, 85, 247, 0.15)";
              e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.6)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(168, 85, 247, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(168, 85, 247, 0.08)";
              e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.3)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(168, 85, 247, 0.1)";
            }}
          >
            ➕ Add New Year
          </button>
        </div>
      )}

      <Tooltip id="activity-tooltip" opacity={1} style={{ zIndex: 1000, fontSize: "14px", padding: "6px 10px", borderRadius: "6px" }} />
    </>
  );
});

ActivityGraph.displayName = "ActivityGraph";
