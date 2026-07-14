import React from "react";
import { AppState, AppAction } from "@/state/appReducer";
import { ContributionGrid } from "../ContributionGrid";
import { useTranslations } from "next-intl";

interface Day {
  date: string;
  count: number;
  level: number;
  isPainted: boolean;
  layerId?: string;
}

interface SimpleGitYearTemplateProps {
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
  preview?: boolean;
  showPaintedInOrangeOverride?: boolean;
}

export const SimpleGitYearTemplate: React.FC<SimpleGitYearTemplateProps> = ({
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
  preview,
  showPaintedInOrangeOverride
}) => {
  const t = useTranslations('Calendar');
  const totalContributions = days.reduce((acc, d) => acc + d.count, 0);
  const hoveredYear = hoveredDay ? parseInt(hoveredDay.date.split("-")[0], 10) : null;
  const isHoveredInThisYear = hoveredYear === year;

  // Render style: Simple Git dark mode card
  return (
    <article
      className="year-card simplegit-template-card"
      id={`simplegit-template-card-${year}`}
      style={{
        background: "#0d1117",
        border: "1px solid #30363d",
        borderRadius: "6px",
        padding: "16px",
        marginBottom: "16px",
        color: "#c9d1d9",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
        position: "relative",
        cursor: "default"
      }}
    >
      {/* Simple Git Header */}
      <div 
        className="simplegit-template-header" 
        id={`simplegit-template-header-${year}`} 
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "14px" }}
      >
        <span style={{ color: "#f0f6fc", fontWeight: "normal" }}>
          {t('totalContributionsInYear', { count: totalContributions, year })}
        </span>
        <span style={{ color: "#8b949e", fontSize: "12px" }}>
          {t('contribSettings')}
        </span>
      </div>

      <div 
        className="simplegit-template-grid-wrapper" 
        id={`simplegit-template-grid-wrapper-${year}`}
        style={{
          border: "1px solid #30363d",
          borderRadius: "6px",
          padding: "16px 20px",
          background: "#0d1117"
        }}
      >
        <div className="graph-scroll-container">
          {/* Months labels */}
          <div 
            className="months" 
            style={{ 
              marginLeft: "0px", 
              marginBottom: "8px", 
              color: "#8b949e", 
              fontSize: "10px", 
              display: "grid", 
              gridTemplateColumns: "repeat(12, 1fr)" 
            }}
          >
            <span>{t('jan')}</span><span>{t('feb')}</span><span>{t('mar')}</span><span>{t('apr')}</span><span>{t('may')}</span><span>{t('jun')}</span><span>{t('jul')}</span><span>{t('aug')}</span><span>{t('sep')}</span><span>{t('oct')}</span><span>{t('nov')}</span><span>{t('dec')}</span>
          </div>

          <div className="simplegit-template-grid-inner" id={`simplegit-template-grid-inner-${year}`}>
            <ContributionGrid
              days={days}
              year={year}
              isActive={false} // Simple Git template is flat, no active-year neon animations
              activeTool={state.activeTool}
              draggedLayerId={draggedLayerId}
              showPaintedInOrange={showPaintedInOrangeOverride !== undefined ? showPaintedInOrangeOverride : state.config.showPaintedInOrange}
              dispatch={dispatch}
              handleCellMouseDown={handleCellMouseDown}
              handleCellMouseEnter={handleCellMouseEnter}
              setHoveredDay={setHoveredDay}
              preview={preview}
              config={state.config}
            />
          </div>
        </div>

        {/* Simple Git Footer */}
        <div 
          className="simplegit-template-footer" 
          id={`simplegit-template-footer-${year}`} 
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", fontSize: "12px", color: "#8b949e" }}
        >
          <span style={{ color: "#8b949e" }}>
            {t('learnCount')}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span>{t('less')}</span>
            <span className="day" data-level={0} style={{ width: "10px", height: "10px", display: "inline-block", borderRadius: "2px", pointerEvents: "none" }} />
            <span className="day" data-level={1} style={{ width: "10px", height: "10px", display: "inline-block", borderRadius: "2px", pointerEvents: "none" }} />
            <span className="day" data-level={2} style={{ width: "10px", height: "10px", display: "inline-block", borderRadius: "2px", pointerEvents: "none" }} />
            <span className="day" data-level={3} style={{ width: "10px", height: "10px", display: "inline-block", borderRadius: "2px", pointerEvents: "none" }} />
            <span className="day" data-level={4} style={{ width: "10px", height: "10px", display: "inline-block", borderRadius: "2px", pointerEvents: "none" }} />
            <span>{t('more')}</span>
          </div>
        </div>
      </div>

      {/* Hover Info Tooltip Info */}
      <div 
        className="simplegit-template-hover-tooltip" 
        id={`simplegit-template-hover-tooltip-${year}`}
        style={{
          paddingLeft: "0px",
          marginTop: "10px",
          fontSize: "0.85rem",
          color: "#8b949e",
          textAlign: "left",
          minHeight: "1.2rem",
          lineHeight: "1.2rem",
          position: "relative"
        }}
      >
        {!isCapturing && isHoveredInThisYear && hoveredDay ? (
          hoveredDay.count > 0 
            ? t('commitsOnDate', { count: hoveredDay.count, date: formatDate(hoveredDay.date) })
            : t('noCommitsOnDate', { date: formatDate(hoveredDay.date) })
        ) : (
          "\u00A0"
        )}
      </div>
    </article>
  );
};
