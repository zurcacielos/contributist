import React from 'react';
import { FeelingMode } from '@/types';
import { FeelingToggler } from './FeelingToggler';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FilePlus, FolderOpen, Save } from 'lucide-react';

interface TitlebarProps {
  mainTab: "draw" | "share" | "export";
  onTabSwitch: (tab: "draw" | "share" | "export") => void;
  feelingMode: FeelingMode;
  setFeelingMode: (mode: FeelingMode) => void;
  onSave: () => void;
  onLoad: () => void;
  onReset: () => void;
}

export function Titlebar({ mainTab, onTabSwitch, feelingMode, setFeelingMode, onSave, onLoad, onReset }: TitlebarProps) {
  return (
    <header className="titlebar" style={{ position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid var(--border)' }}>
      <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img src="/images/contributist-web.png" alt="Contributist logo" className="logo-img" />
        <div>
          <h1 style={{ margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "4px" }}>
            Contributist <span>⚡</span>
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
            Turn your year into pixel art.
          </p>
        </div>
      </div>
      <FeelingToggler feelingMode={feelingMode} onChange={setFeelingMode} style={{ marginLeft: "10px" }} />
      <nav className="flow" aria-label="creation flow">
        <button
          className={`flow-step ${mainTab === 'draw' ? 'active' : ''}`}
          onClick={() => onTabSwitch('draw')}
        >
          <b>1</b> Design
        </button>
        <i>→</i>
        <button
          className={`flow-step ${mainTab === 'share' ? 'active' : ''}`}
          onClick={() => onTabSwitch('share')}
        >
          <b>2</b> Share
        </button>
        <i>→</i>
        <button
          className={`flow-step ${mainTab === 'export' ? 'active' : ''}`}
          onClick={() => onTabSwitch('export')}
        >
          <b>3</b> Send to GIT
        </button>
      </nav>
      <div className="top-icons" aria-label="quick actions">
        <button>🎮</button>
        <button>⚙</button>
        
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="avatar" style={{ cursor: "pointer" }}>👾</button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="dropdown-menu-content"
              align="end"
              sideOffset={5}
            >
              <DropdownMenu.Item className="dropdown-menu-item" onSelect={onReset}>
                <FilePlus size={15} style={{ marginRight: 8 }} />
                New
              </DropdownMenu.Item>
              <DropdownMenu.Item className="dropdown-menu-item" onSelect={onLoad}>
                <FolderOpen size={15} style={{ marginRight: 8 }} />
                Open
              </DropdownMenu.Item>
              <DropdownMenu.Item className="dropdown-menu-item" onSelect={onSave}>
                <Save size={15} style={{ marginRight: 8 }} />
                Save
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
