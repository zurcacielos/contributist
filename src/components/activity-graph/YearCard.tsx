import React from "react";
import { AppState, AppAction } from "@/state/appReducer";
import { FeelingMode } from "@/types";
import { SimpleGitYearTemplate } from "./templates/SimpleGitYearTemplate";
import { FlatGitYearTemplate } from "./templates/FlatGitYearTemplate";
import { VibeYearTemplate } from "./templates/VibeYearTemplate";
import * as ContextMenu from "@radix-ui/react-context-menu";
import { useTranslations } from "next-intl";

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

  const config = state.config;
  const bgLayer = (config.layers || []).find(l => l.type === 'background' && l.year === year);
  const isBgActive = bgLayer ? !bgLayer.cleared : false;

  const handleMakeGreener = () => {
    let nextFrequencies = config.frequencies;
    if (!nextFrequencies || nextFrequencies === "0" || nextFrequencies.split(",").every(v => parseFloat(v.trim()) === 0)) {
      nextFrequencies = "30,50,45,35,53";
    }

    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'background' && l.year === year) {
        return {
          ...l,
          cleared: false,
          customFrequency: undefined
        };
      }
      return l;
    });

    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        frequencies: nextFrequencies,
        layers: nextLayers
      }
    });
  };

  const handleClearGreener = () => {
    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'background' && l.year === year) {
        return {
          ...l,
          cleared: true,
          customFrequency: undefined
        };
      }
      return l;
    });

    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        layers: nextLayers
      }
    });
  };

  const handleMakeAllGreener = () => {
    let nextFrequencies = config.frequencies;
    if (!nextFrequencies || nextFrequencies === "0" || nextFrequencies.split(",").every(v => parseFloat(v.trim()) === 0)) {
      nextFrequencies = "30,50,45,35,53";
    }

    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'background') {
        return {
          ...l,
          cleared: false,
          customFrequency: undefined
        };
      }
      return l;
    });

    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        frequencies: nextFrequencies,
        layers: nextLayers
      }
    });
  };

  const handleClearAllGreener = () => {
    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'background') {
        return {
          ...l,
          cleared: true,
          customFrequency: undefined
        };
      }
      return l;
    });

    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        layers: nextLayers
      }
    });
  };

  const handleClearRaster = () => {
    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'raster' && l.year === year) {
        return {
          ...l,
          data: {}
        };
      }
      return l;
    });

    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        layers: nextLayers
      }
    });
  };

  const handleClearAllRaster = () => {
    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'raster') {
        return {
          ...l,
          data: {}
        };
      }
      return l;
    });

    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        layers: nextLayers
      }
    });
  };

  const rasterLayer = (config.layers || []).find(l => l.type === 'raster' && l.year === year);
  const isRasterEmpty = rasterLayer ? Object.keys(rasterLayer.data || {}).length === 0 : true;

  const t = useTranslations('Calendar');
  const sectionLabel = t.has('greenBackgroundSection') ? t('greenBackgroundSection') : 'Green Background';
  const addSelectedLabel = t.has('addSelectedRightClick') ? t('addSelectedRightClick') : 'Add to Selected';
  const addAllLabel = t.has('addAllRightClick') ? t('addAllRightClick') : 'Add to All';
  const clearSelectedLabel = t.has('clearSelectedRightClick') ? t('clearSelectedRightClick') : 'Clear Selected';
  const clearAllLabel = t.has('clearAllRightClick') ? t('clearAllRightClick') : 'Clear All';
  const rasterSectionLabel = t.has('rasterLayerSection') ? t('rasterLayerSection') : 'Painted Layer (pen)';

  let cardContent: React.ReactNode;

  if (template === "simplegit") {
    cardContent = (
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
  } else if (template === "flatgit") {
    cardContent = (
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
  } else {
    cardContent = (
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
  }

  if (preview) {
    return cardContent;
  }

  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger asChild>
        <div style={{ display: 'contents' }}>
          {cardContent}
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="context-menu-content" onOpenAutoFocus={(e) => e.preventDefault()}>
          {/* Green Background Section */}
          <ContextMenu.Label 
            style={{ 
              fontSize: '11px', 
              color: 'var(--text-muted)', 
              fontWeight: 'bold', 
              padding: '6px 8px 4px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px' 
            }}
          >
            {sectionLabel}
          </ContextMenu.Label>

          <ContextMenu.Item className="context-menu-item" disabled={isBgActive} onSelect={handleMakeGreener}>
            {addSelectedLabel}
          </ContextMenu.Item>
          <ContextMenu.Item className="context-menu-item" onSelect={handleMakeAllGreener}>
            {addAllLabel}
          </ContextMenu.Item>
          
          <ContextMenu.Separator 
            style={{ height: '1px', backgroundColor: 'rgba(168, 85, 247, 0.15)', margin: '5px' }} 
          />

          <ContextMenu.Item className="context-menu-item" disabled={!isBgActive} onSelect={handleClearGreener}>
            {clearSelectedLabel}
          </ContextMenu.Item>
          <ContextMenu.Item className="context-menu-item" onSelect={handleClearAllGreener}>
            {clearAllLabel}
          </ContextMenu.Item>

          <ContextMenu.Separator 
            style={{ height: '1px', backgroundColor: 'rgba(168, 85, 247, 0.15)', margin: '5px' }} 
          />

          {/* Painted Layer (pen) Section */}
          <ContextMenu.Label 
            style={{ 
              fontSize: '11px', 
              color: 'var(--text-muted)', 
              fontWeight: 'bold', 
              padding: '6px 8px 4px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px' 
            }}
          >
            {rasterSectionLabel}
          </ContextMenu.Label>

          <ContextMenu.Item className="context-menu-item" disabled={isRasterEmpty} onSelect={handleClearRaster}>
            {clearSelectedLabel}
          </ContextMenu.Item>
          <ContextMenu.Item className="context-menu-item" onSelect={handleClearAllRaster}>
            {clearAllLabel}
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};
