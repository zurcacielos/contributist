import { fonts } from "./fonts";

export function generateTextTemplate(text: string, fontName: string, intensity: number): string[] {
  const font = fonts[fontName];
  if (!font) return ["", "", "", "", "", "", ""];

  const generatedTemplate: string[] = ["", "", "", "", "", "", ""];
  let rows = ["", "", "", "", "", "", ""];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charData = font[char] || font["?"];
    
    let minLeading = 999;
    let maxTrailing = -1;
    
    for (let r = 0; r < 7; r++) {
      const rowStr = charData[r];
      if (!rowStr || rowStr.trim() === "") continue;
      
      let firstIdx = 0;
      while (firstIdx < rowStr.length && rowStr[firstIdx] === ' ') firstIdx++;
      if (firstIdx < minLeading) minLeading = firstIdx;
      
      let lastIdx = rowStr.length - 1;
      while (lastIdx >= 0 && rowStr[lastIdx] === ' ') lastIdx--;
      if (lastIdx > maxTrailing) maxTrailing = lastIdx;
    }

    if (minLeading === 999) {
      if (char === " ") {
        for (let r = 0; r < 7; r++) rows[r] += "   ";
      }
      continue;
    }
    
    const replacer = (r: string) => r ? r.replace(/4/g, String(intensity)) : "";

    for (let r = 0; r < 7; r++) {
      const trimmedRow = charData[r].slice(minLeading, maxTrailing + 1);
      rows[r] += replacer(trimmedRow) + " ";
    }
  }

  for (let r = 0; r < 7; r++) {
    rows[r] = rows[r].slice(0, -1);
    generatedTemplate[r] = rows[r];
  }

  return generatedTemplate;
}
