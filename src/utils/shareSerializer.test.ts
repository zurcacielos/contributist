import { describe, it, expect } from "vitest";
import { serializeDesign, deserializeDesign } from "./shareSerializer";
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

  it("should serialize and deserialize a valid design state correctly", () => {
    const encoded = serializeDesign(mockState);
    expect(typeof encoded).toBe("string");
    expect(encoded.length).toBeGreaterThan(0);

    const restored = deserializeDesign(encoded, mockState);

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

  it("should strip personal Git credentials upon serialization and preserve current credentials upon deserialization", () => {
    const stateWithProfile: AppState = {
      ...mockState,
      config: {
        ...mockState.config,
        gitProfileUrl: "https://github.com/secretprofile"
      }
    };
    const encoded = serializeDesign(stateWithProfile);

    // Verify raw encoded string doesn't contain secret credentials in plain text
    const decodedRaw = Buffer.from(encoded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    expect(decodedRaw).not.toContain("secret-repo");
    expect(decodedRaw).not.toContain("Secret User");
    expect(decodedRaw).not.toContain("secret@user.com");
    expect(decodedRaw).not.toContain("secretprofile");

    const currentLocalState: AppState = {
      ...mockState,
      config: {
        ...mockState.config,
        repoUrl: "https://my-local-repo.git",
        gitName: "My Local Identity",
        gitEmail: "local@identity.com",
        gitProfileUrl: "https://github.com/myprofile"
      }
    };

    const restored = deserializeDesign(encoded, currentLocalState);

    // The restored state MUST preserve the local credentials of the importing user
    expect(restored.config.repoUrl).toBe("https://my-local-repo.git");
    expect(restored.config.gitName).toBe("My Local Identity");
    expect(restored.config.gitEmail).toBe("local@identity.com");
    expect(restored.config.gitProfileUrl).toBe("https://github.com/myprofile");
  });

  it("should safely return currentState when given invalid or corrupted input", () => {
    const restoredCorrupt = deserializeDesign("invalid_base64_string!!!!", mockState);
    expect(restoredCorrupt).toEqual(mockState);

    const restoredEmpty = deserializeDesign("", mockState);
    expect(restoredEmpty).toEqual(mockState);
  });
});
