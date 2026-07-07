/**
 * Returns a list of distinctive colors from either the Synthwave or Green palette.
 * @param count The number of colors requested.
 * @param isSynth Whether the Synthwave palette is active.
 */
export function getDistinctiveColors(count: number, isSynth: boolean): string[] {
  if (isSynth) {
    // Synthwave distinctive colors: neon pink, neon cyan, purple, gold/yellow, orange, violet, light pink
    const synthPalette = [
      "#ff007f", // Neon Pink
      "#00d2ff", // Neon Cyan
      "#d02cff", // Purple/Violet
      "#ffce42", // Gold/Yellow
      "#ff8e31", // Orange
      "#ff4f91", // Soft Pink
      "#a855f7", // Deep Purple/Indigo
    ];
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      colors.push(synthPalette[i % synthPalette.length]);
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
