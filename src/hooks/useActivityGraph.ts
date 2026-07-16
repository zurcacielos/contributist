import { useState, useEffect, useRef, useMemo } from "react";
import { AppState, AppAction } from "@/state/appReducer";
import { parseYear } from "@/types";
import { generateCommits } from "@/utils/gitGenerator";
import { compositeLayers } from "@/utils/layerCompositor";
import { exportAsPNG } from "@/utils/canvasExport";
import { useLocale } from "next-intl";

interface UseActivityGraphProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  onEditChange: (isEditing: boolean) => void;
}

export function useActivityGraph({ state, dispatch, onEditChange }: UseActivityGraphProps) {
  const locale = useLocale();
  const { config, activeTool, selectedLevel } = state;
  const [mounted, setMounted] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  // Paint state
  const [isDragging, setIsDragging] = useState(false);

  // Layer Drag & Drop state
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ wIdx: number; dIdx: number; startX: number; startY: number } | null>(null);

  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedLayerId(null);
      setDragStartPos(null);
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Auto-select the most recent visible background layer if no active layer is selected or the active one is invalid/hidden
  useEffect(() => {
    const currentActive = (config.layers || []).find(l => l.id === config.activeLayerId);
    const isActiveValid = currentActive && currentActive.visible;

    if (!isActiveValid) {
      const bgLayers = (config.layers || []).filter(l => l.type === 'background' && l.visible && !l.cleared);
      if (bgLayers.length) {
        const latest = bgLayers.reduce((a, b) => (b.year ?? 0) > (a.year ?? 0) ? b : a);
        if (config.activeLayerId !== latest.id) {
          dispatch({ type: 'SET_ACTIVE_LAYER', payload: latest.id });
        }
      }
    }
  }, [config.layers, config.activeLayerId]);

  const handleDownloadMockup = async () => {
    await exportAsPNG(captureRef.current, setIsCapturing);
  };

  const handlePaint = (dateStr: string) => {
    if (!activeTool) return;

    if (activeTool === "eraser") {
      dispatch({ type: 'ERASE_CELL', payload: { dateStr } });
    } else if (activeTool === "pen") {
      dispatch({ type: 'PAINT_CELL', payload: { dateStr } });
    }
  };

  const handleCellMouseDown = (dateStr: string, wIdx: number, dIdx: number, layerId?: string, isCopy?: boolean) => {
    if (activeTool === "pen" || activeTool === "eraser") {
      setIsDragging(true);
      handlePaint(dateStr);
      return;
    }

    if (layerId && activeTool === "move") {
      const currentLayers = config.layers || [];
      const layer = currentLayers.find(l => l.id === layerId);
      if (layer && layer.locked) return;

      let targetLayerId = layerId;
      if (layer && layer.type === 'meme' && isCopy) {
        const newLayerId = `meme-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        dispatch({
          type: "CLONE_LAYER",
          payload: { originalLayerId: layerId, newLayerId }
        });
        targetLayerId = newLayerId;
      } else {
        dispatch({ type: 'SET_ACTIVE_LAYER', payload: layerId });
      }

      if (layer && layer.type === 'meme') {
        setIsDragging(true);
        setDraggedLayerId(targetLayerId);
        setDragStartPos({ wIdx, dIdx, startX: layer.x, startY: layer.y });
      }
    }
  };

  const handleCellMouseEnter = (dateStr: string, wIdx: number, dIdx: number, targetYear?: number) => {
    if (isDragging && (activeTool === "pen" || activeTool === "eraser")) {
      handlePaint(dateStr);
    } else if (isDragging && draggedLayerId && dragStartPos && activeTool === "move") {
      const deltaX = wIdx - dragStartPos.wIdx;
      const rawDeltaY = dIdx - dragStartPos.dIdx;
      const maxY = 6; // grid rows 0-6
      const newY = Math.max(0, Math.min(dragStartPos.startY + rawDeltaY, maxY));
      dispatch({
        type: 'MOVE_LAYER',
        payload: {
          layerId: draggedLayerId,
          x: dragStartPos.startX + deltaX,
          y: newY,
          year: targetYear
        }
      });
    }
  };

  const generatedData = useMemo(() => {
    const yearsData: { year: number; days: { date: string; count: number; level: number; isPainted: boolean; layerId?: string }[]; meta?: any }[] = [];

    const startYear = parseYear(config.startDate);
    const endYear = parseYear(config.endDate);

    const start = Math.min(startYear, endYear);
    const end = Math.max(startYear, endYear);
    const sortedYears = Array.from({ length: end - start + 1 }, (_, i) => end - i);

    const outMeta: any[] = [];

    const backgroundOnlyConfig = {
      ...config,
      layers: (config.layers || []).filter(l => l.type === 'background')
    };
    const commits = generateCommits(backgroundOnlyConfig, outMeta);

    const commitCounts: Record<string, number> = {};
    commits.forEach(c => {
      const dStr = c.dateStr.split("T")[0];
      commitCounts[dStr] = (commitCounts[dStr] || 0) + 1;
    });

    const today = new Date();
    const currentLayers = (config.layers || []);

    sortedYears.forEach((year) => {
      const currentPaintedLayer = compositeLayers(currentLayers, year);
      const bgLayer = currentLayers.find(l => l.year === year && l.type === 'background') as import("@/types").BackgroundLayer | undefined;
      const hasBackgroundLayer = bgLayer && bgLayer.visible && !bgLayer.cleared;
      const yearDays: { date: string; count: number; level: number; isPainted: boolean; layerId?: string }[] = [];
      const startDate = new Date(Date.UTC(year, 0, 1));
      const endDate = new Date(Date.UTC(year, 11, 31));

      const daysToSubtract = startDate.getUTCDay();
      let current = new Date(startDate);
      current.setUTCDate(current.getUTCDate() - daysToSubtract);

      while (current <= endDate || current.getUTCDay() !== 0) {
        const dateStr = current.toISOString().split("T")[0];

        let algoCount = 0;
        let algoLevel = -1;

        if (current.getUTCFullYear() === year && current <= endDate) {
          algoCount = commitCounts[dateStr] || 0;
          if (algoCount === 0) algoLevel = 0;
          else if (algoCount === 1) algoLevel = 1;
          else if (algoCount <= 3) algoLevel = 2;
          else if (algoCount <= 5) algoLevel = 3;
          else algoLevel = 4;
        }

        let finalLevel = -1;
        let finalCount = 0;
        let isPainted = false;
        let layerId: string | undefined = undefined;

        if (current.getUTCFullYear() === year && current <= endDate) {
          const composite = currentPaintedLayer[dateStr];

          if (composite !== undefined) {
            const gitProfileLayer = currentLayers.find(l => l.year === year && l.type === 'git-profile') as any;
            const gitProfileActive = gitProfileLayer && gitProfileLayer.visible && !gitProfileLayer.cleared;
            const pLevel = gitProfileActive && gitProfileLayer.data ? (gitProfileLayer.data[dateStr] || 0) : 0;

            if (composite.level === 0 && pLevel > 0) {
              finalLevel = pLevel;
              if (pLevel === 1) finalCount = 1;
              else if (pLevel === 2) finalCount = 3;
              else if (pLevel === 3) finalCount = 6;
              else if (pLevel === 4) finalCount = 10;
              layerId = gitProfileLayer.id;
            } else {
              finalLevel = composite.level;
              layerId = composite.layerId;
              if (composite.level === 1) finalCount = 1;
              else if (composite.level === 2) finalCount = 3;
              else if (composite.level === 3) finalCount = 6;
              else if (composite.level === 4) finalCount = 10;
              else finalCount = 0;
            }
            isPainted = true;
          } else {
            const bgActive = bgLayer && bgLayer.visible && !bgLayer.cleared;
            const gitProfileLayer = currentLayers.find(l => l.year === year && l.type === 'git-profile') as any;
            const gitProfileActive = gitProfileLayer && gitProfileLayer.visible && !gitProfileLayer.cleared;
            const pLevel = gitProfileActive && gitProfileLayer.data ? (gitProfileLayer.data[dateStr] || 0) : 0;

            let pCommits = 0;
            if (pLevel === 1) pCommits = 1;
            else if (pLevel === 2) pCommits = 3;
            else if (pLevel === 3) pCommits = 6;
            else if (pLevel === 4) pCommits = 10;

            if (bgActive && algoLevel > 0) {
              const blendedLevel = Math.max(algoLevel, pLevel);
              const blendedCount = Math.max(algoCount, pCommits);
              
              finalLevel = blendedLevel;
              finalCount = blendedCount;
              layerId = (algoLevel >= pLevel) ? bgLayer.id : gitProfileLayer.id;
            } else if (pLevel > 0) {
              finalLevel = pLevel;
              finalCount = pCommits;
              layerId = gitProfileLayer.id;
            } else if (bgActive) {
              finalLevel = 0;
              finalCount = 0;
              layerId = bgLayer.id;
            } else {
              finalLevel = 0;
              finalCount = 0;
            }
          }
        }

        yearDays.push({ date: dateStr, count: finalCount, level: finalLevel, isPainted, layerId });
        current.setUTCDate(current.getUTCDate() + 1);
      }

      const meta = outMeta.find(m => m.year === year);
      yearsData.push({ year, days: yearDays, meta });
    });

    return yearsData;
  }, [config]);

  const formatDate = (dateStr: string) => {
    try {
      const [yearStr, monthStr, dayStr] = dateStr.split("-");
      const date = new Date(Date.UTC(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10)));
      return date.toLocaleDateString(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC"
      });
    } catch (e) {
      return dateStr;
    }
  };

  return {
    mounted,
    isCapturing,
    hoveredDay,
    setHoveredDay,
    isDragging,
    draggedLayerId,
    captureRef,
    generatedData,
    formatDate,
    handleDownloadMockup,
    handleCellMouseDown,
    handleCellMouseEnter
  };
}
