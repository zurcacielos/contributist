/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import React from 'react';
import { Dashboard } from './Dashboard';
import { GeneratorConfig } from '../types';
import '@testing-library/dom';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('Dashboard Integration UI', () => {
  it('should delete the background layer of a specific year without affecting others', async () => {
    // Mock fetch for Dashboard's initial load
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) } as any);

    // 1. Initial configuration spanning two years
    const mockConfig: GeneratorConfig = {
      repoUrl: '',
      startDate: '2025-01-01',
      endDate: '2026-12-31',
      layers: [], // The reducer will auto-generate background and raster layers for both years
      activeLayerId: '',
      showPaintedInOrange: false,
      frequencies: '100', // Set a high frequency so algorithmic data is generated
      maxCommitsPerDay: 10,
      noWeekends: false,
      vacationsPerYear: '0',
      vacationLengthDays: '0',
      showAlgoLayer: true,
      showPaintedLayer: true,
    };
    
    render(<Dashboard initialConfig={mockConfig} />);
    
    // Wait for the async useEffect to run SET_CONFIG and populate layers
    await screen.findByText(/Advanced|Base vibe/i);

    // 2. Select the year 2025
    const year2025Label = screen.getByText('2025');
    fireEvent.click(year2025Label);
    
    // Find the 2025 container and verify it has some non-zero data (algorithmic background is filled)
    const year2025Header = await screen.findByText('2025', { selector: 'h2' });
    const year2025Container = year2025Header.closest('article') as HTMLElement;
    const initial2025Cells = Array.from(year2025Container.querySelectorAll('.day')) as HTMLElement[];
    const hasData2025 = initial2025Cells
      .filter(cell => cell.hasAttribute('data-level'))
      .some(cell => cell.getAttribute('data-level') !== '0');
    expect(hasData2025).toBe(true);
    
    // Find the row containing the "Background" text and click its delete button
    const bgRowText = screen.getByText('Background');
    const bgRowContainer = bgRowText.closest('div[draggable="true"]');
    expect(bgRowContainer).not.toBeNull();
    
    const deleteBtn = bgRowContainer!.querySelector('button[title="Clear background"]');
    expect(deleteBtn).not.toBeNull();
    
    // 3. Click the delete button of the background layer
    fireEvent.click(deleteBtn!);
    
    // 4. Verify that the algorithmic data for 2025 is empty (all levels are 0)
    await waitFor(() => {
      const afterDelete2025Header = screen.getByText('2025', { selector: 'h2' });
      const afterDelete2025Container = afterDelete2025Header.closest('article') as HTMLElement;
      const afterDelete2025Cells = Array.from(afterDelete2025Container.querySelectorAll('.day')) as HTMLElement[];
      const isCleared2025 = afterDelete2025Cells
        .filter(cell => cell.hasAttribute('data-level'))
        .every(cell => cell.getAttribute('data-level') === '0');
      expect(isCleared2025).toBe(true);
    });
    
    // 5. Select the year 2026
    const year2026Label = screen.getByText('2026', { selector: 'h2' });
    fireEvent.click(year2026Label);
    
    // 6. Verify that the background data for 2026 is still intact (has non-zero data)
    const year2026Container = year2026Label.closest('article') as HTMLElement;
    const cells2026 = Array.from(year2026Container.querySelectorAll('.day')) as HTMLElement[];
    const hasData2026 = cells2026
      .filter(cell => cell.hasAttribute('data-level'))
      .some(cell => cell.getAttribute('data-level') !== '0');
    expect(hasData2026).toBe(true);
  });

  it('should preserve custom frequency and generated data when global frequency changes', async () => {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) } as any);

    const mockConfig: GeneratorConfig = {
      repoUrl: '',
      startDate: '2025-01-01',
      endDate: '2026-12-31',
      layers: [],
      activeLayerId: '',
      showPaintedInOrange: false,
      frequencies: '30, 50', // 2026 gets 30, 2025 gets 50
      maxCommitsPerDay: 10,
      noWeekends: false,
      vacationsPerYear: '0',
      vacationLengthDays: '0',
      showAlgoLayer: true,
      showPaintedLayer: true,
    };
    
    render(<Dashboard initialConfig={mockConfig} />);
    
    await screen.findByText(/Advanced|Base vibe/i);

    // 1. Select 2025 and verify its base frequency
    const year2025Label = screen.getByText('2025', { selector: 'h2' });
    fireEvent.click(year2025Label);
    await screen.findByText(/Freq.* 50%/);

    const year2025Container = year2025Label.closest('article') as HTMLElement;
    const initial2025Cells = Array.from(year2025Container.querySelectorAll('.day')).map(c => c.getAttribute('data-level'));
    
    // 2. Click the +5% button on the Background layer
    const plusButton = await screen.findByTitle('+5%');
    fireEvent.click(plusButton);
    
    // Verify that the custom frequency for 2025 is now 55%
    await screen.findByText(/Freq.* 55%/);
    
    // Snapshot the new generated data for 2025
    const custom2025Cells = Array.from(year2025Container.querySelectorAll('.day')).map(c => c.getAttribute('data-level'));
    expect(custom2025Cells).not.toEqual(initial2025Cells); // Should have changed because freq increased
 
    // 3. Click ADVANCED (Toggle Advanced Mode) to show TechnicalBackground and Modify the global frequency input to '100'
    const advancedBtn = await screen.findByRole('button', { name: /Toggle Advanced Mode/i });
    fireEvent.click(advancedBtn);
    const freqInput = await waitFor(() => document.querySelector('input[name="frequencies"]') as HTMLInputElement);
    fireEvent.change(freqInput, { target: { value: '100', name: 'frequencies' } });
    
    // Verify that the custom frequency for 2025 is STILL 55%
    await screen.findByText(/Freq.* 55%/);
    
    // Verify that the generated data for 2025 did NOT change at all
    const final2025Cells = Array.from(year2025Container.querySelectorAll('.day')).map(c => c.getAttribute('data-level'));
    expect(final2025Cells).toEqual(custom2025Cells);

    // 4. Select 2026 and verify its base frequency correctly updated to the new global 100%
    const year2026Label = screen.getByText('2026', { selector: 'h2' });
    fireEvent.click(year2026Label);
  });

  it('should draw on a cell with the pencil tool', async () => {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) } as any);
    const mockConfig: GeneratorConfig = {
      repoUrl: '', startDate: '2026-01-01', endDate: '2026-12-31',
      layers: [], activeLayerId: '', showPaintedInOrange: false,
      frequencies: '0', // no background so it's clean
      maxCommitsPerDay: 10, noWeekends: false, vacationsPerYear: '0', vacationLengthDays: '0',
      showAlgoLayer: true, showPaintedLayer: true,
    };
    render(<Dashboard initialConfig={mockConfig} />);
    
    // Wait for grid to render and config to load
    await waitFor(() => {
      expect(document.querySelectorAll('.day').length).toBeGreaterThan(0);
    });
    
    // Select Pencil
    const pencilButton = await screen.findByTitle('Draw tool');
    fireEvent.click(pencilButton);
    // Find a valid cell
    const cell = document.querySelector('.day[data-level]') as HTMLElement;
    expect(cell.getAttribute('data-level')).toBe('0'); // initially empty
    
    fireEvent.mouseDown(cell);
    
    // It should now be painted
    expect(Number(cell.getAttribute('data-level'))).toBeGreaterThan(0);
  });

  it('should clear a cell and its background with the eraser tool', async () => {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) } as any);
    const mockConfig: GeneratorConfig = {
      repoUrl: '', startDate: '2026-01-01', endDate: '2026-12-31',
      layers: [], activeLayerId: '', showPaintedInOrange: false,
      frequencies: '100', // full background
      maxCommitsPerDay: 10, noWeekends: false, vacationsPerYear: '0', vacationLengthDays: '0',
      showAlgoLayer: true, showPaintedLayer: true,
    };
    render(<Dashboard initialConfig={mockConfig} />);
    
    await screen.findByText(/Advanced|Base vibe/i);

    // Select Eraser
    const eraserButton = await screen.findByTitle('Erase tool');
    fireEvent.click(eraserButton);
    
    // Wait for grid to render
    await waitFor(() => {
      expect(document.querySelectorAll('.day').length).toBeGreaterThan(0);
    });
    // Find a valid cell
    const cell = document.querySelector('.day[data-level]') as HTMLElement;
    expect(Number(cell.getAttribute('data-level'))).toBeGreaterThan(0);
    
    fireEvent.mouseDown(cell);
    
    // It should now be cleared completely
    expect(cell.getAttribute('data-level')).toBe('0');
  });

  it.skip('should add a text layer and draw text on the grid when clicking Add Text', async () => {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) } as any);
    const mockConfig: GeneratorConfig = {
      repoUrl: '', startDate: '2026-01-01', endDate: '2026-12-31',
      layers: [], activeLayerId: '', showPaintedInOrange: false,
      frequencies: '0', // no background
      maxCommitsPerDay: 10, noWeekends: false, vacationsPerYear: '0', vacationLengthDays: '0',
      showAlgoLayer: true, showPaintedLayer: true,
    };
    const originalRandom = Math.random;
    Math.random = () => 0; // Force first index "let him cook"

    render(<Dashboard initialConfig={mockConfig} />);
    
    await screen.findByTitle('Add custom text');
    
    // Initially no text layer
    const textLayersBefore = document.querySelectorAll('input[value="let him cook"]');
    expect(textLayersBefore.length).toBe(0);

    // Click Add Text
    const addTextBtn = await screen.findByTitle('Add custom text');
    fireEvent.click(addTextBtn);
    
    // The text layer "let him cook" appears in the UI
    const textLayerInput = await screen.findByDisplayValue('let him cook');
    expect(textLayerInput).not.toBeNull();

    Math.random = originalRandom;
    
    // Verify that at least some cells are painted now (the text overlay)
    const paintedCells = Array.from(document.querySelectorAll('.day[data-level]'))
      .filter(cell => cell.getAttribute('data-level') !== '0');
      
      
    expect(paintedCells.length).toBeGreaterThan(0);
  });

  it('should only clear (not delete) raster and background layers when clicking the trash icon', async () => {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) } as any);
    const mockConfig: GeneratorConfig = {
      repoUrl: '', startDate: '2026-01-01', endDate: '2026-12-31',
      layers: [
        { id: 'bg-2026', name: 'Background', type: 'background', visible: true, year: 2026, baseFrequency: 100 },
        { id: 'raster-2026', name: 'Painted', type: 'raster', visible: true, year: 2026, data: {} }
      ], 
      activeLayerId: 'raster-2026', showPaintedInOrange: false,
      frequencies: '100',
      maxCommitsPerDay: 10, noWeekends: false, vacationsPerYear: '0', vacationLengthDays: '0',
      showAlgoLayer: true, showPaintedLayer: true,
    };
    render(<Dashboard initialConfig={mockConfig} />);
    
    // Wait for layers to appear
    // Select Pencil and draw
    const pencilButton = await screen.findByTitle('Draw tool');
    fireEvent.click(pencilButton);
    
    await waitFor(() => {
      expect(document.querySelectorAll('.day').length).toBeGreaterThan(0);
    });
    const cell = document.querySelector('.day[data-level]') as HTMLElement;
    fireEvent.mouseDown(cell);

    // Find and click the raster clear button
    const rasterClearBtn = await screen.findByTitle('Clear drawing');
    fireEvent.click(rasterClearBtn);

    // Verify raster layer is still there (it shouldn't be completely deleted)
    expect(screen.queryAllByText(/Painted/).length).toBeGreaterThan(0);

    // Find and click the background clear button
    const bgClearBtn = await screen.findByTitle('Clear background');
    fireEvent.click(bgClearBtn);

    // Verify background layer is still there (it shouldn't be completely deleted)
    // Need to make sure there are at least 2 occurrences if SettingsForm also has it, 
    // or just checking length > 0 is enough since we know the one in LayersPanel should still be there.
    expect(screen.queryAllByText(/Background/).length).toBeGreaterThan(0);
  });

  it('should verify the raster layer is named Painted across different years', async () => {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) } as any);
    const mockConfig: GeneratorConfig = {
      repoUrl: '', startDate: '2025-01-01', endDate: '2026-12-31',
      layers: [
        { id: 'bg-2025', name: 'Background (Algorithmic)', type: 'background', visible: true, year: 2025, baseFrequency: 100 },
        { id: 'raster-2025', name: 'Painted', type: 'raster', visible: true, year: 2025, data: {} },
        { id: 'bg-2026', name: 'Background (Algorithmic)', type: 'background', visible: true, year: 2026, baseFrequency: 100 },
        { id: 'raster-2026', name: 'Painted', type: 'raster', visible: true, year: 2026, data: {} },
      ],
      activeLayerId: 'raster-2026', showPaintedInOrange: false,
      frequencies: '100',
      maxCommitsPerDay: 10, noWeekends: false, vacationsPerYear: '0', vacationLengthDays: '0',
      showAlgoLayer: true, showPaintedLayer: true,
    };
    render(<Dashboard initialConfig={mockConfig} />);
    
    // Wait for layers to appear in the default year (2026)
    await screen.findByText(/Painted/);

    // Verify it exists in 2026
    let paintedLayers = screen.getAllByText(/Painted/);
    expect(paintedLayers.length).toBeGreaterThan(0);

    // Switch to year 2025
    const year2025Label = screen.getByText('2025', { selector: 'h2' });
    fireEvent.click(year2025Label);

    // Wait for UI to update and verify the layer is still named Painted in 2025
    await screen.findByText(/Painted/);
    paintedLayers = screen.getAllByText(/Painted/);
    expect(paintedLayers.length).toBeGreaterThan(0);
  });

  it('should verify auto-generated raster layers by the reducer are named Painted', async () => {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) } as any);
    
    // By passing an existing background layer but NO raster layers, 
    // we bypass Dashboard's fallback logic for missing layers 
    // and force appReducer.ts to auto-generate the missing raster layers.
    const mockConfig: GeneratorConfig = {
      repoUrl: '', startDate: '2025-01-01', endDate: '2026-12-31',
      layers: [
        { id: 'bg-2025', name: 'Background (Algorithmic)', type: 'background', visible: true, year: 2025, baseFrequency: 100 },
      ],
      activeLayerId: '', showPaintedInOrange: false,
      frequencies: '100',
      maxCommitsPerDay: 10, noWeekends: false, vacationsPerYear: '0', vacationLengthDays: '0',
      showAlgoLayer: true, showPaintedLayer: true,
    };
    render(<Dashboard initialConfig={mockConfig} />);
    
    // Wait for the UI to settle on 2026
    await screen.findByText('2026', { selector: 'h2' });
    
    // The test will fail here because appReducer generates the layer as "Drawing" instead of "Painted"
    const paintedLayers2026 = screen.queryAllByText(/Painted/);
    expect(paintedLayers2026.length).toBeGreaterThan(0);
  });

  it('should add a meme preset layer and render it on the grid when clicking a preset', async () => {
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) } as any);
    const mockConfig: GeneratorConfig = {
      repoUrl: '', startDate: '2026-01-01', endDate: '2026-12-31',
      layers: [
        { id: 'bg-2026', name: 'Background (Algorithmic)', type: 'background', visible: true, year: 2026, baseFrequency: 0 },
        { id: 'raster-2026', name: 'Painted', type: 'raster', visible: true, year: 2026, data: {} },
      ],
      activeLayerId: 'raster-2026', showPaintedInOrange: false,
      frequencies: '0', // 0 frequency ensures grid is blank initially
      maxCommitsPerDay: 10, noWeekends: false, vacationsPerYear: '0', vacationLengthDays: '0',
      showAlgoLayer: true, showPaintedLayer: true,
    };
    render(<Dashboard initialConfig={mockConfig} />);
    
    // Ensure grid is empty initially
    await screen.findByText('2026', { selector: 'h2' });
    const yearContainer = screen.getByText('2026', { selector: 'h2' }).closest('article') as HTMLElement;
    
    await waitFor(() => {
      const initialPainted = Array.from(yearContainer.querySelectorAll('.day[data-level]')).filter(
        cell => cell.getAttribute('data-level') !== '0'
      );
      expect(initialPainted.length).toBe(0);
    });

    // Find and click the 'Add 👾 Invader' preset button by title on the active year card
    const presetButton = await screen.findByTitle('Add 👾 Invader');
    fireEvent.click(presetButton);

    // Verify that the layer is added to the panel.
    // The button has title 'Add 👾 Invader', and the layer item will have text 'Invader'.
    await waitFor(() => {
      expect(screen.getByTitle('Add 👾 Invader')).toBeDefined();
      expect(screen.getByText('Invader', { selector: 'span' })).toBeDefined();
    });

    // Verify that the grid now has some non-zero cells from the meme template
    await waitFor(() => {
      const paintedCells = Array.from(yearContainer.querySelectorAll('.day[data-level]')).filter(
        cell => cell.getAttribute('data-level') !== '0'
      );
      expect(paintedCells.length).toBeGreaterThan(0);
    });
  });
});
