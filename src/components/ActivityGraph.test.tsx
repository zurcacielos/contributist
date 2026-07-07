/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ActivityGraph } from './ActivityGraph';
import { AppState } from '../state/appReducer';
import '@testing-library/dom';

describe('ActivityGraph UI', () => {
  it.skip('should render the "Show art in Synth" checkbox', () => {
    const mockState: AppState = {
      ui: {
        activeLayerId: null,
        showPaintedInOrange: false,
      },
      activeTool: 'move',
      selectedLevel: 4,
      activeYear: 2026,
    } as any;
    
    render(<ActivityGraph state={mockState} dispatch={() => {}} onEditChange={() => {}} />);
    
    const checkbox = screen.getByLabelText(/Show art in Synth/i);
    expect(checkbox).toBeDefined();

    // Verify it's inside a label with synth gradient text
    const label = checkbox.closest('label');
    expect(label).toBeDefined();
    const span = label?.querySelector('span');
    expect(span).toBeDefined();
    expect(span?.style.background).toContain('linear-gradient');
  });
});
