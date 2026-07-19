"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { GeneratorConfig } from "@/types";
import { AppAction } from "@/state/appReducer";
import { useTranslations } from "next-intl";
import { downloadFile } from "@/utils/downloadFile";
import * as ContextMenu from "@radix-ui/react-context-menu";

import { parseYear } from "@/types";

interface CommunityRemixProps {
  config: GeneratorConfig;
  dispatch: React.Dispatch<AppAction>;
  activeYear: number;
}

interface Scene {
  id: string;
  title: string;
  description: string;
  emoji: string;
  config: GeneratorConfig;
  filename?: string;
}

export const CommunityRemix: React.FC<CommunityRemixProps> = ({ config, dispatch, activeYear }) => {
  const t = useTranslations('Sidebar');
  const tAlerts = useTranslations('Alerts');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchScenes = async () => {
      try {
        const res = await fetch(`/api/scenes?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setScenes(data.scenes || []);
        }
      } catch (err) {
        console.error("Failed to load community scenes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenes();
  }, []);

  const handleRemix = (scene: Scene) => {
    if (!scene.config) return;

    // Current system year
    const currentSystemYear = new Date().getFullYear();

    // Helper to get week index (0-52)
    const getWeekIndex = (date: Date): number => {
      const start = new Date(date.getFullYear(), 0, 1);
      const diff = date.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      return Math.floor(dayOfYear / 7);
    };

    const currentWeekIndex = getWeekIndex(new Date());

    // 1. Determine the span of the remix
    const remixLayers = scene.config.layers || [];
    if (remixLayers.length === 0) return;

    // Find the min and max year of actual artwork layers in the remix
    const activeArtworkLayers = remixLayers.filter(l => {
      if (l.type === "meme") return true;
      if (l.type === "raster") {
        const rl = l as any;
        return rl.data && Object.keys(rl.data).length > 0 && Object.values(rl.data).some((v: any) => v > 0);
      }
      return false;
    });

    let remixMinYear: number;
    let remixMaxYear: number;
    if (activeArtworkLayers.length > 0) {
      const activeYears = activeArtworkLayers.map(l => l.year);
      remixMinYear = Math.min(...activeYears);
      remixMaxYear = Math.max(...activeYears);
    } else {
      const remixYears = remixLayers.map(l => l.year);
      if (remixYears.length > 0) {
        remixMinYear = Math.min(...remixYears);
        remixMaxYear = Math.max(...remixYears);
      } else {
        remixMinYear = parseYear(scene.config.startDate);
        remixMaxYear = parseYear(scene.config.endDate);
      }
    }
    const span = remixMaxYear - remixMinYear + 1;

    // 2. Check if the highest year of the remix has artwork that overflows the current week index
    let maxArtworkX = -1;
    remixLayers.forEach(l => {
      if (l.year !== remixMaxYear) return;
      if (l.type === "meme") {
        maxArtworkX = Math.max(maxArtworkX, l.x + 8);
      }
      if (l.type === "raster") {
        const rl = l as any;
        if (rl.data) {
          Object.entries(rl.data).forEach(([dateStr, val]) => {
            if (val && (val as number) > 0) {
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                maxArtworkX = Math.max(maxArtworkX, getWeekIndex(date));
              }
            }
          });
        }
      }
    });

    // Determine target year mapping
    let targetEndYear: number;
    let newEndDate: string;
    let newStartDate: string;

    if (maxArtworkX >= currentWeekIndex) {
      // No space in the current year (due to future dates), shift to targetEndYear = currentSystemYear - 1
      targetEndYear = currentSystemYear - 1;
      newEndDate = currentSystemYear.toString();
      newStartDate = (currentSystemYear - span).toString();
    } else {
      // Fits in the current year
      targetEndYear = currentSystemYear;
      newEndDate = currentSystemYear.toString();
      newStartDate = (currentSystemYear - span + 1).toString();
    }

    const minUserYear = parseYear(newStartDate);
    const maxUserYear = parseYear(newEndDate);

    // 3. Initialize background layers for the new date range from scratch (clearing previous artwork)
    let nextLayers: any[] = [];
    for (let y = minUserYear; y <= maxUserYear; y++) {
      nextLayers.push({
        id: `bg-${y}`,
        name: "Background",
        type: "background",
        visible: true,
        year: y,
        baseFrequency: 30
      });
      nextLayers.push({
        id: `raster-${y}`,
        name: "Painted",
        type: "raster",
        visible: true,
        year: y,
        data: {}
      });
    }

    // 4. Map and shift remix layers into the target years
    const yearDiff = targetEndYear - remixMaxYear;

    remixLayers.forEach((remixLayer) => {
      const targetYear = remixLayer.year + yearDiff;

      // Skip if the mapped year is out of bounds for the new date range
      if (targetYear < minUserYear || targetYear > maxUserYear) {
        return;
      }

      if (remixLayer.type === "background") {
        // Update the pre-initialized background layer for this year
        nextLayers = nextLayers.map(l => {
          if (l.type === "background" && l.year === targetYear) {
            return {
              ...l,
              baseFrequency: (remixLayer as any).baseFrequency || l.baseFrequency,
              customFrequency: (remixLayer as any).customFrequency,
              cleared: (remixLayer as any).cleared
            };
          }
          return l;
        });
      } else if (remixLayer.type === "raster") {
        // Find the pre-initialized raster layer for this year and merge/overwrite its data
        nextLayers = nextLayers.map(l => {
          if (l.type === "raster" && l.year === targetYear) {
            const rl = remixLayer as any;
            const shiftedData: Record<string, number> = {};
            if (rl.data) {
              for (const [dateStr, value] of Object.entries(rl.data)) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                  date.setFullYear(date.getFullYear() + yearDiff);
                  const newDateStr = date.toISOString().split("T")[0];
                  shiftedData[newDateStr] = value as number;
                } else {
                  shiftedData[dateStr] = value as number;
                }
              }
            }
            return {
              ...l,
              data: shiftedData
            };
          }
          return l;
        });
      } else {
        // Meme layer: add it as a new layer with shifted year
        const newLayerId = `meme-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        nextLayers.push({
          ...remixLayer,
          id: newLayerId,
          year: targetYear
        });
      }
    });

    // Set active layer ID to the first non-background layer in the target years
    let activeLayerId = `raster-${targetEndYear}`;
    const firstNewMeme = nextLayers.find(l => l.year === targetEndYear && l.type === "meme");
    if (firstNewMeme) {
      activeLayerId = firstNewMeme.id;
    }

    // Set the updated config (completely resetting layers and assigning frequencies)
    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        startDate: newStartDate,
        endDate: newEndDate,
        frequencies: scene.config.frequencies || config.frequencies,
        layers: nextLayers,
        activeLayerId,
        basedOnTemplate: scene.id
      }
    });

    // Set the active year to the targetEndYear so the user immediately views it
    dispatch({ type: "SET_ACTIVE_YEAR", payload: targetEndYear });
  };

  const handlePublish = () => {
    const title = window.prompt("Enter a Title for your Community Remix:", "My Custom Design");
    if (!title) return; // cancelled or empty

    const description = window.prompt("Enter a short Description:", "A cool custom remix designed by me.");
    const emoji = window.prompt("Enter a single Emoji for your design:", "🎨") || "🎨";

    // Clean design config to strip sensitive details
    const cleanConfig = {
      ...config,
      repoUrl: "",
      gitName: "",
      gitEmail: ""
    };

    const remixPayload = {
      title,
      description,
      emoji: emoji.slice(0, 4), // keep it short
      config: cleanConfig
    };

    const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "preset"}.json`;
    downloadFile(fileName, JSON.stringify(remixPayload, null, 2));
  };

  const handleSaveIntoRemix = async (scene: Scene) => {
    const cleanConfig = {
      ...config,
      repoUrl: "",
      gitName: "",
      gitEmail: ""
    };

    const remixPayload = {
      title: scene.title,
      description: scene.description,
      emoji: scene.emoji,
      config: cleanConfig
    };

    try {
      const res = await fetch("/api/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: scene.filename || `${scene.id}.json`,
          content: remixPayload
        })
      });

      if (res.ok) {
        dispatch({
          type: "SET_CONFIG",
          payload: {
            ...config,
            basedOnTemplate: scene.id
          }
        });
        alert(tAlerts('saveSuccess', { title: scene.title }));
      } else {
        const data = await res.json();
        alert(tAlerts('saveFail', { error: data.error || "Unknown error" }));
      }
    } catch (err: any) {
      alert(tAlerts('saveError', { message: err.message }));
    }
  };

  return (
    <Card collapsible={true} defaultExpanded={false} title={t('community')}>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
        {loading ? (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>
            {t('loading')}
          </div>
        ) : scenes.length === 0 ? (
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textAlign: "center" }}>
            {t('noScenes')}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
            {scenes.map((scene) => {
              const isDev = process.env.NODE_ENV === "development";
              const isActiveScene = isDev && config.basedOnTemplate === scene.id;
              const cardElement = (
                <div
                  onClick={() => handleRemix(scene)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    backgroundColor: isActiveScene ? "rgba(168, 85, 247, 0.12)" : "rgba(168, 85, 247, 0.05)",
                    border: isActiveScene ? "1.5px solid rgba(168, 85, 247, 0.6)" : "1px solid rgba(168, 85, 247, 0.2)",
                    borderRadius: "8px",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: isActiveScene ? "0 0 8px rgba(168, 85, 247, 0.25)" : "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isActiveScene ? "rgba(168, 85, 247, 0.18)" : "rgba(168, 85, 247, 0.15)";
                    e.currentTarget.style.borderColor = isActiveScene ? "rgba(168, 85, 247, 0.75)" : "rgba(168, 85, 247, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isActiveScene ? "rgba(168, 85, 247, 0.12)" : "rgba(168, 85, 247, 0.05)";
                    e.currentTarget.style.borderColor = isActiveScene ? "rgba(168, 85, 247, 0.6)" : "rgba(168, 85, 247, 0.2)";
                  }}
                  title={isDev ? t('tooltipLeftClickRemix') : t('tooltipClickRemix')}
                >
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: "1.4rem" }}>{scene.emoji}</span>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {scene.title}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {scene.description}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#c084fc", fontWeight: "bold", opacity: 0.8 }}>
                    ⚡
                  </span>
                </div>
              );

              if (isDev) {
                return (
                  <ContextMenu.Root key={scene.id} modal={false}>
                    <ContextMenu.Trigger asChild>
                      {cardElement}
                    </ContextMenu.Trigger>
                    <ContextMenu.Portal>
                      <ContextMenu.Content 
                        className="context-menu-content"
                      >
                        <ContextMenu.Item 
                          className="context-menu-item"
                          onSelect={() => handleSaveIntoRemix(scene)}
                        >
                          {t('saveInto')}
                        </ContextMenu.Item>
                      </ContextMenu.Content>
                    </ContextMenu.Portal>
                  </ContextMenu.Root>
                );
              }

              return <React.Fragment key={scene.id}>{cardElement}</React.Fragment>;
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handlePublish}
          style={{
            width: "100%",
            backgroundColor: "var(--btn-secondary-bg)",
            border: "1px dashed var(--btn-secondary-border)",
            color: "var(--btn-secondary-text)",
            padding: "8px 12px",
            fontSize: "0.8rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            textAlign: "center",
            marginTop: "4px",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--btn-hover-bg)";
            e.currentTarget.style.borderColor = "var(--btn-border)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--btn-secondary-bg)";
            e.currentTarget.style.borderColor = "var(--btn-secondary-border)";
          }}
        >
          {t('publish')}
        </button>
      </div>
    </Card>
  );
};
