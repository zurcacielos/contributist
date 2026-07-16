"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tooltip } from "react-tooltip";
import { GeneratorConfig, Layer } from "@/types";
import { Titlebar } from "@/components/Titlebar";
import { ExportTab } from "@/components/tabexport/ExportTab";
import { DrawTab } from "@/components/tabdraw/DrawTab";
import { VisualShareTab } from "@/components/tabshare/VisualShareTab";
import { HelpTab } from "@/components/tabhelp/HelpTab";
import { ThreeDTab } from "@/components/tab3d/ThreeDTab";
import { deserializeDesign, expandRangesToYears } from "@/utils/shareSerializer";
import { parseProfileUrl } from "@/git-contributions/GithubContributionsReader/urlParser";
import { ActivityGraphRef } from "@/components/ActivityGraph";
import { saveConfig, loadConfig } from "@/utils/configHelper";
import { StoreProvider, useAppStore, useAppDispatch } from "@/state/store";
import { saveStateToStorage, loadStateFromStorage } from "@/utils/storage";
import { useTranslations } from "next-intl";
import { ToastProvider } from "@/components/Toast";

function DashboardContent({ initialConfig }: { initialConfig: GeneratorConfig }) {
  const tAlerts = useTranslations('Alerts');
  const tModal = useTranslations('Modal');
  const state = useAppStore((s) => s);
  const dispatch = useAppDispatch();


  const config = state.config;

  const [mainTab, setMainTab] = useState<"draw" | "share" | "export" | "help" | "3d">("draw");
  const [pendingTab, setPendingTab] = useState<"draw" | "share" | "export" | "help" | "3d" | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [shareAspectRatio, setShareAspectRatio] = useState<"square" | "story" | "landscape">("landscape");

  const isInitialized = useRef(false);

  useEffect(() => {
    const init = async () => {
      // Check if there is an exported design or tab in the URL query string or hash fragment
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const designParam = hashParams.get("design") || params.get("design");
      const tabParam = params.get("tab") || hashParams.get("tab");

      if (tabParam && ["draw", "share", "export", "help", "3d"].includes(tabParam)) {
        setMainTab(tabParam as any);
      }

      const loadedKey = designParam ? `design-loaded-${designParam.slice(-20)}` : "";
      const profileParam = params.get("profile") || hashParams.get("profile");
      const bgonParam = params.get("bgon") || hashParams.get("bgon");

      if (designParam && !sessionStorage.getItem(loadedKey)) {
        try {
          const restored = await deserializeDesign(designParam, state);
          dispatch({ type: "RESTORE_STATE", payload: restored });
          sessionStorage.setItem(loadedKey, "true");
        } catch (e) {
          console.error("Failed to load design from URL", e);
        } finally {
          isInitialized.current = true;
        }
        return;
      } else if (profileParam) {
        try {
          const bgYears = bgonParam ? expandRangesToYears(bgonParam) : [];
          const initialLayers: Layer[] = bgYears.map(y => ({
            id: `bg-${y}`,
            name: `Background`,
            type: "background" as const,
            visible: true,
            year: y,
            cleared: false
          }));

          const startYear = parseInt(initialConfig.startDate, 10) || (new Date().getFullYear() - 1);
          const endYear = parseInt(initialConfig.endDate, 10) || new Date().getFullYear();
          const minYear = Math.min(startYear, endYear);
          const maxYear = Math.max(startYear, endYear);

          for (let y = minYear; y <= maxYear; y++) {
            initialLayers.push({
              id: `raster-${y}`,
              name: `Painted`,
              type: "raster" as const,
              visible: true,
              year: y,
              data: {}
            });
          }

          const customConfig = {
            ...initialConfig,
            gitProfileOrURL_import: profileParam,
            layers: initialLayers
          };

          dispatch({ type: "RESET_TO_INITIAL", payload: customConfig });

          const { platform, username } = parseProfileUrl(profileParam);

          dispatch({
            type: "START_FETCH_PROFILE",
            payload: { username, platform }
          });

          fetch("/api/contributions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profileUrl: profileParam }),
          })
            .then(async (res) => {
              const data = await res.json();
              if (!res.ok) {
                throw new Error(data.error || "Failed to fetch contributions");
              }
              const fetchedContributions = data.contributions as Record<string, number>;
              if (fetchedContributions && Object.keys(fetchedContributions).length > 0) {
                dispatch({
                  type: "FETCH_PROFILE_SUCCESS",
                  payload: {
                    contributions: fetchedContributions,
                    platform: data.platform || platform,
                    username: data.username || username
                  }
                });
              }
            })
            .catch((err) => {
              console.error("Failed to auto-fetch contributions on startup", err);
            });
        } catch (e) {
          console.error("Failed to load profile from URL", e);
        } finally {
          isInitialized.current = true;
        }
        return;
      }

      const savedState = loadStateFromStorage();
      if (savedState) {
        dispatch({ type: "RESTORE_STATE", payload: savedState });
      }

      isInitialized.current = true;
    };

    init();
  }, []);

  // Sync tab state to URL query parameter without page reload
  useEffect(() => {
    if (!isInitialized.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") !== mainTab) {
      params.set("tab", mainTab);
      const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState({ ...window.history.state, as: nextUrl, url: nextUrl }, "", nextUrl);
    }
  }, [mainTab]);

  useEffect(() => {
    if (!isInitialized.current) return;

    // DEBOUNCE: Do not write to localStorage on every single keystroke.
    // Instead, wait for a short period of inactivity (1000ms) before saving.
    const timer = setTimeout(() => {
      saveStateToStorage(state);
    }, 1000);

    return () => clearTimeout(timer);
  }, [state]);



  const graphRef = useRef<ActivityGraphRef>(null);

  const handleTabSwitch = (tab: "draw" | "share" | "export" | "help" | "3d") => {
    if (mainTab === "draw" && tab !== "draw" && graphRef.current) {
      if (graphRef.current.hasUnsavedChanges()) {
        setPendingTab(tab);
        return;
      } else {
        graphRef.current.discardChanges();
      }
    }
    setMainTab(tab);
  };

  useEffect(() => {
    fetch("/api/git-config")
      .then((res) => res.json())
      .then((data) => {
        dispatch({ type: 'MERGE_GIT_CONFIG', payload: data });
      })
      .catch(() => { });
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveConfig = () => {
    saveConfig(config);
  };

  const handleLoadConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadConfig(
      file,
      (loadedConfig) => dispatch({ type: 'SET_CONFIG', payload: loadedConfig }),
      () => alert(tAlerts('invalidJson'))
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleReset = () => {
    if (confirm(tAlerts('confirmReset'))) {
      localStorage.removeItem("contributist-state");
      localStorage.removeItem("contributist-feeling-mode");
      sessionStorage.clear();
      dispatch({ type: "RESET_TO_INITIAL", payload: initialConfig });
    }
  };

  return (
    <main className="app-shell">

      <input type="file" accept=".json" style={{ display: "none" }} ref={fileInputRef} onChange={handleLoadConfig} />

      <Titlebar
        mainTab={mainTab}
        onTabSwitch={handleTabSwitch}
        onSave={handleSaveConfig}
        onLoad={() => fileInputRef.current?.click()}
        onReset={handleReset}
        state={state}
        dispatch={dispatch}
      />

      {mainTab === "draw" && (
        <DrawTab
          config={config}
          state={state}
          dispatch={dispatch}
          handleSaveConfig={handleSaveConfig}
          fileInputRef={fileInputRef}
          graphRef={graphRef}
          setIsEditing={setIsEditing}
          onReset={handleReset}
          initialConfig={initialConfig}
        />
      )}

      {mainTab === "share" && (
        <VisualShareTab
          config={config}
          state={state}
          dispatch={dispatch}
          aspectRatio={shareAspectRatio}
          setAspectRatio={setShareAspectRatio}
        />
      )}

      {mainTab === "export" && (
        <ExportTab
          config={config}
          dispatch={dispatch}
        />
      )}

      {mainTab === "help" && (
        <HelpTab />
      )}

      {mainTab === "3d" && (
        <ThreeDTab
          state={state}
          dispatch={dispatch}
        />
      )}

      <Tooltip id="info-tooltip" opacity={1} delayShow={0} style={{ zIndex: 1000, fontSize: "14px", padding: "6px 10px", borderRadius: "6px", maxWidth: "300px", whiteSpace: "pre-line" }} />

      {
        pendingTab && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
            <section className="card" style={{ width: "400px", padding: "25px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)" }}>{tModal('unsavedChanges')}</h3>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>{tModal('savePrompt')}</p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button className="btn btn-primary" onClick={() => setPendingTab(null)} style={{ backgroundColor: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 16px" }}>{tModal('cancel')}</button>
                <button className="btn btn-primary" onClick={() => { graphRef.current?.discardChanges(); setMainTab(pendingTab); setPendingTab(null); }} style={{ backgroundColor: "transparent", border: "1px solid #b62324", color: "#ff7b72", padding: "8px 16px" }}>{tModal('discard')}</button>
                <button className="btn btn-primary" onClick={() => { graphRef.current?.saveChanges(); setMainTab(pendingTab); setPendingTab(null); }} style={{ backgroundColor: "#238636", border: "none", color: "#fff", padding: "8px 16px" }}>{tModal('save')}</button>
              </div>
            </section>
          </div>
        )
      }
    </main >
  );
}

export function Dashboard({ initialConfig }: { initialConfig: GeneratorConfig }) {
  const defaultInitialState = {
    config: initialConfig,
    activeTool: "pen" as const,
    selectedLevel: 4,
    activeYear: new Date().getFullYear(),
  };

  return (
    <StoreProvider initialState={defaultInitialState}>
      <ToastProvider>
        <DashboardContent initialConfig={initialConfig} />
      </ToastProvider>
    </StoreProvider>
  );
}
