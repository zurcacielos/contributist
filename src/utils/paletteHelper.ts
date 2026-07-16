/**
 * Returns a list of distinctive colors from either the Synthwave or Green palette.
 * @param count The number of colors requested.
 * @param isSynth Whether the Synthwave palette is active.
 */
export function getDistinctiveColors(count: number, isSynth: boolean): string[] {
  if (isSynth) {
    // Amber distinctive colors: amber, orange, dark orange, gold, yellow, light amber
    const amberPalette = [
      "#ffcf26", // Level 4 Amber
      "#ff7f00", // Level 3 Orange
      "#d53a00", // Level 2 Red-Orange
      "#ffa000", // Amber 700
      "#ffb300", // Amber 600
      "#ffc107", // Amber 500
      "#ffd54f", // Amber 300
    ];
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(amberPalette[i % amberPalette.length]);
    }
    return colors;
  } else {
    // Classic green palette: standard vibrant green, light green, medium green, dark green, jade green, mint
    const greenPalette = [
      "#39d353", // Level 4 Light Green
      "#26a641", // Level 3 Medium Green
      "#006d32", // Level 2 Dark Green
      "#0f9d58", // Google Green
      "#4caf50", // Material Green
      "#00e676", // Bright Lime Green
      "#2ecc71", // Emerald Green
    ];
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(greenPalette[i % greenPalette.length]);
    }
    return colors;
  }
}
