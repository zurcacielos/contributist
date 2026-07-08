import { GeneratorConfig, parseYear } from "@/types";
import { downloadFile } from "./downloadFile";
import { generateTextTemplate } from "./textEngine";

/**
 * Validates, initializes and migrates configuration inputs.
 */
export function initializeAndMigrateConfig(
  config: GeneratorConfig,
  apiData: { name?: string; email?: string }
): GeneratorConfig {
  const next = {
    ...config,
    gitName: config.gitName || apiData.name || "",
    gitEmail: config.gitEmail || apiData.email || "",
  };

  if (next.layers) {
    next.layers = next.layers.map(layer => {
      if (layer.type === "meme" && layer.templateName === "custom" && layer.textConfig) {
        const { text, fontName, intensity } = layer.textConfig;
        return {
          ...layer,
          templateData: generateTextTemplate(text, fontName, intensity)
        };
      }
      return layer;
    });
  }
  if (next.paintedLayer && (!next.layers || next.layers.length === 0)) {
    next.layers = [
      {
        id: "raster-1",
        name: "Painted",
        type: "raster" as const,
        visible: true,
        year: parseYear(next.startDate),
        data: next.paintedLayer,
      },
    ];
    next.activeLayerId = "raster-1";
    next.paintedLayer = undefined;
  } else if (!next.layers || next.layers.length === 0) {
    next.layers = [
      {
        id: "raster-1",
        name: "Painted",
        type: "raster" as const,
        visible: true,
        year: parseYear(next.startDate),
        data: {},
      },
    ];
    next.activeLayerId = "raster-1";
  }
  return next;
}

/**
 * Downloads the current configuration state as a JSON file.
 */
export function saveConfig(config: GeneratorConfig): void {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  downloadFile(`contributist-config-${timestamp}.json`, JSON.stringify(config, null, 2));
}

/**
 * Parses and loads configuration from a local file.
 */
export function loadConfig(
  file: File,
  onLoad: (config: GeneratorConfig) => void,
  onError: (error: any) => void
): void {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const loadedConfig = JSON.parse(event.target?.result as string);
      if (loadedConfig && typeof loadedConfig === "object") {
        onLoad(loadedConfig);
      } else {
        onError(new Error("Invalid configuration format."));
      }
    } catch (err) {
      onError(err);
    }
  };
  reader.readAsText(file);
}
