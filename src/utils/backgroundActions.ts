import { GeneratorConfig, FeelingMode } from "@/types";
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

const deriveVibeConfig = (
  chaosVal: number,
  realismVal: number,
  currentConfig: GeneratorConfig
): GeneratorConfig => {
  let newFrequencies = currentConfig.frequencies;
  if (chaosVal < 20) newFrequencies = "40";
  else if (chaosVal < 50) newFrequencies = "30,50";
  else if (chaosVal < 80) newFrequencies = "20,60,30,80";
  else newFrequencies = "10,90,5,100,0,50";

  const newMaxCommits = Math.max(1, Math.floor(50 - realismVal * 0.45));

  return {
    ...currentConfig,
    chaos: chaosVal,
    realism: realismVal,
    frequencies: newFrequencies,
    maxCommitsPerDay: newMaxCommits,
    noWeekends: true,
    vacationsPerYear: "2",
  };
};

export const applyBackgroundSelected = (
  config: GeneratorConfig,
  activeYear: number,
  feelingMode: FeelingMode,
  dispatch?: React.Dispatch<AppAction>,
  onChange?: (c: GeneratorConfig) => void
) => {
  if (!activeYear) return;

  let nextConfig = { ...config };

  // 1. Ensure frequencies is not empty or zero
  nextConfig.frequencies = ensureFrequencies(nextConfig.frequencies);

  // 2. Derive Vibe Config if in vibe mode
  if (feelingMode === "vibe") {
    const chaosVal = nextConfig.chaos ?? 50;
    const realismVal = nextConfig.realism ?? 100;
    nextConfig = deriveVibeConfig(chaosVal, realismVal, nextConfig);
  }

  // 3. Mark background layer for the active year as not cleared
  const nextLayers = (nextConfig.layers || []).map((l) => {
    if (l.type === "background" && l.year === activeYear) {
      return {
        ...l,
        cleared: false,
        customFrequency: undefined,
      };
    }
    return l;
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
  feelingMode: FeelingMode,
  dispatch?: React.Dispatch<AppAction>,
  onChange?: (c: GeneratorConfig) => void
) => {
  let nextConfig = { ...config };

  // 1. Ensure frequencies is not empty or zero
  nextConfig.frequencies = ensureFrequencies(nextConfig.frequencies);

  // 2. Derive Vibe Config if in vibe mode
  if (feelingMode === "vibe") {
    const chaosVal = nextConfig.chaos ?? 50;
    const realismVal = nextConfig.realism ?? 100;
    nextConfig = deriveVibeConfig(chaosVal, realismVal, nextConfig);
  }

  // 3. Mark all background layers as not cleared
  const nextLayers = (nextConfig.layers || []).map((l) => {
    if (l.type === "background") {
      return {
        ...l,
        cleared: false,
        customFrequency: undefined,
      };
    }
    return l;
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
