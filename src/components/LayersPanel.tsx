import React from 'react';
import { Eye, EyeOff, Trash2, RotateCcw, Lock, Unlock } from 'lucide-react';
import { Layer, MemeLayer } from '@/types';
import { AppState, AppAction } from '@/state/appReducer';
import { Card } from '@/components/Card';

interface LayersPanelProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  showAlgoLayer?: boolean;
  onToggleAlgoLayer?: () => void;
  onClearAlgoLayer?: () => void;
  showPaintedInOrange?: boolean;
  onTogglePaintedInOrange?: () => void;
}

function cleanDisplayName(name: string): string {
  return name.replace(/^[\p{Emoji}\p{Extended_Pictographic}\s\uFE0F]+/gu, "");
}

export function LayersPanel({
  state,
  dispatch,
  showAlgoLayer,
  onToggleAlgoLayer,
  onClearAlgoLayer,
  showPaintedInOrange,
  onTogglePaintedInOrange,
}: LayersPanelProps) {
  const [draggedId, setDraggedId] = React.useState<string | null>(null);

  const allLayers = state.config.layers || [];
  const layers = allLayers.filter(l => l.year === state.activeYear);
  const activeLayerId = state.config.activeLayerId;

  const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_LAYER_VISIBILITY', payload: id });
  };

  const toggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newLayers = allLayers.map(l => l.id === id ? { ...l, locked: !l.locked } : l);
    dispatch({ type: 'SET_CONFIG', payload: { ...state.config, layers: newLayers } });
  };

  const allVisible = layers.length > 0 && layers.every(l => l.visible);
  const handleToggleAll = () => {
    const newLayers = allLayers.map(l => l.year === state.activeYear ? { ...l, visible: !allVisible } : l);
    dispatch({ type: 'SET_CONFIG', payload: { ...state.config, layers: newLayers } });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    console.log('handleDelete called for id:', id);
    e.stopPropagation();
    const layer = allLayers.find(l => l.id === id);
    if (layer?.locked) return;
    if (layer?.type === 'background') {
      const newLayers = allLayers.map(l => l.id === id ? { ...l, cleared: true, customFrequency: undefined } : l);
      dispatch({ type: 'SET_CONFIG', payload: { ...state.config, layers: newLayers } });
      return;
    }
    if (layer?.type === 'raster') {
      const newLayers = allLayers.map(l => l.id === id ? { ...l, data: {} } : l);
      dispatch({ type: 'SET_CONFIG', payload: { ...state.config, layers: newLayers } });
      return;
    }
    const newLayers = allLayers.filter(l => l.id !== id);
    dispatch({ type: 'SET_CONFIG', payload: { ...state.config, layers: newLayers } });
    if (activeLayerId === id && newLayers.length > 0) {
      const yearLayers = newLayers.filter(l => l.year === state.activeYear);
      if (yearLayers.length > 0) {
        dispatch({ type: 'SET_ACTIVE_LAYER', payload: yearLayers[0].id });
      }
    }
  };

  const handleFreqChange = (id: string, delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const layer = allLayers.find(l => l.id === id) as import("@/types").BackgroundLayer;
    if (!layer || layer.type !== 'background' || layer.locked) return;
    const currentFreq = layer.customFrequency !== undefined ? layer.customFrequency : (layer.baseFrequency || 0);
    const newFreq = Math.max(0, currentFreq + delta);
    const newLayers = allLayers.map(l => l.id === id ? { ...l, customFrequency: newFreq, cleared: false } : l);
    dispatch({ type: 'SET_CONFIG', payload: { ...state.config, layers: newLayers } });
  };

  const activeLayer = layers.find(l => l.id === activeLayerId);

  if (!state.activeYear) {
    return (
      <Card
        title="Layers"
        className="layers"
        style={{ overflowY: "auto", maxHeight: "80vh" }}
        collapsible={false}
      >
        <p>Select a year!</p>
      </Card>
    );
  }

  return (
    <Card
      title={`Layers of ${state.activeYear}`}
      className="layers"
      style={{ overflowY: "auto", maxHeight: "80vh" }}
      collapsible={false}
      extraHeaderActions={
        <button
          onClick={handleToggleAll}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: allVisible ? "var(--text-main)" : "var(--text-muted)", display: "flex", alignItems: "center", padding: "0 5px" }}
          title={allVisible ? "Hide all layers" : "Show all layers"}
        >
          {allVisible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      }
    >

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {layers.slice().reverse().map(layer => {
          const isLocked = !!layer.locked;
          return (
            <div
              key={layer.id}
              draggable={!isLocked}
              onDragStart={e => { setDraggedId(layer.id); e.dataTransfer.effectAllowed = 'move'; }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (draggedId && draggedId !== layer.id) {
                  dispatch({ type: 'REORDER_LAYERS', payload: { draggedId, dropId: layer.id } });
                }
                setDraggedId(null);
              }}
              onDragEnd={() => setDraggedId(null)}
              onClick={() => dispatch({ type: 'SET_ACTIVE_LAYER', payload: layer.id })}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                borderRadius: "8px",
                cursor: isLocked ? "not-allowed" : "pointer",
                backgroundColor: activeLayerId === layer.id ? "rgba(88, 166, 255, 0.12)" : "var(--surface)",
                border: activeLayerId === layer.id ? "1px solid #58a6ff" : "1px solid var(--border)",
                opacity: draggedId === layer.id ? 0.5 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                {/* Visibility Button */}
                <button
                  onClick={e => handleToggleVisibility(layer.id, e)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: layer.visible ? "var(--text-main)" : "var(--text-muted)", display: "flex", alignItems: "center", padding: 0 }}
                >
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>

                {layer.type === 'meme' && (layer as MemeLayer).textConfig ? (
                  <input
                    type="text"
                    value={layer.name}
                    readOnly={isLocked}
                    onChange={e => {
                      const newName = e.target.value;
                      dispatch({ type: 'UPDATE_TEXT_LAYER_NAME', payload: { layerId: layer.id, name: newName } });
                    }}
                    onClick={e => e.stopPropagation()}
                    style={{
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "0.85rem",
                      color: layer.visible ? "var(--text-main)" : "var(--text-muted)",
                      width: "100px",
                      flex: 1,
                      padding: 0,
                      cursor: isLocked ? "not-allowed" : "text",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "0.85rem", color: layer.visible ? "var(--text-main)" : "var(--text-muted)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {layer.type === 'meme' ? cleanDisplayName(layer.name) : layer.name}
                  </span>
                )}
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Lock Action */}
                <button
                  onClick={e => toggleLock(layer.id, e)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: isLocked ? "#a855f7" : "var(--text-muted)", display: "flex", alignItems: "center", padding: 0 }}
                  title={isLocked ? "Unlock layer" : "Lock layer"}
                >
                  {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>

                {layer.type === 'background' ? (
                  <>
                    {((layer as import("@/types").BackgroundLayer).cleared || (layer as import("@/types").BackgroundLayer).customFrequency !== undefined) && (
                      <button
                        onClick={e => { e.stopPropagation(); const newLayers = allLayers.map(l => l.id === layer.id ? { ...l, cleared: false, customFrequency: undefined } : l); dispatch({ type: 'SET_CONFIG', payload: { ...state.config, layers: newLayers } }); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#58a6ff", display: "flex", alignItems: "center", padding: 0 }}
                        title="Reset background to default"
                        disabled={isLocked}
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}

                    {!(layer as import("@/types").BackgroundLayer).cleared && (
                      <button
                        onClick={e => handleDelete(layer.id, e)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#f85149", display: "flex", alignItems: "center", padding: 0 }}
                        title="Clear background"
                        disabled={isLocked}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={e => handleDelete(layer.id, e)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#f85149", display: "flex", alignItems: "center", padding: 0, opacity: (layers.length > 1 && !isLocked) ? 1 : 0.3 }}
                    disabled={layers.length <= 1 || isLocked}
                    title={layer.type === 'raster' ? "Clear drawing" : "Delete layer"}
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                <div style={{ cursor: isLocked ? "not-allowed" : "grab", color: "var(--text-muted)", display: "flex", alignItems: "center", fontSize: "1rem" }} title={isLocked ? "Locked" : "Drag to reorder"}>
                  ≡
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginTop: '12px' }}>
        <input
          type="checkbox"
          id="show-art-synth"
          checked={showPaintedInOrange}
          onChange={e => { e.stopPropagation(); const newVal = e.target.checked; dispatch({ type: 'SET_CONFIG', payload: { ...state.config, showPaintedInOrange: newVal } }); }}
          style={{ marginRight: '4px' }}
        />
        <span style={{
          background: 'linear-gradient(90deg, #ff007f, #8e24aa, #00d2ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          Show art in Synth
        </span>
      </label>
    </Card>
  );
}
