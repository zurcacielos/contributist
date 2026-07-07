import { Layer, GeneratorConfig } from "@/types";
import { memeTemplates } from "./memeTemplates";
import { compositeLayers } from "./layerCompositor";

/**
 * Finds a suitable non-overlapping (or minimally overlapping) position (x, y)
 * for a new meme preset in the given year.
 * It uses a smart gap-based distribution algorithm to place the meme equidistant
 * in the largest available free horizontal segment of the grid.
 */
export function findAutoPosition(
  layers: Layer[],
  year: number,
  templateName: string,
  config: GeneratorConfig
): { x: number; y: number } {
  const template = memeTemplates[templateName];
  if (!template || template.length === 0) {
    return { x: 22, y: 0 };
  }

  const tHeight = template.length;
  const tWidth = template[0].length;

  let current = new Date(Date.UTC(year, 0, 1));
  while (current.getUTCDay() !== 0) {
    current.setUTCDate(current.getUTCDate() - 1);
  }
  const gridStartTime = current.getTime();

  const todayStr = new Date().toISOString().split("T")[0];
  const currentSystemYear = new Date().getFullYear();

  // 1. Determine right bound for placement (cut-off at today if current system year)
  let limitWeek = 52;
  if (year === currentSystemYear) {
    const daysToSubtract = new Date(Date.UTC(year, 0, 1)).getUTCDay();
    const todayWeek = Math.floor((daysToSubtract + (new Date().getTime() - gridStartTime) / (24 * 60 * 60 * 1000)) / 7);
    limitWeek = Math.min(52, todayWeek);
  }

  // 2. Gather existing meme intervals to find gaps
  const existingMemes = (layers || []).filter(
    (l) => l.year === year && l.type === "meme" && l.visible
  );

  const occupiedIntervals: { start: number; end: number }[] = [];
  existingMemes.forEach((m) => {
    const w = memeTemplates[m.templateName]?.[0]?.length || 0;
    if (w > 0) {
      occupiedIntervals.push({ start: m.x, end: m.x + w - 1 });
    }
  });

  // Sort and merge intervals
  occupiedIntervals.sort((a, b) => a.start - b.start);
  const mergedIntervals: { start: number; end: number }[] = [];
  occupiedIntervals.forEach((interval) => {
    if (mergedIntervals.length === 0) {
      mergedIntervals.push(interval);
    } else {
      const last = mergedIntervals[mergedIntervals.length - 1];
      if (interval.start <= last.end + 1) {
        last.end = Math.max(last.end, interval.end);
      } else {
        mergedIntervals.push(interval);
      }
    }
  });

  // 3. Find gaps in [0, limitWeek]
  interface Gap {
    start: number;
    end: number;
    type: "left" | "middle" | "right" | "all";
    leftNeighbor?: number;
    rightNeighbor?: number;
  }
  const gaps: Gap[] = [];

  if (mergedIntervals.length === 0) {
    gaps.push({ start: 0, end: limitWeek, type: "all" });
  } else {
    // Gap before the first interval
    if (mergedIntervals[0].start > 0) {
      gaps.push({
        start: 0,
        end: Math.min(limitWeek, mergedIntervals[0].start - 1),
        type: "left",
        rightNeighbor: mergedIntervals[0].start,
      });
    }

    // Gaps between intervals
    for (let i = 0; i < mergedIntervals.length - 1; i++) {
      const start = mergedIntervals[i].end + 1;
      const end = mergedIntervals[i + 1].start - 1;
      if (start <= end && start <= limitWeek) {
        gaps.push({
          start,
          end: Math.min(limitWeek, end),
          type: "middle",
          leftNeighbor: mergedIntervals[i].end,
          rightNeighbor: mergedIntervals[i + 1].start,
        });
      }
    }

    // Gap after the last interval
    const lastEnd = mergedIntervals[mergedIntervals.length - 1].end;
    if (lastEnd < limitWeek) {
      gaps.push({
        start: lastEnd + 1,
        end: limitWeek,
        type: "right",
        leftNeighbor: lastEnd,
      });
    }
  }

  // Filter gaps that can fit our template width
  const validGaps = gaps.filter((g) => (g.end - g.start + 1) >= tWidth);

  let targetX = -1;

  if (validGaps.length > 0) {
    // Choose the gap with the maximum width
    validGaps.sort((a, b) => {
      const lenA = a.end - a.start + 1;
      const lenB = b.end - b.start + 1;
      if (lenA !== lenB) {
        return lenB - lenA; // Descending by length
      }
      // Tie breaker: distance of center to 22
      const centerA = (a.start + a.end) / 2;
      const centerB = (b.start + b.end) / 2;
      return Math.abs(centerA - 22) - Math.abs(centerB - 22);
    });

    const chosen = validGaps[0];

    // Compute equidistant start coordinate
    if (chosen.type === "all") {
      targetX = Math.round((limitWeek - tWidth) / 2);
    } else if (chosen.type === "left") {
      const rightBorder = chosen.rightNeighbor!;
      targetX = Math.round((rightBorder - tWidth) / 2);
    } else if (chosen.type === "right") {
      const leftBorder = chosen.leftNeighbor!;
      targetX = Math.round((limitWeek + leftBorder - tWidth + 2) / 2);
    } else {
      // middle
      const leftBorder = chosen.leftNeighbor!;
      const rightBorder = chosen.rightNeighbor!;
      const center = (leftBorder + rightBorder) / 2;
      targetX = Math.round(center - tWidth / 2);
    }

    // Constrain within bounds
    targetX = Math.max(0, Math.min(limitWeek - tWidth, targetX));
  }

  // 4. Find best y coordinate at targetX with minimum overlap
  const occupied = compositeLayers(layers, year, true);

  if (targetX !== -1) {
    const possibleY: number[] = [];
    const maxY = Math.max(0, 7 - tHeight);
    for (let y = 0; y <= maxY; y++) {
      possibleY.push(y);
    }

    let bestY = 0;
    let minOverlap = Infinity;

    for (const cy of possibleY) {
      let overlapCount = 0;
      let isValidY = true;

      for (let r = 0; r < tHeight; r++) {
        const row = template[r];
        for (let c = 0; c < tWidth; c++) {
          if (row[c] !== ' ') {
            const daysToAdd = (c + targetX) * 7 + (r + cy);
            const targetDate = new Date(gridStartTime + daysToAdd * 24 * 60 * 60 * 1000);
            
            // Bounds check
            if (targetDate.getUTCFullYear() !== year) {
              isValidY = false;
              break;
            }
            const dateStr = targetDate.toISOString().split("T")[0];
            if (year === currentSystemYear && dateStr > todayStr) {
              isValidY = false;
              break;
            }

            if (occupied[dateStr]) {
              overlapCount++;
            }
          }
        }
        if (!isValidY) break;
      }

      if (isValidY && overlapCount < minOverlap) {
        minOverlap = overlapCount;
        bestY = cy;
      }
    }

    return { x: targetX, y: bestY };
  }

  // 5. Fallback full-grid scan
  const possibleX: number[] = [];
  for (let x = 0; x <= 53 - tWidth; x++) {
    possibleX.push(x);
  }
  possibleX.sort((a, b) => Math.abs(a - 22) - Math.abs(b - 22));

  const possibleY: number[] = [];
  const maxY = Math.max(0, 7 - tHeight);
  for (let y = 0; y <= maxY; y++) {
    possibleY.push(y);
  }

  let bestX = 22;
  let bestY = 0;
  let bestScore = Infinity;
  let foundValid = false;

  for (const cx of possibleX) {
    for (const cy of possibleY) {
      let isValid = true;
      let score = 0;

      for (let r = 0; r < tHeight; r++) {
        const row = template[r];
        for (let c = 0; c < tWidth; c++) {
          if (row[c] !== ' ') {
            const daysToAdd = (c + cx) * 7 + (r + cy);
            const targetDate = new Date(gridStartTime + daysToAdd * 24 * 60 * 60 * 1000);
            
            if (targetDate.getUTCFullYear() !== year) {
              isValid = false;
              break;
            }
            const dateStr = targetDate.toISOString().split("T")[0];
            if (year === currentSystemYear && dateStr > todayStr) {
              isValid = false;
              break;
            }

            if (occupied[dateStr]) {
              score++;
            }
          }
        }
        if (!isValid) break;
      }

      if (isValid) {
        if (score === 0) {
          return { x: cx, y: cy };
        }
        if (score < bestScore) {
          bestScore = score;
          bestX = cx;
          bestY = cy;
          foundValid = true;
        }
      }
    }
  }

  if (foundValid) {
    return { x: bestX, y: bestY };
  }

  return { x: 22, y: 0 };
}
