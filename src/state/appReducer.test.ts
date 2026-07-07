import { describe, it, expect } from 'vitest';
import { appReducer, AppState } from './appReducer';
import { GeneratorConfig } from '../types';

describe('appReducer', () => {
  const initialConfig: GeneratorConfig = {
    repoUrl: '',
    startDate: '2025',
    endDate: 'present',
    frequencies: '50',
    layers: [],
    activeLayerId: null
  } as GeneratorConfig;

  const initialState: AppState = {
    config: initialConfig,
    activeTool: 'move',
    selectedLevel: 4,
    activeYear: 2026
  };

  it('adds a text layer correctly', () => {
    const state = appReducer(initialState, {
      type: 'ADD_TEXT_LAYER',
      payload: { id: 'layer-1', text: 'hi!', fontName: 'Standard 7-Row', level: 4 }
    });

    expect(state.config.layers?.length).toBe(1);
    expect(state.config.activeLayerId).toBe('layer-1');
    expect(state.activeTool).toBe('move');

    const newLayer = state.config.layers![0];
    expect(newLayer.type).toBe('meme');
    expect(newLayer.name).toBe('hi!');

    // Assert type safely for testing
    if (newLayer.type === 'meme' && newLayer.textConfig) {
      expect(newLayer.textConfig.text).toBe('hi!');
      expect(newLayer.textConfig.intensity).toBe(4);
    } else {
      expect.fail('Layer should be a meme layer with textConfig');
    }
  });

  it('updates text layer name without losing textConfig synchronization', () => {
    // 1. Add Layer
    let state = appReducer(initialState, {
      type: 'ADD_TEXT_LAYER',
      payload: { id: 'layer-1', text: 'hi!', fontName: 'Standard 7-Row', level: 4 }
    });

    // 2. Update Text (simulate typing in LayersPanel)
    state = appReducer(state, {
      type: 'UPDATE_TEXT_LAYER_NAME',
      payload: { layerId: 'layer-1', name: 'hola' }
    });

    const layer = state.config.layers![0];
    expect(layer.name).toBe('hola');

    if (layer.type === 'meme' && layer.textConfig) {
      expect(layer.textConfig.text).toBe('hola'); // This is the bug fix!
    } else {
      expect.fail('Layer should be a meme layer with textConfig');
    }
  });

  it('updates layer color while PRESERVING the modified text', () => {
    // 1. Add Layer
    let state = appReducer(initialState, {
      type: 'ADD_TEXT_LAYER',
      payload: { id: 'layer-1', text: 'hi!', fontName: 'Standard 7-Row', level: 4 }
    });

    // 2. Update Text to "hola"
    state = appReducer(state, {
      type: 'UPDATE_TEXT_LAYER_NAME',
      payload: { layerId: 'layer-1', name: 'hola' }
    });

    // 3. Update Color to 1 (simulate clicking color picker)
    state = appReducer(state, {
      type: 'UPDATE_LAYER_COLOR',
      payload: { level: 1 }
    });

    expect(state.selectedLevel).toBe(1);

    const layer = state.config.layers![0];
    expect(layer.name).toBe('hola'); // The layer name should remain "hola"

    if (layer.type === 'meme' && layer.textConfig) {
      expect(layer.textConfig.text).toBe('hola'); // The internal text config should remain "hola"
      expect(layer.textConfig.intensity).toBe(1); // The intensity should be updated
    } else {
      expect.fail('Layer should be a meme layer with textConfig');
    }
  });

  it('creates multi-year structure properly and orders layers background bottom, painted top', () => {
    // 1. Create a 2-year structure via SET_CONFIG (e.g., 2025 to 2026), simulating Dashboard's initial load where it injects a raster layer
    const initialConfigWithRaster = {
      ...initialConfig,
      startDate: '2025',
      endDate: '2026',
      layers: [
        { id: 'raster-2025', name: 'Painted', type: 'raster', visible: true, year: 2025, data: {} } as any,
        { id: 'raster-2026', name: 'Painted', type: 'raster', visible: true, year: 2026, data: {} } as any
      ]
    };
    
    let state = appReducer(initialState, {
      type: 'SET_CONFIG',
      payload: initialConfigWithRaster
    });

    // We have 2 years, so there should be 4 layers total (2 backgrounds, 2 rasters)
    expect(state.config.layers?.length).toBe(4);

    // 2. Select one year (2026)
    state = appReducer(state, {
      type: 'SET_ACTIVE_YEAR',
      payload: 2026
    });

    // Check layers for 2026
    const layers2026 = state.config.layers!.filter(l => l.year === 2026);
    expect(layers2026.length).toBe(2);
    // Background should be at the bottom (index 0)
    expect(layers2026[0].type).toBe('background');
    expect(layers2026[0].name).toBe('Background');
    // Raster should be at the top (index 1)
    expect(layers2026[1].type).toBe('raster');
    expect(layers2026[1].name).toBe('Painted'); // This one came from our mock payload

    // 3. Select the other year (2025)
    state = appReducer(state, {
      type: 'SET_ACTIVE_YEAR',
      payload: 2025
    });

    // Check layers for 2025
    const layers2025 = state.config.layers!.filter(l => l.year === 2025);
    expect(layers2025.length).toBe(2);
    expect(layers2025[0].type).toBe('background');
    expect(layers2025[0].name).toBe('Background');
    expect(layers2025[1].type).toBe('raster');
    expect(layers2025[1].name).toBe('Painted');
  });

  it('resets the state to initial configuration on RESET_TO_INITIAL', () => {
    const dirtyState: AppState = {
      config: {
        ...initialConfig,
        layers: [{ id: 'meme-1', name: '👾 Sus Astronaut', type: 'meme', visible: true, year: 2026, templateName: '👾 Sus Astronaut', x: 0, y: 0 }]
      },
      activeTool: 'pen',
      selectedLevel: 1,
      activeYear: 2025
    };

    const state = appReducer(dirtyState, {
      type: 'RESET_TO_INITIAL',
      payload: initialConfig
    });

    expect(state.config.layers!.length).toBeGreaterThan(0);
    expect(state.config.layers!.some(l => l.type === 'background')).toBe(true);
    expect(state.activeTool).toBe('pen');
    expect(state.selectedLevel).toBe(4);
    expect(state.activeYear).toBe(new Date().getFullYear());
  });

  it('does not paint, erase, or move if the layer is locked', () => {
    const originalState: AppState = {
      config: {
        ...initialConfig,
        layers: [
          { id: 'raster-2026', name: 'Painted', type: 'raster', visible: true, year: 2026, locked: true, data: { '2026-01-01': 3 } } as any,
          { id: 'meme-1', name: 'Meme', type: 'meme', visible: true, year: 2026, locked: true, templateName: '👾 Sus Astronaut', x: 5, y: 5 } as any
        ]
      },
      activeTool: 'pen',
      selectedLevel: 4,
      activeYear: 2026
    };

    // 1. Try Paint Cell
    const paintedState = appReducer(originalState, {
      type: 'PAINT_CELL',
      payload: { dateStr: '2026-01-01' }
    });
    expect((paintedState.config.layers![0] as any).data['2026-01-01']).toBe(3); // untouched

    // 2. Try Erase Cell
    const erasedState = appReducer(originalState, {
      type: 'ERASE_CELL',
      payload: { dateStr: '2026-01-01' }
    });
    expect((erasedState.config.layers![0] as any).data['2026-01-01']).toBe(3); // untouched

    // 3. Try Move Layer
    const movedState = appReducer(originalState, {
      type: 'MOVE_LAYER',
      payload: { layerId: 'meme-1', x: 10, y: 10 }
    });
    expect((movedState.config.layers![1] as any).x).toBe(5); // untouched
  });
});

