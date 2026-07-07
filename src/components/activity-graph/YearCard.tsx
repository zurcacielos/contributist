import React from "react";
import { AppState, AppAction } from "@/state/appReducer";
import { FeelingMode } from "@/types";
import { SimpleGitYearTemplate } from "./templates/SimpleGitYearTemplate";
import { FlatGitYearTemplate } from "./templates/FlatGitYearTemplate";
import { VibeYearTemplate } from "./templates/VibeYearTemplate";

interface Day {
  date: string;
  count: number;
  level: number;
  isPainted: boolean;
  layerId?: string;
}

interface YearCardProps {
  year: number;
  days: Day[];
  meta: any;
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isCapturing: boolean;
  hoveredDay: { date: string; count: number } | null;
  setHoveredDay: (val: { date: string; count: number } | null) => void;
  draggedLayerId: string | null;
  handleCellMouseDown: (dateStr: string, wIdx: number, dIdx: number, layerId?: string) => void;
  handleCellMouseEnter: (dateStr: string, wIdx: number, dIdx: number) => void;
  formatDate: (dateStr: string) => string;
  feelingMode?: FeelingMode;
  preview?: boolean;
  showPaintedInOrangeOverride?: boolean;
  activeYearOverride?: number;
  template?: "vibe" | "simplegit" | "flatgit";
}

export const YearCard: React.FC<YearCardProps> = ({
  year,
  days,
  meta,
  state,
  dispatch,
  isCapturing,
  hoveredDay,
  setHoveredDay,
  draggedLayerId,
  handleCellMouseDown,
  handleCellMouseEnter,
  formatDate,
  feelingMode,
  preview,
  showPaintedInOrangeOverride,
  activeYearOverride,
  template = "vibe"
}) => {
  const isActive = preview && activeYearOverride !== undefined
    ? activeYearOverride === year
    : state.activeYear === year;

  if (template === "simplegit") {
    return (
      <SimpleGitYearTemplate
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
        preview={preview}
        showPaintedInOrangeOverride={showPaintedInOrangeOverride}
      />
    );
  }

  if (template === "flatgit") {
    return (
      <FlatGitYearTemplate
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
        preview={preview}
        showPaintedInOrangeOverride={showPaintedInOrangeOverride}
      />
    );
  }

  return (
    <VibeYearTemplate
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
      isActive={isActive}
    />
  );
};
