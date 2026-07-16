export type LayerType = 'raster' | 'meme' | 'background' | 'git-profile';

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  year: number;
  locked?: boolean;
}

export interface RasterLayer extends BaseLayer {
  type: 'raster';
  data: Record<string, number>;
}

export interface BackgroundLayer extends BaseLayer {
  type: 'background';
  cleared?: boolean;
  baseFrequency?: number;
  customFrequency?: number;
}

export interface GitProfileLayer extends BaseLayer {
  type: 'git-profile';
  data: Record<string, number>;
  originalData?: Record<string, number>;
}

export interface MemeLayer extends BaseLayer {
  type: 'meme';
  templateName: string;
  templateData?: string[]; // Used for dynamically generated templates (like text)
  x: number; // week column (0-52)
  y: number; // day row (0-6)
  textConfig?: {
    text: string;
    fontName: string;
    intensity: number;
  };
}

export type Layer = RasterLayer | MemeLayer | BackgroundLayer | GitProfileLayer;

export interface GeneratorConfig {
  repoUrl: string;
  startDate: string;
  endDate: string;
  frequencies: string;
  maxCommitsPerDay: number;
  noWeekends: boolean;
  vacationsPerYear: string;
  vacationLengthDays: string;
  chaos?: number;
  realism?: number;
  paintedLayer?: Record<string, number>; // Legacy, kept for backward compatibility
  layers: Layer[];
  activeLayerId: string;
  showAlgoLayer: boolean;
  showPaintedLayer: boolean;
  showPaintedInOrange: boolean;
  gitName?: string;
  gitEmail?: string;
  gitProfileOrURL_import?: string;
  basedOnTemplate?: string;
  threeDShowUsername?: boolean;
  threeDUsername?: string;
  threeDUsernamePosition?: string;
}


export function parseYear(dateStr: string): number {
  if (!dateStr || dateStr.toLowerCase() === 'present') {
    return new Date().getFullYear();
  }
  const match = String(dateStr).match(/^(\d{4})/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return new Date().getFullYear();
}

export function parseList(str: string, defaultValue: number[]): number[] {
  if (!str) return defaultValue;
  const parsed = str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  return parsed.length > 0 ? parsed : defaultValue;
}


