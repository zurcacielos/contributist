import { GeneratorConfig } from "@/types";
import { AppAction } from "@/state/appReducer";

const getDefaultFrequencies = (): string => {
  const envDefault = process.env.NEXT_PUBLIC_FREQUENCIES_DEFAULT;
  if (envDefault && envDefault.trim() !== "") {
    return envDefault.trim();
  }
  return "50";
};

const ensureFrequencies = (frequencies: string | undefined): string => {
  if (
    !frequencies ||
    frequencies.trim() === "" ||
    frequencies === "0" ||
    frequencies.split(",").every((v) => parseFloat(v.trim()) === 0)
  ) {
    return getDefaultFrequencies();
  }
  return frequencies;
};

export const applyBackgroundSelected = (
  config: GeneratorConfig,
  activeYear: number,
  feelingMode?: string, // Kept as optional string to preserve signature compatibility
  dispatch?: React.Dispatch<AppAction>,
  onChange?: (c: GeneratorConfig) => void
) => {
  if (!activeYear) return;

  const nextConfig = { ...config };

  // Ensure frequencies is not empty or zero
  nextConfig.frequencies = ensureFrequencies(nextConfig.frequencies);

  // Mark background layer for the active year as not cleared, and set all layers visible to true (Happy Mode)
  const nextLayers = (nextConfig.layers || []).map((l) => {
    if (l.type === "background" && l.year === activeYear) {
      return {
        ...l,
        visible: true,
        cleared: false,
        customFrequency: undefined,
      };
    }
    return { ...l, visible: true };
  });

  const finalPayload = { ...nextConfig, layers: nextLayers };

  if (dispatch) {
    dispatch({
      type: "SET_CONFIG",
      payload: finalPayload,
    });
  } else if (onChange) {
    onChange(finalPayload);
  }
};

export const applyBackgroundAll = (
  config: GeneratorConfig,
  feelingMode?: string, // Kept as optional string to preserve signature compatibility
  dispatch?: React.Dispatch<AppAction>,
  onChange?: (c: GeneratorConfig) => void
) => {
  const nextConfig = { ...config };

  // Ensure frequencies is not empty or zero
  nextConfig.frequencies = ensureFrequencies(nextConfig.frequencies);

  // Mark all background layers as not cleared, and set all layers visible to true (Happy Mode)
  const nextLayers = (nextConfig.layers || []).map((l) => {
    if (l.type === "background") {
      return {
        ...l,
        visible: true,
        cleared: false,
        customFrequency: undefined,
      };
    }
    return { ...l, visible: true };
  });

  const finalPayload = { ...nextConfig, layers: nextLayers };

  if (dispatch) {
    dispatch({
      type: "SET_CONFIG",
      payload: finalPayload,
    });
  } else if (onChange) {
    onChange(finalPayload);
  }
};

