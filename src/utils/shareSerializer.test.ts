import { describe, it, expect } from "vitest";
import {
  serializeDesign,
  deserializeDesign,
  collapseYearsToRanges,
  expandRangesToYears,
  isPureGitProfileDesign,
  generateShareUrl
} from "./shareSerializer";
import { AppState } from "@/state/appReducer";

describe("shareSerializer", () => {
  const mockState: AppState = {
    activeTool: "pen",
    selectedLevel: 3,
    activeYear: 2025,
    config: {
      repoUrl: "https://github.com/someone/secret-repo.git",
      gitName: "Secret User",
      gitEmail: "secret@user.com",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      frequencies: "30,60,90",
      maxCommitsPerDay: 20,
      noWeekends: true,
      vacationsPerYear: "10",
      vacationLengthDays: "5",
      chaos: 0.2,
      realism: 0.8,
      layers: [
        { id: "bg-2025", name: "Background", type: "background", visible: true, year: 2025 },
        { id: "raster-2025", name: "Painted", type: "raster", visible: true, year: 2025, data: { "2025-01-02": 4 } }
      ],
      activeLayerId: "raster-2025",
      showAlgoLayer: true,
      showPaintedLayer: true,
      showPaintedInOrange: false
    }
  };

  it("should serialize and deserialize a valid design state correctly", async () => {
    const encoded = await serializeDesign(mockState);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    const restored = await deserializeDesign(encoded, mockState);

    // Verified fields are identical
    expect(restored.config.startDate).toBe(mockState.config.startDate);
    expect(restored.config.endDate).toBe(mockState.config.endDate);
    expect(restored.config.frequencies).toBe(mockState.config.frequencies);
    expect(restored.config.maxCommitsPerDay).toBe(mockState.config.maxCommitsPerDay);
    expect(restored.config.noWeekends).toBe(mockState.config.noWeekends);
    expect(restored.config.vacationsPerYear).toBe(mockState.config.vacationsPerYear);
    expect(restored.config.vacationLengthDays).toBe(mockState.config.vacationLengthDays);
    expect(restored.config.chaos).toBe(mockState.config.chaos);
    expect(restored.config.realism).toBe(mockState.config.realism);
    expect(restored.selectedLevel).toBe(mockState.selectedLevel);
    expect(restored.config.layers.length).toBe(mockState.config.layers.length);
  });

  it("should strip personal Git credentials upon serialization and preserve current credentials upon deserialization", async () => {
    const stateWithProfile: AppState = {
      ...mockState,
      config: {
        ...mockState.config,
        gitProfileOrURL_import: "torvalds"
      }
    };
    const encoded = await serializeDesign(stateWithProfile);

    // Verified credentials are not present
    expect(encoded).not.toContain("secret-repo");

    const currentLocalState: AppState = {
      ...mockState,
      config: {
        ...mockState.config,
        repoUrl: "https://my-local-repo.git",
        gitName: "My Local Identity",
        gitEmail: "local@identity.com",
        gitProfileOrURL_import: "myoriginaluser"
      }
    };

    const restored = await deserializeDesign(encoded, currentLocalState);

    // The restored state MUST preserve the local credentials of the importing user
    expect(restored.config.repoUrl).toBe("https://my-local-repo.git");
    expect(restored.config.gitName).toBe("My Local Identity");
    expect(restored.config.gitEmail).toBe("local@identity.com");
    expect(restored.config.gitProfileOrURL_import).toBe("myoriginaluser");
  });

  it("should safely return currentState when given invalid or corrupted input", async () => {
    const restoredCorrupt = await deserializeDesign("invalid_base64_string!!!!", mockState);
    expect(restoredCorrupt).toEqual(mockState);

    const restoredEmpty = await deserializeDesign("", mockState);
    expect(restoredEmpty).toEqual(mockState);
  });

  it("should decompress new compressed strings and fall back to raw base64 parsing for older strings", async () => {
    // 1. Create older uncompressed base64 raw string of mockState design properties
    const oldRawJson = JSON.stringify({
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      frequencies: "30,60,90"
    });
    const oldBase64 = Buffer.from(oldRawJson, "utf8").toString("base64");
    const oldUrlSafe = oldBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    
    // 2. Deserialize it using new async function
    const restored = await deserializeDesign(oldUrlSafe, mockState);
    expect(restored.config.startDate).toBe("2025-01-01");
    expect(restored.config.endDate).toBe("2025-12-31");
  });

  describe("collapseYearsToRanges and expandRangesToYears", () => {
    it("should collapse consecutive and non-consecutive years in descending order", () => {
      const years = [2026, 2025, 2024, 2022, 2020, 2019, 2018];
      const collapsed = collapseYearsToRanges(years);
      expect(collapsed).toBe("2026-2024,2022,2020-2018");
    });

    it("should collapse single years correctly", () => {
      expect(collapseYearsToRanges([2025])).toBe("2025");
      expect(collapseYearsToRanges([])).toBe("");
    });

    it("should expand collapsed ranges back to a full years array", () => {
      const range = "2026-2024,2022,2020-2018";
      const expanded = expandRangesToYears(range);
      expect(expanded).toEqual([2026, 2025, 2024, 2022, 2020, 2019, 2018]);
    });

    it("should expand single year and empty ranges", () => {
      expect(expandRangesToYears("2025")).toEqual([2025]);
      expect(expandRangesToYears("")).toEqual([]);
    });
  });

  describe("isPureGitProfileDesign", () => {
    it("should detect a pure design with only a git-profile layer", () => {
      const pureState: AppState = {
        ...mockState,
        config: {
          ...mockState.config,
          layers: [
            { id: "bg-2025", name: "Background", type: "background", visible: true, year: 2025 },
            { id: "git-2025", name: "Git Profile", type: "git-profile", visible: true, year: 2025, data: {} },
            { id: "raster-2025", name: "Painted", type: "raster", visible: true, year: 2025, data: {} }
          ]
        }
      };
      expect(isPureGitProfileDesign(pureState)).toBe(true);
    });

    it("should return false if there are drawings in the raster layer", () => {
      const dirtyState: AppState = {
        ...mockState,
        config: {
          ...mockState.config,
          layers: [
            { id: "bg-2025", name: "Background", type: "background", visible: true, year: 2025 },
            { id: "git-2025", name: "Git Profile", type: "git-profile", visible: true, year: 2025, data: {} },
            { id: "raster-2025", name: "Painted", type: "raster", visible: true, year: 2025, data: { "2025-01-05": 3 } }
          ]
        }
      };
      expect(isPureGitProfileDesign(dirtyState)).toBe(false);
    });

    it("should return false if there are custom meme layers", () => {
      const memeState: AppState = {
        ...mockState,
        config: {
          ...mockState.config,
          layers: [
            { id: "bg-2025", name: "Background", type: "background", visible: true, year: 2025 },
            { id: "git-2025", name: "Git Profile", type: "git-profile", visible: true, year: 2025, data: {} },
            { id: "raster-2025", name: "Painted", type: "raster", visible: true, year: 2025, data: {} },
            { id: "meme-123", name: "Meme", type: "meme", visible: true, year: 2025, textConfig: { text: "Hello", fontName: "Classic", x: 0, y: 0, level: 3 } }
          ]
        }
      };
      expect(isPureGitProfileDesign(memeState)).toBe(false);
    });
  });

  describe("generateShareUrl", () => {
    it("should return the correct short URL", async () => {
      const pureState: AppState = {
        ...mockState,
        config: {
          ...mockState.config,
          gitProfileOrURL_import: "torvalds",
          layers: [
            { id: "bg-2025", name: "Background", type: "background", visible: true, year: 2025, cleared: false },
            { id: "git-2025", name: "Git Profile", type: "git-profile", visible: true, year: 2025, data: {} },
            { id: "raster-2025", name: "Painted", type: "raster", visible: true, year: 2025, data: {} }
          ]
        }
      };
      const url = await generateShareUrl(pureState, "share");
      expect(url).toContain("?tab=share&profile=torvalds&bg=2025");
    });
  });
});


