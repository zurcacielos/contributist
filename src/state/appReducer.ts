import { BackgroundLayer, GeneratorConfig, Layer, MemeLayer, RasterLayer, parseYear } from "../types";
import { generateTextTemplate } from "../utils/textEngine";
import { initializeAndMigrateConfig } from "../utils/configHelper";

export interface AppState {
  config: GeneratorConfig;
  activeTool: "move" | "pen" | "eraser" | "text" | null;
  selectedLevel: number;
  activeYear: number;
}

export type AppAction =
  | { type: "RESTORE_STATE"; payload: AppState }
  | { type: "RESET_TO_INITIAL"; payload: GeneratorConfig }
  | { type: "SET_ACTIVE_YEAR"; payload: number }
  | { type: "SET_CONFIG"; payload: GeneratorConfig }
  | { type: "MERGE_GIT_CONFIG"; payload: { name?: string; email?: string } }
  | { type: "DESELECT_ALL_LAYERS" }
  | { type: "DESELECT_ALL_YEARS" }
  | { type: "SET_ACTIVE_TOOL"; payload: "move" | "pen" | "eraser" | "text" | null }
  | { type: "SET_SELECTED_LEVEL"; payload: number }
  | { type: "SET_ACTIVE_LAYER"; payload: string }
  | { type: "TOGGLE_LAYER_VISIBILITY"; payload: string }
  | { type: "ADD_TEXT_LAYER"; payload: { id: string; text: string; fontName: string; level: number } }
  | { type: "UPDATE_TEXT_LAYER_NAME"; payload: { layerId: string; name: string } }
  | { type: "UPDATE_LAYER_COLOR"; payload: { level: number } }
  | { type: "MOVE_LAYER"; payload: { layerId: string; x: number; y: number } }
  | { type: "PAINT_CELL"; payload: { dateStr: string } }
  | { type: "ERASE_CELL"; payload: { dateStr: string } }
  | { type: "REORDER_LAYERS"; payload: { draggedId: string; dropId: string } }
  | { type: "START_FETCH_PROFILE"; payload: { username: string; platform: string } }
  | { type: "FETCH_PROFILE_SUCCESS"; payload: { contributions: Record<string, number>; platform: string; username: string } };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "RESTORE_STATE":
      return action.payload;
    case "RESET_TO_INITIAL": {
      const nextConfig = initializeAndMigrateConfig(action.payload, {});
      nextConfig.repoUrl = state.config.repoUrl;
      nextConfig.gitName = state.config.gitName;
      nextConfig.gitEmail = state.config.gitEmail;
      nextConfig.gitProfileOrURL_import = state.config.gitProfileOrURL_import;
      
      const startYear = parseYear(nextConfig.startDate);
      const endYear = parseYear(nextConfig.endDate);
      const minYear = Math.min(startYear, endYear);
      const maxYear = Math.max(startYear, endYear);

      let updatedLayers = [...(nextConfig.layers || [])];

      for (let y = minYear; y <= maxYear; y++) {
        if (!updatedLayers.some(l => l.type === 'background' && l.year === y)) {
          const gitProfileIdx = updatedLayers.findIndex(l => l.type === 'git-profile' && l.year === y);
          const newBg = { id: `bg-${y}`, name: `Background`, type: 'background', visible: true, year: y, cleared: true } as BackgroundLayer;
          if (gitProfileIdx !== -1) {
            updatedLayers.splice(gitProfileIdx + 1, 0, newBg);
          } else {
            updatedLayers.unshift(newBg);
          }
        }
        if (!updatedLayers.some(l => l.type === 'raster' && l.year === y)) {
          updatedLayers.push({ id: `raster-${y}`, name: `Painted`, type: 'raster', visible: true, year: y, data: {} } as RasterLayer);
        }
      }

      // Calculate baseFrequency for all background layers
      let freqs = nextConfig.frequencies ? nextConfig.frequencies.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n)) : [];
      if (freqs.length === 0) freqs = [50];
      
      updatedLayers = updatedLayers.map(l => {
        if (l.type === 'background') {
           const bgLayer = l as BackgroundLayer;
           const yIdx = maxYear - bgLayer.year;
           const baseFrequency = freqs[Math.max(0, yIdx) % freqs.length];
           return { ...bgLayer, baseFrequency };
        }
        return l;
      });

      return {
        config: {
          ...nextConfig,
          layers: updatedLayers,
          basedOnTemplate: undefined
        },
        activeTool: "pen",
        selectedLevel: 4,
        activeYear: new Date().getFullYear(),
      };
    }
    case "MERGE_GIT_CONFIG": {
      const gitData = action.payload;
      const nextConfig = initializeAndMigrateConfig(state.config, gitData);
      
      const startYear = parseYear(nextConfig.startDate);
      const endYear = parseYear(nextConfig.endDate);
      const minYear = Math.min(startYear, endYear);
      const maxYear = Math.max(startYear, endYear);

      let updatedLayers = [...(nextConfig.layers || [])];

      for (let y = minYear; y <= maxYear; y++) {
        if (!updatedLayers.some(l => l.type === 'background' && l.year === y)) {
          const gitProfileIdx = updatedLayers.findIndex(l => l.type === 'git-profile' && l.year === y);
          const newBg = { id: `bg-${y}`, name: `Background`, type: 'background', visible: true, year: y, cleared: true } as BackgroundLayer;
          if (gitProfileIdx !== -1) {
            updatedLayers.splice(gitProfileIdx + 1, 0, newBg);
          } else {
            updatedLayers.unshift(newBg);
          }
        }
        if (!updatedLayers.some(l => l.type === 'raster' && l.year === y)) {
          updatedLayers.push({ id: `raster-${y}`, name: `Painted`, type: 'raster', visible: true, year: y, data: {} } as RasterLayer);
        }
      }

      // Calculate baseFrequency for all background layers
      let freqs = nextConfig.frequencies ? nextConfig.frequencies.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n)) : [];
      if (freqs.length === 0) freqs = [50];
      
      updatedLayers = updatedLayers.map(l => {
        if (l.type === 'background') {
           const bgLayer = l as BackgroundLayer;
           const yIdx = maxYear - bgLayer.year;
           const baseFrequency = freqs[Math.max(0, yIdx) % freqs.length];
           return { ...bgLayer, baseFrequency };
        }
        return l;
      });

      return {
        ...state,
        config: {
          ...nextConfig,
          layers: updatedLayers
        }
      };
    }
    case "DESELECT_ALL_LAYERS":
      // Clear active layer selection; keep layers unchanged
      return { ...state, config: { ...state.config, activeLayerId: "" } };
    case "DESELECT_ALL_YEARS":
      // Deselect active year (set to 0 to indicate none)
      return { ...state, activeYear: 0 };
    case "SET_ACTIVE_YEAR":
      return { ...state, activeYear: action.payload };

    case "SET_CONFIG": {
      const config = action.payload;
      const startYear = parseYear(config.startDate);
      const endYear = parseYear(config.endDate);
      const minYear = Math.min(startYear, endYear);
      const maxYear = Math.max(startYear, endYear);

      let updatedLayers = [...(config.layers || [])].map(layer => {
        if (layer.type === "meme" && layer.templateName === "custom" && layer.textConfig) {
          const { text, fontName, intensity } = layer.textConfig;
          return {
            ...layer,
            templateData: generateTextTemplate(text, fontName, intensity)
          };
        }
        return layer;
      });

      for (let y = minYear; y <= maxYear; y++) {
        if (!updatedLayers.some(l => l.type === 'background' && l.year === y)) {
          const gitProfileIdx = updatedLayers.findIndex(l => l.type === 'git-profile' && l.year === y);
          const newBg = { id: `bg-${y}`, name: `Background`, type: 'background', visible: true, year: y, cleared: true } as BackgroundLayer;
          if (gitProfileIdx !== -1) {
            updatedLayers.splice(gitProfileIdx + 1, 0, newBg);
          } else {
            updatedLayers.unshift(newBg);
          }
        }
        if (!updatedLayers.some(l => l.type === 'raster' && l.year === y)) {
          updatedLayers.push({ id: `raster-${y}`, name: `Painted`, type: 'raster', visible: true, year: y, data: {} } as RasterLayer);
        }
      }

      // Calculate baseFrequency for all background layers
      let freqs = config.frequencies ? config.frequencies.split(",").map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n)) : [];
      if (freqs.length === 0) freqs = [50];
      
      updatedLayers = updatedLayers.map(l => {
        if (l.type === 'background') {
           const bgLayer = l as BackgroundLayer;
           const yIdx = maxYear - bgLayer.year;
           const baseFrequency = freqs[Math.max(0, yIdx) % freqs.length];
           return { ...bgLayer, baseFrequency };
        }
        return l;
      });

      return { ...state, config: { ...config, layers: updatedLayers } };
    }


    case "SET_ACTIVE_TOOL":
      return { ...state, activeTool: action.payload };

    case "SET_SELECTED_LEVEL":
      return { ...state, selectedLevel: action.payload };

    case "SET_ACTIVE_LAYER":
      return { ...state, config: { ...state.config, activeLayerId: action.payload } };

    case "TOGGLE_LAYER_VISIBILITY": {
      const clickedLayer = (state.config.layers || []).find(l => l.id === action.payload);
      if (!clickedLayer) return state;

      const isSpecial = clickedLayer.type === 'background' || clickedLayer.type === 'raster' || clickedLayer.type === 'git-profile';
      const targetValue = !clickedLayer.visible;

      const newLayers = (state.config.layers || []).map(l => {
        if (isSpecial) {
          return l.type === clickedLayer.type ? { ...l, visible: targetValue } : l;
        } else {
          return l.id === action.payload ? { ...l, visible: targetValue } : l;
        }
      });
      return { ...state, config: { ...state.config, layers: newLayers } };
    }

    case "ADD_TEXT_LAYER": {
      const { id, text, fontName, level } = action.payload;
      const newLayer: MemeLayer = {
        id,
        name: text,
        type: "meme",
        templateName: "custom",
        x: 1,
        y: -1,
        visible: true,
        year: state.activeYear,
        templateData: generateTextTemplate(text, fontName, level),
        textConfig: { text, fontName, intensity: level }
      };

      return {
        ...state,
        config: {
          ...state.config,
          layers: [...(state.config.layers || []), newLayer],
          activeLayerId: id,
          basedOnTemplate: undefined
        },
        activeTool: "move" // Auto-switch to move tool
      };
    }

    case "UPDATE_TEXT_LAYER_NAME": {
      const { layerId, name } = action.payload;
      const newLayers = (state.config.layers || []).map(l => {
        if (l.id === layerId && l.type === 'meme' && (l as MemeLayer).textConfig) {
          if (l.locked) return l;
          const cfg = (l as MemeLayer).textConfig!;
          // Bug Fix: We must update the internal textConfig.text as well!
          const updatedCfg = { ...cfg, text: name };
          return {
            ...l,
            name,
            textConfig: updatedCfg,
            templateData: generateTextTemplate(name, updatedCfg.fontName, updatedCfg.intensity)
          };
        }
        return l;
      });
      return { ...state, config: { ...state.config, layers: newLayers, basedOnTemplate: undefined } };
    }

    case "UPDATE_LAYER_COLOR": {
      const { level } = action.payload;
      
      const currentLayers = state.config.layers || [];
      const activeLayer = currentLayers.find(l => l.id === state.config.activeLayerId);
      
      // Determine if we should target the text (meme) layer or the raster layer
      const isMemeActive = activeLayer && activeLayer.type === "meme" && (activeLayer as MemeLayer).textConfig;
      
      let targetActiveLayerId = state.config.activeLayerId;
      if (!isMemeActive) {
        targetActiveLayerId = `raster-${state.activeYear}`;
      }

      let configUpdated = false;
      const newLayers = currentLayers.map(l => {
        // Case A: Updating the active text layer
        if (isMemeActive && l.id === targetActiveLayerId) {
          if (l.locked) return l;
          const cfg = (l as MemeLayer).textConfig!;
          const updatedCfg = { ...cfg, intensity: level };
          configUpdated = true;
          return {
            ...l,
            visible: true,
            textConfig: updatedCfg,
            templateData: generateTextTemplate(updatedCfg.text, updatedCfg.fontName, updatedCfg.intensity)
          };
        }
        
        // Case B: Updating/activating the raster layer of the active year
        if (!isMemeActive && l.id === targetActiveLayerId) {
          if (!l.visible || state.config.activeLayerId !== targetActiveLayerId) {
            configUpdated = true;
            return {
              ...l,
              visible: true
            };
          }
        }
        return l;
      });

      const activeLayerIdChanged = state.config.activeLayerId !== targetActiveLayerId;
      const finalConfigUpdated = configUpdated || activeLayerIdChanged;
      
      return {
        ...state,
        selectedLevel: level,
        activeTool: !isMemeActive ? "pen" : state.activeTool,
        config: finalConfigUpdated 
          ? { 
              ...state.config, 
              activeLayerId: targetActiveLayerId, 
              layers: newLayers,
              basedOnTemplate: undefined
            } 
          : state.config
      };
    }

    case "MOVE_LAYER": {
      const { layerId, x, y } = action.payload;
      const newLayers = (state.config.layers || []).map(l => {
        if (l.id === layerId && l.type === 'meme') {
          if (l.locked) return l;
          return { ...l, x, y };
        }
        return l;
      });
      return { ...state, config: { ...state.config, layers: newLayers, basedOnTemplate: undefined } };
    }

        case "PAINT_CELL": {
          const { dateStr } = action.payload;
          const targetYear = parseInt(dateStr.split('-')[0]);
          // Find raster layer for the specific year of the cell
          let layers = JSON.parse(JSON.stringify(state.config.layers || []));
          let activeLayer = layers.find((l: any) => l.type === 'raster' && l.year === targetYear);
          if (!activeLayer) return state; // Raster layer must exist
          if (activeLayer.locked) return state;
          if (!activeLayer.data) activeLayer.data = {};
          activeLayer.data[dateStr] = state.selectedLevel;
          // Update activeLayerId to this raster layer for consistency
          return {
            ...state,
            config: { ...state.config, layers, activeLayerId: activeLayer.id, basedOnTemplate: undefined },
          };
        }

        case "ERASE_CELL": {
          const { dateStr } = action.payload;
          const targetYear = parseInt(dateStr.split('-')[0]);
          let layers = JSON.parse(JSON.stringify(state.config.layers || []));
          // Find raster layer for the specific year of the cell; fallback to activeYear
          let activeLayer = layers.find((l: any) => l.type === 'raster' && l.year === targetYear);
          if (!activeLayer) {
            activeLayer = layers.find((l: any) => l.type === 'raster' && l.year === state.activeYear);
          }
          if (!activeLayer) return state; // Raster layer must exist
          if (activeLayer.locked) return state;
          if (!activeLayer.data) activeLayer.data = {};
          // Set level to 0 to represent erased cell, overriding background for this cell.
          activeLayer.data[dateStr] = 0;
          // Ensure raster layer is active after erase
          return {
            ...state,
            config: { ...state.config, layers, activeLayerId: activeLayer.id, basedOnTemplate: undefined },
          };
        }

    case "REORDER_LAYERS": {
      const { draggedId, dropId } = action.payload;
      if (draggedId === dropId) return state;

      const newLayers = [...(state.config.layers || [])];
      const draggedIndex = newLayers.findIndex(l => l.id === draggedId);
      const dropIndex = newLayers.findIndex(l => l.id === dropId);

      if (draggedIndex !== -1 && dropIndex !== -1) {
        const [removed] = newLayers.splice(draggedIndex, 1);
        newLayers.splice(dropIndex, 0, removed);
      }

      return { ...state, config: { ...state.config, layers: newLayers, basedOnTemplate: undefined } };
    }

    case "START_FETCH_PROFILE": {
      const { username, platform } = action.payload;
      const startYear = parseYear(state.config.startDate);
      const endYear = parseYear(state.config.endDate);
      const minYear = Math.min(startYear, endYear);
      const maxYear = Math.max(startYear, endYear);

      let nextLayers = (state.config.layers || []).map(l => {
        if (l.type === 'git-profile') {
          return {
            ...l,
            data: {},
            originalData: {},
            cleared: false
          } as any;
        }
        return l;
      });
      const profileLayerName = "Git Profile";

      for (let y = minYear; y <= maxYear; y++) {
        const existingIdx = nextLayers.findIndex(l => l.type === 'git-profile' && l.year === y);
        if (existingIdx === -1) {
          nextLayers.unshift({
            id: `git-profile-${y}`,
            name: profileLayerName,
            type: "git-profile",
            visible: true,
            year: y,
            data: {},
            originalData: {},
            cleared: false
          } as any);
        }
      }

      return {
        ...state,
        config: {
          ...state.config,
          layers: nextLayers
        }
      };
    }

    case "FETCH_PROFILE_SUCCESS": {
      const { contributions, platform, username } = action.payload;
      const dates = Object.keys(contributions);
      if (dates.length === 0) return state;

      const years = dates.map(d => parseInt(d.split('-')[0], 10));
      const fetchedMinYear = Math.min(...years);
      const fetchedMaxYear = Math.max(...years);

      const nextStartDate = `${fetchedMinYear}-01-01`;
      const nextEndDate = `${fetchedMaxYear}-12-31`;

      const finalMinYear = fetchedMinYear;
      const finalMaxYear = fetchedMaxYear;

      let nextLayers = [...(state.config.layers || [])];
      const profileLayerName = "Git Profile";

      // 1. Insert/update git-profile layers for all years in the range
      for (let y = finalMinYear; y <= finalMaxYear; y++) {
        const yearData: Record<string, number> = {};
        for (const [dateStr, val] of Object.entries(contributions)) {
          if (dateStr.startsWith(`${y}-`) && val > 0) {
            yearData[dateStr] = val;
          }
        }

        const existingIdx = nextLayers.findIndex(l => l.type === 'git-profile' && l.year === y);
        if (existingIdx !== -1) {
          nextLayers[existingIdx] = {
            ...nextLayers[existingIdx],
            name: profileLayerName,
            data: yearData,
            originalData: yearData,
            cleared: false
          } as any;
        } else {
          nextLayers.unshift({
            id: `git-profile-${y}`,
            name: profileLayerName,
            type: "git-profile",
            visible: true,
            year: y,
            data: yearData,
            originalData: yearData,
            cleared: false
          } as any);
        }
      }

      // 2. Ensure Background and Raster layers exist for all years in the range
      for (let y = finalMinYear; y <= finalMaxYear; y++) {
        if (!nextLayers.some(l => l.type === 'background' && l.year === y)) {
          const gitProfileIdx = nextLayers.findIndex(l => l.type === 'git-profile' && l.year === y);
          const newBg = {
            id: `bg-${y}`,
            name: "Background",
            type: "background",
            visible: true,
            year: y,
            baseFrequency: 0
          } as any;
          if (gitProfileIdx !== -1) {
            nextLayers.splice(gitProfileIdx + 1, 0, newBg);
          } else {
            nextLayers.unshift(newBg);
          }
        }
        if (!nextLayers.some(l => l.type === 'raster' && l.year === y)) {
          nextLayers.push({
            id: `raster-${y}`,
            name: "Painted",
            type: "raster",
            visible: true,
            year: y,
            data: {}
          });
        }
      }

      // 3. Clear all backgrounds from all layers
      nextLayers = nextLayers.map(l => {
        if (l.type === 'background') {
          return {
            ...l,
            cleared: true,
            customFrequency: undefined
          };
        }
        return l;
      });

      return {
        ...state,
        config: {
          ...state.config,
          startDate: nextStartDate,
          endDate: nextEndDate,
          layers: nextLayers
        }
      };
    }

    default:
      return state;
  }
}
