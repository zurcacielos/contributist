import React, { useRef } from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('Calendar');
  const gridRef = useRef<HTMLDivElement>(null);
  const lastHoveredIdxRef = useRef<number | null>(null);
  const columnsCount = Math.ceil(days.length / 7);

  const getCellFromCoords = (clientX: number, clientY: number, target: EventTarget) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();

    // Fallback for JSDOM/testing environments where getBoundingClientRect returns 0 width/height
    if (rect.width === 0 || rect.height === 0) {
      const cell = (target as HTMLElement).closest(".day") as HTMLElement | null;
      if (cell) {
        const idx = Number(cell.dataset.index);
        const day = days[idx];
        if (day && day.level !== -1) {
          return { idx, day, col: Math.floor(idx / 7), row: idx % 7 };
        }
      }
      return null;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const col = Math.floor((x / rect.width) * columnsCount);
    const row = Math.floor((y / rect.height) * 7);

    if (col >= 0 && col < columnsCount && row >= 0 && row < 7) {
      const idx = col * 7 + row;
      if (idx >= 0 && idx < days.length) {
        return { idx, day: days[idx], col, row };
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (preview) return;
    dispatch({ type: "SET_ACTIVE_YEAR", payload: year });
    const cellInfo = getCellFromCoords(e.clientX, e.clientY, e.target);
    if (cellInfo && cellInfo.day.level !== -1) {
      handleCellMouseDown(cellInfo.day.date, cellInfo.col, cellInfo.row, cellInfo.day.layerId);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (preview) return;
    const cellInfo = getCellFromCoords(e.clientX, e.clientY, e.target);

    if (cellInfo) {
      const { idx, day, col, row } = cellInfo;
      if (day.level !== -1) {
        if (lastHoveredIdxRef.current !== idx) {
          lastHoveredIdxRef.current = idx;
          handleCellMouseEnter(day.date, col, row);
          setHoveredDay({ date: day.date, count: day.count });
        }
        return;
      }
    }

    if (lastHoveredIdxRef.current !== null) {
      lastHoveredIdxRef.current = null;
      setHoveredDay(null);
    }
  };

  const handleMouseLeave = () => {
    if (preview) return;
    lastHoveredIdxRef.current = null;
    setHoveredDay(null);
  };

  return (
    <div
      ref={gridRef}
      className="contrib-grid big"
      aria-label={`${year} contribution graph`}
      style={{ gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="days">
        {isFlatGit ? (
          <>
            <span style={{ gridRow: 2 }}>{t('m')}</span>
            <span style={{ gridRow: 4 }}>{t('w')}</span>
            <span style={{ gridRow: 6 }}>{t('f')}</span>
          </>
        ) : (
          <>
            <span style={{ gridRow: 2 }}>{t('mon')}</span>
            <span style={{ gridRow: 4 }}>{t('wed')}</span>
            <span style={{ gridRow: 6 }}>{t('fri')}</span>
          </>
        )}
      </div>
      {days.map((day, i) => {
        let spanClass = "";
        if (day.level === 1) spanClass = "v1";
        else if (day.level === 2) spanClass = "v2";
        else if (day.level === 3) spanClass = "v3";
        else if (day.level >= 4) spanClass = "v4";

        return (
          <span
            key={i}
            className={`day ${spanClass}`}
            data-index={i}
            data-level={day.level >= 0 ? day.level : undefined}
            data-synth={showPaintedInOrange && day.isPainted && (day.level > 0 || !preview) ? "true" : undefined}
            style={{
              visibility: day.level === -1 ? "hidden" : "visible",
              cursor: preview
                ? "default"
                : activeTool
                ? "crosshair"
                : draggedLayerId
                ? "grabbing"
                : day.layerId
                ? "grab"
                : "default",
              ...(i === 0 ? { gridColumnStart: 1, gridRowStart: 1 } : {})
            }}
          ></span>
        );
      })}
    </div>
  );
};
