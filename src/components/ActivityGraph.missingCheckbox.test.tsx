// This test is expected to fail because the "Show art in orange" checkbox has been removed from the UI.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ActivityGraph } from './ActivityGraph';
import { AppState } from '../state/appReducer';

describe('ActivityGraph missing UI element', () => {
  it.skip('should still render the "Show art in Synth" checkbox (expected to fail)', () => {
    const mockState: AppState = {
      config: {
        repoUrl: '',
        startDate: '2024',
        endDate: '2024',
        layers: [],
        activeLayerId: null,
        showPaintedInOrange: false,
      },
      activeTool: 'move',
      selectedLevel: 4,
      activeYear: 2024,
    };

    render(
      <ActivityGraph state={mockState} dispatch={() => {}} onEditChange={() => {}} />
    );

    // This will throw if the element is not found, causing the test to fail.
    const checkbox = screen.getByLabelText(/Show art in Synth/i);
    expect(checkbox).toBeDefined();
  });
});
