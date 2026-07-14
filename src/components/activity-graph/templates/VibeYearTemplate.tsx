import React from "react";
import { AppState, AppAction } from "@/state/appReducer";
import { FeelingMode } from "@/types";
import { ContributionGrid } from "../ContributionGrid";
import { memeTemplates } from "@/utils/memeTemplates";
import { MemeSprite } from "@/components/MemeSprite";
import { Move, Pencil, Eraser } from 'lucide-react';
import { getDistinctiveColors } from "@/utils/paletteHelper";
import { findAutoPosition } from "@/utils/positionHelper";
import { useTranslations } from "next-intl";

interface Day {
  date: string;
  count: number;
  level: number;
  isPainted: boolean;
  layerId?: string;
}

interface VibeYearTemplateProps {
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
  isActive: boolean;
}

export const VibeYearTemplate: React.FC<VibeYearTemplateProps> = ({
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
  isActive
}) => {
  const t = useTranslations('Calendar');
  const [isHovered, setIsHovered] = React.useState(false);
  const bgLayerForYear = (state.config.layers || []).find(l => l.type === 'background' && l.year === year) as any;
  const totalContributions = days.reduce((acc, d) => acc + d.count, 0);
  const hoveredYear = hoveredDay ? parseInt(hoveredDay.date.split("-")[0], 10) : null;
  const showPaintedInOrange = showPaintedInOrangeOverride !== undefined ? showPaintedInOrangeOverride : state.config.showPaintedInOrange;
  const isHoveredInThisYear = hoveredYear === year;
  const memeColors = getDistinctiveColors(Object.keys(memeTemplates).length, showPaintedInOrange);

  const applyMemeTemplate = (templateName: string) => {
    const template = memeTemplates[templateName];
    if (!template) return;

    const { x: autoX, y: autoY } = findAutoPosition(state.config.layers || [], year, templateName, state.config);

    const newLayerId = `meme-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newMemeLayer = {
      id: newLayerId,
      name: templateName,
      type: "meme" as const,
      visible: true,
      templateName,
      x: autoX,
      y: autoY,
      year: year
    };

    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...state.config,
        layers: [...(state.config.layers || []), newMemeLayer],
        activeLayerId: newLayerId
      }
    });

    dispatch({
      type: "SET_ACTIVE_TOOL",
      payload: "move"
    });
  };

  const handleAddTextLayer = () => {
    dispatch({ type: "SET_ACTIVE_YEAR", payload: year });

    const randomTexts = [
      "let him cook",
      "glow up",
      "no cap",
      "sheesh",
      "rizz",
      "gigachad",
      "main character",
      "leveled up",
      "bro is cooking",
      "unlocked",
      "peak performance"
    ];
    const randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)];

    const newId = `text-${Date.now()}`;
    dispatch({
      type: "ADD_TEXT_LAYER",
      payload: {
        id: newId,
        text: randomText,
        fontName: "Standard 7-Row",
        level: state.selectedLevel
      }
    });
  };

  const handleSelectTool = (t: "move" | "pen" | "eraser") => {
    if (t === "pen" || t === "eraser") {
      const activeRaster = state.config.layers?.find(
        (l) => l.type === "raster" && l.year === year
      );
      if (activeRaster) {
        dispatch({ type: "SET_ACTIVE_LAYER", payload: activeRaster.id });
      }
    }
    dispatch({ type: "SET_ACTIVE_TOOL", payload: t });
  };

  return (
    <article
      className={`year-card vibe-template-card ${preview ? 'preview-card' : (isActive ? 'active-year' : 'small-year')}`}
      onClick={() => {
        if (!preview) {
          dispatch({ type: 'SET_ACTIVE_YEAR', payload: year });
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: preview ? "default" : "pointer",
        border: feelingMode === "advanced" ? "none" : undefined
      }}
    >
      <div className="year-meta" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Left: Year title */}
        <div style={{ flex: isActive ? "1 1 0%" : "0 0 auto", minWidth: isActive ? 0 : "auto", display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <h2 style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', gap: '7px' }}>
            {year}
          </h2>
        </div>

        {/* Center: Both toolbars centered */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flex: isActive ? "0 0 auto" : "1 1 0%" }}>
          {!isActive && isHovered && (
            <span style={{ color: "var(--greenbash-selected, #39d353)", fontSize: "13px", fontStyle: "italic", whiteSpace: "nowrap" }}>
              {t('clickSelect')}
            </span>
          )}
          {isActive && !preview && !isCapturing && (
            <div 
              className="no-print"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              {[
                { id: "move" as const, icon: Move },
                { id: "pen" as const, icon: Pencil },
                { id: "eraser" as const, icon: Eraser }
              ].map(({ id: toolId, icon: Icon }) => {
                const isSelected = state.activeTool === toolId;
                const toolTitle = toolId === 'move' ? t('toolMove') : (toolId === 'pen' ? t('toolDraw') : t('toolErase'));
                return (
                  <button
                    key={toolId}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTool(toolId);
                    }}
                    title={toolTitle}
                    style={{
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      border: isSelected ? "1px solid rgba(168, 85, 247, 0.6)" : "1px solid rgba(255, 255, 255, 0.08)",
                      backgroundColor: isSelected ? "rgba(168, 85, 247, 0.25)" : "rgba(255, 255, 255, 0.05)",
                      color: isSelected ? "#fff" : "rgba(255, 255, 255, 0.5)",
                      cursor: "pointer",
                      transition: "all 0.15s ease-in-out"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                        e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                      }
                    }}
                  >
                    <Icon size={20} strokeWidth={1.5} />
                  </button>
                );
              })}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTextLayer();
                }}
                style={{
                  width: "36px",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  transition: "all 0.15s ease-in-out"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                }}
                title={t('toolText')}
              >
                T
              </button>
            </div>
          )}

          {isActive && !preview && !isCapturing && (
            <div
              className="no-print"
              data-html2canvas-ignore="true"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(20, 10, 30, 0.5)",
                backdropFilter: "blur(12px) saturate(180%)",
                WebkitBackdropFilter: "blur(12px) saturate(180%)",
                border: "1px solid rgba(168, 85, 247, 0.25)",
                borderRadius: "12px",
                padding: "4px 8px",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)"
              }}
            >
              {Object.keys(memeTemplates).map((name, index) => (
                <button
                  key={name}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    applyMemeTemplate(name);
                  }}
                  style={{
                    padding: "4px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.15s ease-in-out",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.2)";
                    e.currentTarget.style.backgroundColor = "rgba(168, 85, 247, 0.25)";
                    e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.6)";
                    e.currentTarget.style.boxShadow = "0 0 8px rgba(168, 85, 247, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  title={t('toolAddMeme', { name })}
                >
                  <MemeSprite templateName={name} pixelSize={2} pixelColor={memeColors[index]} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Stats and Freq Controls */}
        <div style={{ flex: isActive ? "1 1 0%" : "0 0 auto", minWidth: isActive ? 0 : "auto", display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <div className="year-meta-desc" style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
            {!isActive && t('commitsCount', { count: totalContributions })}

            {/* Meta and Frequency Controls */}
            {(() => {
              if (isCapturing || preview) return null;
              if (!meta) return null;
              const vacAmt = meta.vacationLengths.length;
              const vacText = vacAmt > 0 && !isActive ? ` ${t('vacationsCount', { count: vacAmt })}` : "";
              return (
                <span
                  className="year-meta-controls"
                  id={`year-meta-controls-${year}`}
                  style={{ marginLeft: "10px", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#c8cdef", textTransform: "none" }}
                >
                  {t('freqLabel', { percentage: meta.freq })}
                  {isActive && bgLayerForYear && !bgLayerForYear.cleared && (
                    <div style={{ display: "inline-flex", gap: "4px" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const f = bgLayerForYear.customFrequency ?? bgLayerForYear.baseFrequency ?? 0;
                          dispatch({
                            type: 'SET_CONFIG',
                            payload: {
                              ...state.config,
                              layers: (state.config.layers || []).map(l => l.id === bgLayerForYear.id ? { ...l, customFrequency: Math.max(0, f - 5), cleared: false } : l)
                            }
                          });
                        }}
                        style={{
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "4px",
                          color: "#fff",
                          cursor: "pointer",
                          width: "22px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "bold",
                          lineHeight: 1,
                          transition: "all 0.15s ease-in-out"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.18)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                        }}
                        title="-5%"
                      >
                        -
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const f = bgLayerForYear.customFrequency ?? bgLayerForYear.baseFrequency ?? 0;
                          dispatch({
                            type: 'SET_CONFIG',
                            payload: {
                              ...state.config,
                              layers: (state.config.layers || []).map(l => l.id === bgLayerForYear.id ? { ...l, customFrequency: Math.max(0, f + 5), cleared: false } : l)
                            }
                          });
                        }}
                        style={{
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          borderRadius: "4px",
                          color: "#fff",
                          cursor: "pointer",
                          width: "22px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "bold",
                          lineHeight: 1,
                          transition: "all 0.15s ease-in-out"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.18)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                        }}
                        title="+5%"
                      >
                        +
                      </button>
                    </div>
                  )}
                  {vacText}
                </span>
              );
            })()}
          </div>
        </div>
      </div>
      <div className="graph-scroll-container">
        <div className="months">
          <span>{t('jan')}</span><span>{t('feb')}</span><span>{t('mar')}</span><span>{t('apr')}</span><span>{t('may')}</span><span>{t('jun')}</span><span>{t('jul')}</span><span>{t('aug')}</span><span>{t('sep')}</span><span>{t('oct')}</span><span>{t('nov')}</span><span>{t('dec')}</span>
        </div>
        <div
          className={`graph-wrap ${isActive && feelingMode !== "advanced" ? '' : 'short'}`}
          style={isActive && feelingMode !== "advanced" ? { minHeight: "170px" } : {}}
        >
          <ContributionGrid
            days={days}
            year={year}
            isActive={isActive}
            activeTool={state.activeTool}
            draggedLayerId={draggedLayerId}
            showPaintedInOrange={showPaintedInOrangeOverride !== undefined ? showPaintedInOrangeOverride : state.config.showPaintedInOrange}
            dispatch={dispatch}
            handleCellMouseDown={handleCellMouseDown}
            handleCellMouseEnter={handleCellMouseEnter}
            setHoveredDay={setHoveredDay}
            preview={preview}
          />
          <div style={{
            paddingLeft: "0px",
            marginTop: "10px",
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            textAlign: "left",
            minHeight: "1.2rem",
            lineHeight: "1.2rem",
            position: "relative",
            zIndex: 5
          }}>
            {!isCapturing && isHoveredInThisYear && hoveredDay ? (
              hoveredDay.count > 0 
                ? t('commitsOnDate', { count: hoveredDay.count, date: formatDate(hoveredDay.date) })
                : t('noCommitsOnDate', { date: formatDate(hoveredDay.date) })
            ) : (
              "\u00A0"
            )}
          </div>
          {isActive && feelingMode !== "advanced" && (
            <>
              <img
                src="/images/mountains-violet-web.png"
                className="vibe-overlay"
                alt="Neon Synthwave Grid and Mountains"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: "auto 0 0 0",
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  pointerEvents: "none",
                  zIndex: 3
                }}
              />
              <img
                src="/images/nyam-fox-web.png"
                className="runner"
                alt="Nyam Fox Runner"
                aria-hidden="true"
                style={{
                  height: "35%",
                  width: "auto"
                }}
              />
            </>
          )}


        </div>
      </div>
    </article>
  );
};
