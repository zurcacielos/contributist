import React from "react";

interface Day {
  date: string;
  count: number;
  level: number;
  isPainted: boolean;
  layerId?: string;
}

interface ContributionGridProps {
  days: Day[];
  year: number;
  isActive: boolean;
  activeTool: string | null;
  draggedLayerId: string | null;
  showPaintedInOrange?: boolean;
  dispatch: React.Dispatch<any>;
  handleCellMouseDown: (dateStr: string, wIdx: number, dIdx: number, layerId?: string) => void;
  handleCellMouseEnter: (dateStr: string, wIdx: number, dIdx: number) => void;
  setHoveredDay: (val: { date: string; count: number } | null) => void;
  preview?: boolean;
  isFlatGit?: boolean;
}

export const ContributionGrid: React.FC<ContributionGridProps> = ({
  days,
  year,
  isActive,
  activeTool,
  draggedLayerId,
  showPaintedInOrange,
  dispatch,
  handleCellMouseDown,
  handleCellMouseEnter,
  setHoveredDay,
  preview,
  isFlatGit
}) => {
  return (
    <div
      className="contrib-grid big"
      aria-label={`${year} contribution graph`}
      style={{ gridTemplateColumns: `repeat(${Math.ceil(days.length / 7)}, minmax(0, 1fr))` }}
    >
      <div className="days">
        {isFlatGit ? (
          <>
            <span style={{ gridRow: 2 }}>M</span>
            <span style={{ gridRow: 4 }}>W</span>
            <span style={{ gridRow: 6 }}>F</span>
          </>
        ) : (
          <>
            <span style={{ gridRow: 2 }}>Mon</span>
            <span style={{ gridRow: 4 }}>Wed</span>
            {isActive && <span style={{ gridRow: 6 }}>Fri</span>}
          </>
        )}
      </div>
      {days.map((day, i) => {
        const wIdx = Math.floor(i / 7);
        const dIdx = i % 7;

        let spanClass = "";
        if (day.level === 1) spanClass = "v1";
        else if (day.level === 2) spanClass = "v2";
        else if (day.level === 3) spanClass = "v3";
        else if (day.level >= 4) spanClass = "v4";

        return (
          <span
            key={i}
            className={`day ${spanClass}`}
            data-level={day.level >= 0 ? day.level : undefined}
            data-synth={showPaintedInOrange && day.isPainted && (day.level > 0 || !preview) ? "true" : undefined}
            style={{
              visibility: day.level === -1 ? "hidden" : "visible",
              cursor: preview ? "default" : (activeTool ? "crosshair" : (draggedLayerId ? "grabbing" : (day.layerId ? "grab" : "default"))),
              ...(i === 0 ? { gridColumnStart: 1, gridRowStart: 1 } : {})
            }}
            onMouseDown={(e) => {
              if (preview) return;
              dispatch({ type: 'SET_ACTIVE_YEAR', payload: year });
              if (day.level !== -1) {
                handleCellMouseDown(day.date, wIdx, dIdx, day.layerId);
                e.preventDefault();
              }
            }}
            onMouseEnter={() => {
              if (preview) return;
              if (day.level !== -1) {
                handleCellMouseEnter(day.date, wIdx, dIdx);
                setHoveredDay({ date: day.date, count: day.count });
              }
            }}
            onMouseLeave={() => {
              if (preview) return;
              if (day.level !== -1) {
                setHoveredDay(null);
              }
            }}
          ></span>
        );
      })}
    </div>
  );
};
