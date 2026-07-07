import { Layer, RasterLayer, MemeLayer } from "@/types";
import { memeTemplates } from "./memeTemplates";

export interface CompositeResult {
  level: number;
  layerId: string;
}

export function compositeLayers(layers: Layer[] = [], baseYear: number, ignoreVisibility?: boolean): Record<string, CompositeResult> {
  const result: Record<string, CompositeResult> = {};

  // Find the first date (Sunday) of the grid for the base year
  let current = new Date(Date.UTC(baseYear, 0, 1));
  while (current.getUTCDay() !== 0) {
    current.setUTCDate(current.getUTCDate() - 1);
  }
  const gridStartTime = current.getTime();

  // Process from bottom to top
  for (const layer of layers) {
    if (layer.year !== baseYear) continue;
    if (!ignoreVisibility && !layer.visible) continue;

    if (layer.type === 'raster') {
      const raster = layer as RasterLayer;
      if (raster.data) {
        Object.entries(raster.data).forEach(([dateStr, level]) => {
          if (level >= 0) {
            result[dateStr] = { level, layerId: layer.id };
          }
        });
      }
    } else if (layer.type === 'meme') {
      const meme = layer as MemeLayer;
      const template = meme.templateData || memeTemplates[meme.templateName];
      if (!template) continue;

      for (let r = 0; r < template.length; r++) {
        const row = template[r];
        if (typeof row !== "string") continue;
        for (let c = 0; c < row.length; c++) {
          const char = row[c];
          if (char !== ' ') {
            const rowIdx = r + meme.y;
            if (rowIdx < 0 || rowIdx > 6) continue;
            
            const daysToAdd = (c + meme.x) * 7 + rowIdx;
            const targetDate = new Date(gridStartTime);
            targetDate.setUTCDate(targetDate.getUTCDate() + daysToAdd);
            const dateStr = targetDate.toISOString().split("T")[0];
            const parsedLevel = parseInt(char, 10);
            result[dateStr] = { level: isNaN(parsedLevel) ? 0 : parsedLevel, layerId: layer.id };
          }
        }
      }
    }
  }

  return result;
}
