import { AppState } from "@/state/appReducer";

const STORAGE_VERSION = 1;

/**
 * Saves the application state to localStorage.
 */
export function saveStateToStorage(state: AppState): void {
  const dataToSave = {
    version: STORAGE_VERSION,
    data: state
  };
  localStorage.setItem("contributist-state", JSON.stringify(dataToSave));
}

/**
 * Loads and parses the saved application state from localStorage.
 */
export function loadStateFromStorage(): AppState | null {
  const saved = localStorage.getItem("contributist-state");
  if (!saved) return null;
  try {
    const parsed = JSON.parse(saved);
    if (parsed.version === STORAGE_VERSION && parsed.data) {
      return parsed.data;
    }
  } catch (e) {
    console.error("Failed to parse saved state from localStorage", e);
  }
  return null;
}
