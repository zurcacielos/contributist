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

interface FlatGitYearTemplateProps {
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

export const FlatGitYearTemplate: React.FC<FlatGitYearTemplateProps> = ({
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

  return (
    <div className="flatgit-template-outer" style={{ marginBottom: "16px", cursor: "default" }}>
      {/* GitLab Outer Title Bar */}
      <div 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "8px", 
          fontSize: "15px", 
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        }}
      >
        <span style={{ color: "#ffffff", fontWeight: "600" }}>{t('activityInYear', { year })}</span>
        <span style={{ color: "#58a6ff", fontSize: "13px" }}>{t('viewAll')}</span>
      </div>

      {/* Flat Git dark mode card (Single card container) */}
      <article
        className="year-card flatgit-template-card"
        id={`flatgit-template-card-${year}`}
        style={{
          background: "#000000", // GitLab dark theme card background is black
          border: "1px solid #2e2e2e",
          borderRadius: "4px",
          padding: "16px 20px",
          color: "#dbdbdb",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          position: "relative"
        }}
      >
        <div className="graph-scroll-container">
          {/* Months labels */}
          <div 
            className="months" 
            style={{ 
              marginLeft: "0px", 
              marginBottom: "8px", 
              color: "#8c8c8c", 
              fontSize: "10px", 
              display: "grid", 
              gridTemplateColumns: "repeat(12, 1fr)" 
            }}
          >
            <span>{t('jan')}</span><span>{t('feb')}</span><span>{t('mar')}</span><span>{t('apr')}</span><span>{t('may')}</span><span>{t('jun')}</span><span>{t('jul')}</span><span>{t('aug')}</span><span>{t('sep')}</span><span>{t('oct')}</span><span>{t('nov')}</span><span>{t('dec')}</span>
          </div>

          <div className="flatgit-template-grid-inner" id={`flatgit-template-grid-inner-${year}`}>
            <ContributionGrid
              days={days}
              year={year}
              isActive={false} // Flat Git template is flat, no active-year neon animations
              activeTool={state.activeTool}
              draggedLayerId={draggedLayerId}
              showPaintedInOrange={showPaintedInOrangeOverride !== undefined ? showPaintedInOrangeOverride : state.config.showPaintedInOrange}
              dispatch={dispatch}
              handleCellMouseDown={handleCellMouseDown}
              handleCellMouseEnter={handleCellMouseEnter}
              setHoveredDay={setHoveredDay}
              preview={preview}
              isFlatGit={true} // Triggers GitLab "M", "W", "F" labels
              config={state.config}
            />
          </div>
        </div>

        {/* GitLab Timeline Slider Mimic */}
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            width: "100%", 
            gap: "8px", 
            margin: "12px 0 14px 0", 
            color: "#8c8c8c", 
            fontSize: "12px",
            userSelect: "none"
          }}
        >
          <span style={{ fontSize: "10px" }}>◀</span>
          <div style={{ flex: 1, height: "6px", backgroundColor: "#222222", borderRadius: "3px", position: "relative" }}>
            <div 
              style={{ 
                position: "absolute", 
                left: "20%", 
                width: "60%", 
                height: "100%", 
                backgroundColor: "#444444", 
                borderRadius: "3px" 
              }} 
            />
          </div>
          <span style={{ fontSize: "10px" }}>▶</span>
        </div>

        {/* Flat Git Footer */}
        <div 
          className="flatgit-template-footer" 
          id={`flatgit-template-footer-${year}`} 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            fontSize: "12px", 
            color: "#8c8c8c" 
          }}
        >
          {/* Legend Swatches on Left */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span className="day" data-level={0} style={{ width: "10px", height: "10px", display: "inline-block", borderRadius: "0px", pointerEvents: "none" }} />
            <span className="day" data-level={1} style={{ width: "10px", height: "10px", display: "inline-block", borderRadius: "0px", pointerEvents: "none" }} />
            <span className="day" data-level={2} style={{ width: "10px", height: "10px", display: "inline-block", borderRadius: "0px", pointerEvents: "none" }} />
            <span className="day" data-level={3} style={{ width: "10px", height: "10px", display: "inline-block", borderRadius: "0px", pointerEvents: "none" }} />
            <span className="day" data-level={4} style={{ width: "10px", height: "10px", display: "inline-block", borderRadius: "0px", pointerEvents: "none" }} />
          </div>
          {/* GitLab Legend Text on Right */}
          <span>
            {t('gitLabLegend')}
          </span>
        </div>

        {/* Hover Info Tooltip Info */}
        <div 
          className="flatgit-template-hover-tooltip" 
          id={`flatgit-template-hover-tooltip-${year}`}
          style={{
            paddingLeft: "0px",
            marginTop: "10px",
            fontSize: "0.85rem",
            color: "#8c8c8c",
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
    </div>
  );
};
