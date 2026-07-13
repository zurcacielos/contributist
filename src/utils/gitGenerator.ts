import { GeneratorConfig, parseYear, parseList, Layer } from "@/types";
import { compositeLayers } from "./layerCompositor";

export interface CommitAction {
  dateStr: string;
  msg: string;
}

const COMMIT_MESSAGES = [
  "Fix bug", "Update README", "Refactor module", "Typo", "WIP",
  "Add tests", "Cleanup", "Update dependencies", "Fix lint errors",
  "Improve performance", "Code review changes", "Optimize query",
  "Fix styling", "Update config"
];

// Seeded PRNG
function cyrb128(str: string): number {
  let h1 = 1779033703, h2 = 3144134277,
    h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

function mulberry32(a: number) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function getRandomItem<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

export interface YearConfigMeta {
  year: number;
  freq: number;
  vacationLengths: number[];
}

export function generateCommits(config: GeneratorConfig, outMeta?: YearConfigMeta[]): CommitAction[] {
  const coreConfig = {
    startDate: config.startDate,
    endDate: config.endDate,
    maxCommitsPerDay: config.maxCommitsPerDay,
    noWeekends: config.noWeekends,
    vacationsPerYear: config.vacationsPerYear,
    vacationLengthDays: config.vacationLengthDays,
  };
  const seedStr = JSON.stringify(coreConfig);
  const seed = cyrb128(seedStr);
  const rng = mulberry32(seed);

  const commits: CommitAction[] = [];

  const startYearParsed = parseYear(config.startDate);
  const endYearParsed = parseYear(config.endDate);

  const startYear = Math.min(startYearParsed, endYearParsed);
  const endYear = Math.max(startYearParsed, endYearParsed);

  const freqs = parseList(config.frequencies, [50]);
  const vacAmts = parseList(config.vacationsPerYear, [2]);
  const vacLens = parseList(config.vacationLengthDays, [14]);

  const today = new Date();

  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);

  for (let i = 0; i < years.length; i++) {
    const year = years[i];

    const currentLayers = config.layers || [];
    const bgLayer = currentLayers.find(l => l.year === year && l.type === 'background') as import("@/types").BackgroundLayer | undefined;

    let freq = freqs[i % freqs.length];
    if (bgLayer) {
      if (bgLayer.customFrequency !== undefined) {
        freq = bgLayer.customFrequency;
      } else if (bgLayer.baseFrequency !== undefined) {
        freq = bgLayer.baseFrequency;
      }
    }

    const numVacations = vacAmts[Math.floor(rng() * vacAmts.length)];

    const yearMeta: YearConfigMeta = { year, freq, vacationLengths: [] };

    const vacations: { start: Date; end: Date }[] = [];
    for (let v = 0; v < numVacations; v++) {
      const vLen = vacLens[Math.floor(rng() * vacLens.length)];
      yearMeta.vacationLengths.push(vLen);

      const startDayOffset = Math.floor(rng() * 300);

      const vStart = new Date(Date.UTC(year, 0, 1));
      vStart.setUTCDate(vStart.getUTCDate() + startDayOffset);

      const vEnd = new Date(vStart);
      vEnd.setUTCDate(vEnd.getUTCDate() + vLen + Math.floor(rng() * 3));
      vacations.push({ start: vStart, end: vEnd });
    }

    if (outMeta) {
      outMeta.push(yearMeta);
    }

    const currentPaintedLayer = compositeLayers(currentLayers, year, false); // respect visibility
    const hasBackgroundLayer = bgLayer && !bgLayer.cleared;

    const current = new Date(Date.UTC(year, 0, 1));
    const endDate = year === today.getUTCFullYear()
      ? new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
      : new Date(Date.UTC(year, 11, 31));

    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0];

      const isVacation = vacations.some(
        (v) => current >= v.start && current <= v.end
      );

      const isWeekend = current.getUTCDay() === 0 || current.getUTCDay() === 6;

      const dayRng = mulberry32(cyrb128(seedStr + "-" + dateStr));

      // 1. ALWAYS consume PRNG for the algorithm to keep the sequence perfectly stable
      let algoCommits = 0;
      let algoShouldGenerate = false;

      if (!isVacation && (!config.noWeekends || !isWeekend)) {
        if (dayRng() * 100 < freq) {
          algoCommits = Math.floor(dayRng() * config.maxCommitsPerDay) + 1;
          algoShouldGenerate = true;
        }
      }

      const algoCommitTimes: Date[] = [];
      const algoCommitMsgs: string[] = [];
      if (algoShouldGenerate) {
        let commitTime = new Date(current); // UTC midnight
        // Start at 12:00 UTC to ensure we don't roll over UTC day
        commitTime.setUTCHours(12, Math.floor(dayRng() * 60), 0);
        for (let c = 0; c < algoCommits; c++) {
          algoCommitTimes.push(new Date(commitTime));
          algoCommitMsgs.push(getRandomItem(COMMIT_MESSAGES, dayRng));
          // Add 10-30 minutes per commit to avoid crossing 23:59:59 UTC
          commitTime.setUTCMinutes(commitTime.getUTCMinutes() + 10 + Math.floor(dayRng() * 20));
        }
      }

      // 2. Decide what to ACTUALLY push based on Layer UI state
      let targetCommits = 0;
      let useAlgoTimes = false;

      const composite = currentPaintedLayer[dateStr];
      if (composite !== undefined) {
        if (composite.level === 1) targetCommits = 1;
        else if (composite.level === 2) targetCommits = 3;
        else if (composite.level === 3) targetCommits = 6;
        else if (composite.level === 4) targetCommits = 10;
      } else {
        const bgActive = hasBackgroundLayer;
        const gitProfileLayer = currentLayers.find(l => l.year === year && l.type === 'git-profile') as any;
        const gitProfileActive = gitProfileLayer && gitProfileLayer.visible && !gitProfileLayer.cleared && gitProfileLayer.data && gitProfileLayer.data[dateStr] > 0;

        if (bgActive && algoCommits > 0) {
          targetCommits = algoCommits;
          useAlgoTimes = true;
        } else if (gitProfileActive) {
          const profileLevel = gitProfileLayer.data[dateStr];
          if (profileLevel === 1) targetCommits = 1;
          else if (profileLevel === 2) targetCommits = 3;
          else if (profileLevel === 3) targetCommits = 6;
          else if (profileLevel === 4) targetCommits = 10;
        }
      }

      if (targetCommits > 0) {
        if (useAlgoTimes) {
          for (let c = 0; c < targetCommits; c++) {
            commits.push({
              dateStr: algoCommitTimes[c].toISOString(),
              msg: algoCommitMsgs[c]
            });
          }
        } else {
          let pTime = new Date(current);
          pTime.setUTCHours(12, Math.floor(dayRng() * 60), 0);
          for (let c = 0; c < targetCommits; c++) {
            commits.push({
              dateStr: pTime.toISOString(),
              msg: getRandomItem(COMMIT_MESSAGES, dayRng)
            });
            pTime.setUTCMinutes(pTime.getUTCMinutes() + 10 + Math.floor(dayRng() * 20));
          }
        }
      }

      current.setUTCDate(current.getUTCDate() + 1);
    }
  }

  return commits;
}
