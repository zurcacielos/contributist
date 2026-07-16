import { AppState } from "@/state/appReducer";
import { Layer } from "@/types";

export interface SharedDesignState {
  startDate: string;
  endDate: string;
  frequencies: string;
  maxCommitsPerDay: number;
  noWeekends: boolean;
  vacationsPerYear: string;
  vacationLengthDays: string;
  chaos?: number;
  realism?: number;
  layers: Layer[];
  showAlgoLayer: boolean;
  showPaintedLayer: boolean;
  showPaintedInOrange: boolean;
  selectedLevel?: number;
  threeDShowUsername?: boolean;
  threeDUsername?: string;
  threeDUsernamePosition?: string;
}

/**
 * Base64 helper for browser and Node environments using TextEncoder/TextDecoder.
 */
function toBase64(str: string): string {
  try {
    if (typeof window === "undefined") {
      return Buffer.from(str, "utf8").toString("base64");
    }
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return window.btoa(binString);
  } catch (e) {
    return "";
  }
}

function fromBase64(str: string): string {
  try {
    if (typeof window === "undefined") {
      return Buffer.from(str, "base64").toString("utf8");
    }
    const binString = window.atob(str);
    const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return "";
  }
}

async function compressString(str: string): Promise<string> {
  const byteArray = new TextEncoder().encode(str);
  const stream = new Response(byteArray as any).body;
  if (!stream) throw new Error("Failed to create stream");
  const compressedStream = stream.pipeThrough(new CompressionStream("deflate"));
  const buffer = await new Response(compressedStream).arrayBuffer();
  
  const bytes = new Uint8Array(buffer);
  if (typeof window === "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

async function decompressString(base64: string): Promise<string> {
  let bytes: Uint8Array;
  if (typeof window === "undefined") {
    bytes = new Uint8Array(Buffer.from(base64, "base64"));
  } else {
    const binary = window.atob(base64);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
  }
  
  const stream = new Response(bytes as any).body;
  if (!stream) throw new Error("Failed to create stream");
  const decompressedStream = stream.pipeThrough(new DecompressionStream("deflate"));
  const buffer = await new Response(decompressedStream).arrayBuffer();
  return new TextDecoder().decode(buffer);
}

/**
 * Encodes Base64 to a URL-safe format.
 */
function toUrlSafeBase64(base64: string): string {
  return base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decodes URL-safe Base64 back to standard Base64.
 */
function fromUrlSafeBase64(urlSafe: string): string {
  let base64 = urlSafe.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return base64;
}

/**
 * Filters out personal details from AppState, leaving only design-related configuration.
 */
export function filterStateForSharing(state: AppState): SharedDesignState {
  return {
    startDate: state.config.startDate,
    endDate: state.config.endDate,
    frequencies: state.config.frequencies,
    maxCommitsPerDay: state.config.maxCommitsPerDay,
    noWeekends: state.config.noWeekends,
    vacationsPerYear: state.config.vacationsPerYear,
    vacationLengthDays: state.config.vacationLengthDays,
    chaos: state.config.chaos,
    realism: state.config.realism,
    layers: state.config.layers || [],
    showAlgoLayer: state.config.showAlgoLayer,
    showPaintedLayer: state.config.showPaintedLayer,
    showPaintedInOrange: state.config.showPaintedInOrange,
    selectedLevel: state.selectedLevel,
    threeDShowUsername: state.config.threeDShowUsername,
    threeDUsername: state.config.threeDUsername,
    threeDUsernamePosition: state.config.threeDUsernamePosition
  };
}

/**
 * Serializes only the design-related properties of AppState into a URL-safe Base64 string.
 * Strips all personal Git credentials (repoUrl, gitName, gitEmail).
 */
export async function serializeDesign(state: AppState): Promise<string> {
  const design = filterStateForSharing(state);
  const json = JSON.stringify(design);
  const base64 = await compressString(json);
  return toUrlSafeBase64(base64);
}

/**
 * Safely parses and validates an encoded design string, merging it into the current AppState.
 * Guarantees that current Git identities (repoUrl, gitName, gitEmail) are preserved and never overwritten.
 */
export async function deserializeDesign(encoded: string, currentState: AppState): Promise<AppState> {
  if (!encoded) return currentState;

  try {
    const base64 = fromUrlSafeBase64(encoded);
    let json = "";
    try {
      json = await decompressString(base64);
    } catch (decompError) {
      // Fallback: If decompression fails (e.g., old uncompressed links), fall back to raw Base64 decoding
      json = fromBase64(base64);
    }
    if (!json) return currentState;

    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return currentState;

    // Build the restored config, strictly inheriting credentials from the current state
    const restoredConfig = {
      ...currentState.config,
      // Design fields (validated fallback)
      startDate: typeof parsed.startDate === "string" ? parsed.startDate : currentState.config.startDate,
      endDate: typeof parsed.endDate === "string" ? parsed.endDate : currentState.config.endDate,
      frequencies: typeof parsed.frequencies === "string" ? parsed.frequencies : currentState.config.frequencies,
      maxCommitsPerDay: typeof parsed.maxCommitsPerDay === "number" ? parsed.maxCommitsPerDay : currentState.config.maxCommitsPerDay,
      noWeekends: typeof parsed.noWeekends === "boolean" ? parsed.noWeekends : currentState.config.noWeekends,
      vacationsPerYear: typeof parsed.vacationsPerYear === "string" ? parsed.vacationsPerYear : currentState.config.vacationsPerYear,
      vacationLengthDays: typeof parsed.vacationLengthDays === "string" ? parsed.vacationLengthDays : currentState.config.vacationLengthDays,
      chaos: typeof parsed.chaos === "number" ? parsed.chaos : currentState.config.chaos,
      realism: typeof parsed.realism === "number" ? parsed.realism : currentState.config.realism,
      layers: Array.isArray(parsed.layers) ? (parsed.layers as Layer[]) : currentState.config.layers,
      showAlgoLayer: typeof parsed.showAlgoLayer === "boolean" ? parsed.showAlgoLayer : currentState.config.showAlgoLayer,
      showPaintedLayer: typeof parsed.showPaintedLayer === "boolean" ? parsed.showPaintedLayer : currentState.config.showPaintedLayer,
      showPaintedInOrange: typeof parsed.showPaintedInOrange === "boolean" ? parsed.showPaintedInOrange : currentState.config.showPaintedInOrange,
      threeDShowUsername: typeof parsed.threeDShowUsername === "boolean" ? parsed.threeDShowUsername : currentState.config.threeDShowUsername,
      threeDUsername: typeof parsed.threeDUsername === "string" ? parsed.threeDUsername : currentState.config.threeDUsername,
      threeDUsernamePosition: typeof parsed.threeDUsernamePosition === "string" ? parsed.threeDUsernamePosition : currentState.config.threeDUsernamePosition,
      
      // EXCLUSION GUARANTEE: Never overwrite credentials
      repoUrl: currentState.config.repoUrl,
      gitName: currentState.config.gitName,
      gitEmail: currentState.config.gitEmail,
      gitProfileOrURL_import: currentState.config.gitProfileOrURL_import
    };

    return {
      ...currentState,
      config: restoredConfig,
      selectedLevel: typeof parsed.selectedLevel === "number" ? parsed.selectedLevel : currentState.selectedLevel
    };
  } catch (e) {
    console.error("Failed to deserialize design", e);
    return currentState;
  }
}

/**
 * Checks if the state contains only an imported Git profile, with no custom drawings or text/meme layers.
 */
export function isPureGitProfileDesign(state: AppState): boolean {
  const layers = state.config.layers || [];

  const hasDrawingsOrMemes = layers.some((layer) => {
    if (layer.type === "raster") {
      const raster = layer as any;
      const hasData = raster.data && Object.keys(raster.data).length > 0;
      return hasData;
    }
    if (layer.type === "meme") {
      return true;
    }
    return false;
  });

  if (hasDrawingsOrMemes) {
    return false;
  }

  const hasGitProfile = layers.some((layer) => layer.type === "git-profile");
  return hasGitProfile;
}

/**
 * Collapses an array of years into a descending range list string.
 * Example: [2026, 2025, 2024, 2022, 2020, 2019, 2018] -> "2026-2024,2022,2020-2018"
 */
export function collapseYearsToRanges(years: number[]): string {
  if (years.length === 0) return "";
  const sorted = Array.from(new Set(years)).sort((a, b) => b - a);

  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const current = sorted[i];
    if (current === prev - 1) {
      prev = current;
    } else {
      if (start === prev) {
        ranges.push(`${start}`);
      } else {
        ranges.push(`${start}-${prev}`);
      }
      if (current !== undefined) {
        start = current;
        prev = current;
      }
    }
  }
  return ranges.join(",");
}

/**
 * Expands a range list string into an array of years.
 * Example: "2026-2024,2022,2020-2018" -> [2026, 2025, 2024, 2022, 2020, 2019, 2018]
 */
export function expandRangesToYears(rangeStr: string): number[] {
  if (!rangeStr) return [];
  const years: number[] = [];
  const parts = rangeStr.split(",");
  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        for (let y = min; y <= max; y++) {
          years.push(y);
        }
      }
    } else {
      const y = parseInt(part, 10);
      if (!isNaN(y)) {
        years.push(y);
      }
    }
  }
  return years.sort((a, b) => b - a);
}

/**
 * Generates the clean/short URL for pure designs or Base64 design hash for custom ones.
 */
export async function generateShareUrl(state: AppState, tab: string): Promise<string> {
  if (typeof window === "undefined") return "";

  if (isPureGitProfileDesign(state)) {
    const profile = (state.config.gitProfileOrURL_import || "").trim();
    const bgLayers = (state.config.layers || []).filter((l) => l.type === "background" && !l.cleared);
    const bgYears = bgLayers.map((l) => l.year).filter((y) => y !== undefined) as number[];
    const bgRange = collapseYearsToRanges(bgYears);

    const params = new URLSearchParams();
    params.set("tab", tab);
    params.set("profile", profile);
    if (bgRange) {
      params.set("bg", bgRange);
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  } else {
    const serialized = await serializeDesign(state);
    return `${window.location.origin}${window.location.pathname}?tab=${tab}#design=${serialized}`;
  }
}


