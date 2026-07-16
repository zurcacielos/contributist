import React from 'react';
import { FeelingMode } from '@/types';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Menubar from '@radix-ui/react-menubar';
import { FilePlus, FolderOpen, Save, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LanguageSelector } from './LanguageSelector';

import { AppState, AppAction } from '@/state/appReducer';

import { applyBackgroundSelected, applyBackgroundAll } from '@/utils/backgroundActions';

interface TitlebarProps {
  mainTab: "draw" | "share" | "export" | "help" | "3d";
  onTabSwitch: (tab: "draw" | "share" | "export" | "help" | "3d") => void;
  feelingMode: FeelingMode;
  setFeelingMode: (mode: FeelingMode) => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export function Titlebar({ 
  mainTab, 
  onTabSwitch, 
  feelingMode, 
  setFeelingMode, 
  onSave, 
  onLoad, 
  onReset,
  state,
  dispatch
}: TitlebarProps) {
  const t = useTranslations('Titlebar');
  const tSidebar = useTranslations('Sidebar');

  const handleApplySelected = () => {
    applyBackgroundSelected(state.config, state.activeYear, feelingMode, dispatch);
  };

  const handleApplyAll = () => {
    applyBackgroundAll(state.config, feelingMode, dispatch);
  };

  const handleClearSelected = () => {
    const config = state.config;
    const activeYear = state.activeYear;
    if (!activeYear) return;

    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'background' && l.year === activeYear) {
        return {
          ...l,
          cleared: true,
          customFrequency: undefined
        };
      }
      return l;
    });

    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        layers: nextLayers
      }
    });
  };

  const handleClearAll = () => {
    const config = state.config;

    const nextLayers = (config.layers || []).map(l => {
      if (l.type === 'background') {
        return {
          ...l,
          cleared: true,
          customFrequency: undefined
        };
      }
      return l;
    });

    dispatch({
      type: "SET_CONFIG",
      payload: {
        ...config,
        layers: nextLayers
      }
    });
  };

  const tCalendar = useTranslations('Calendar');
  const bgLayer = state.activeYear
    ? (state.config.layers || []).find(l => l.type === 'background' && l.year === state.activeYear) as any
    : undefined;
  const isBgActive = bgLayer ? !bgLayer.cleared : false;

  const isApplySelectedDisabled = mainTab !== 'draw' || !state.activeYear || isBgActive;
  const isApplyAllDisabled = mainTab !== 'draw';
  const isClearSelectedDisabled = mainTab !== 'draw' || !state.activeYear || !isBgActive;
  const isClearAllDisabled = mainTab !== 'draw';

  return (
    <header className="titlebar" style={{ position: 'relative', top: 0, zIndex: 30, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', minHeight: '50px', padding: '8px 26px', boxSizing: 'border-box' }}>
      {/* Left side: Brand + Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', flexShrink: 0 }}>
        <div
          className="brand"
          onClick={() => onTabSwitch('draw')}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
        >
          <img src="/images/contributist-web.png" alt="Contributist logo" className="logo-img" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "4px" }}>
              Contributist <span>⚡</span>
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)", textTransform: "capitalize" }}>
              Contribution Retribution.
            </p>
          </div>
        </div>

        <div>
          <Menubar.Root className="menubar-root">
            <Menubar.Menu>
              <Menubar.Trigger className="menubar-trigger">
                {t('file')}
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content 
                  className="menubar-content"
                  align="start"
                  sideOffset={5}
                  alignOffset={-3}
                >
                  <Menubar.Item className="menubar-item" onSelect={onReset}>
                    <FilePlus size={15} style={{ marginRight: 8 }} />
                    New
                  </Menubar.Item>
                  <Menubar.Item className="menubar-item" onSelect={onLoad}>
                    <FolderOpen size={15} style={{ marginRight: 8 }} />
                    Open
                  </Menubar.Item>
                  <Menubar.Item className="menubar-item" onSelect={onSave}>
                    <Save size={15} style={{ marginRight: 8 }} />
                    Save
                  </Menubar.Item>
                  <Menubar.Separator 
                    style={{ height: 1, backgroundColor: "rgba(255, 255, 255, 0.12)", margin: "4px 0" }} 
                  />
                  <Menubar.Item className="menubar-item" onSelect={() => onTabSwitch('share')}>
                    <Share2 size={15} style={{ marginRight: 8 }} />
                    {t('sharePngUrl')}
                  </Menubar.Item>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>

            <Menubar.Menu>
              <Menubar.Trigger className="menubar-trigger">
                {t('background')}
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content 
                  className="menubar-content"
                  align="start"
                  sideOffset={5}
                  alignOffset={-3}
                >
                  <Menubar.Item 
                    className="menubar-item" 
                    disabled={isApplySelectedDisabled}
                    onSelect={handleApplySelected}
                  >
                    {tSidebar('makeSelectedGreener')}
                  </Menubar.Item>
                  <Menubar.Item 
                    className="menubar-item" 
                    disabled={isApplyAllDisabled}
                    onSelect={handleApplyAll}
                  >
                    {tSidebar('makeAllGreener')}
                  </Menubar.Item>
                  <Menubar.Separator 
                    style={{ height: 1, backgroundColor: "rgba(255, 255, 255, 0.12)", margin: "4px 0" }} 
                  />
                  <Menubar.Item 
                    className="menubar-item" 
                    disabled={isClearSelectedDisabled}
                    onSelect={handleClearSelected}
                  >
                    {tCalendar('clearSelectedRightClick')}
                  </Menubar.Item>
                  <Menubar.Item 
                    className="menubar-item" 
                    disabled={isClearAllDisabled}
                    onSelect={handleClearAll}
                  >
                    {tCalendar('clearAllRightClick')}
                  </Menubar.Item>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
            <Menubar.Menu>
              <Menubar.Trigger 
                className="menubar-trigger"
                style={{
                  background: ['draw', 'export', '3d'].includes(mainTab) ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  color: ['draw', 'export', '3d'].includes(mainTab) ? '#fff' : '#c9d1d9',
                }}
              >
                {t('view')}
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content 
                  className="menubar-content"
                  align="start"
                  sideOffset={5}
                  alignOffset={-3}
                >
                  <Menubar.Item className="menubar-item" onSelect={() => onTabSwitch('draw')}>
                    {t('design')}
                  </Menubar.Item>
                  <Menubar.Item className="menubar-item" onSelect={() => onTabSwitch('export')}>
                    {t('push')}
                  </Menubar.Item>
                  <Menubar.Item className="menubar-item" onSelect={() => onTabSwitch('3d')}>
                    {t('threeD')}
                  </Menubar.Item>
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
            <button
              className="menubar-trigger"
              onClick={() => onTabSwitch('help')}
              style={{
                background: mainTab === 'help' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: mainTab === 'help' ? '#fff' : '#c9d1d9',
                border: 0,
                cursor: 'pointer',
              }}
            >
              {t('help')}
            </button>
          </Menubar.Root>
        </div>
      </div>

      {/* Center side: Flow Buttons centered in remaining space */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, padding: '0 20px' }}>
        <nav 
          className="flow" 
          aria-label="creation flow"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            pointerEvents: "auto"
          }}
        >
          <button
            className={`flow-step ${mainTab === 'draw' ? 'active' : ''}`}
            onClick={() => onTabSwitch('draw')}
            style={mainTab === 'draw' && feelingMode === 'advanced' ? { boxShadow: 'none', borderColor: '#086244' } : undefined}
          >
            <b style={mainTab === 'draw' && feelingMode === 'advanced' ? { background: '#086244', color: '#fff' } : undefined}>1</b> {t('design')}
          </button>
          <i>→</i>
          <button
            className={`flow-step ${mainTab === 'export' ? 'active' : ''}`}
            onClick={() => onTabSwitch('export')}
            style={mainTab === 'export' && feelingMode === 'advanced' ? { boxShadow: 'none', borderColor: '#086244' } : undefined}
          >
            <b style={mainTab === 'export' && feelingMode === 'advanced' ? { background: '#086244', color: '#fff' } : undefined}>2</b> {t('push')}
          </button>
        </nav>
      </div>

      <div 
        className="top-icons" 
        aria-label="quick actions"
        style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}
      >
        <LanguageSelector />
        <a 
          href="https://github.com/zurcacielos/contributist"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub · Fork & Remix"
          className="github-fork-remix-btn"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="github-text">GitHub · Fork & Remix</span>
        </a>

      </div>
    </header>
  );
}
