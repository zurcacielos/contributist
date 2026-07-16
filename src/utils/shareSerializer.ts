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
    selectedLevel: state.selectedLevel
  };
}

/**
 * Serializes only the design-related properties of AppState into a URL-safe Base64 string.
 * Strips all personal Git credentials (repoUrl, gitName, gitEmail).
 */
export function serializeDesign(state: AppState): string {
  const design = filterStateForSharing(state);
  const json = JSON.stringify(design);
  const base64 = toBase64(json);
  return toUrlSafeBase64(base64);
}

/**
 * Safely parses and validates an encoded design string, merging it into the current AppState.
 * Guarantees that current Git identities (repoUrl, gitName, gitEmail) are preserved and never overwritten.
 */
export function deserializeDesign(encoded: string, currentState: AppState): AppState {
  if (!encoded) return currentState;

  try {
    const base64 = fromUrlSafeBase64(encoded);
    const json = fromBase64(base64);
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
