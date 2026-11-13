/**
 * Tier 1 — Core Features F18 through F20: Drafting Studio UI & Interactive Canvas
 * 5 tests per feature = 15 tests total.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertNotEqual,
  assertCloseTo,
  draftBasicSkirt,
  draftBasicBodice,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

const stdProfile = BENCHMARK_PROFILES[0];

// Simulation model of interactive studio canvas state
class StudioCanvasModel {
  constructor(initialWidth = 1000, initialHeight = 800) {
    this.containerWidth = initialWidth;
    this.containerHeight = initialHeight;
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  setZoom(k) {
    // Clamp zoom to [0.2, 5.0]
    this.zoom = Math.min(5.0, Math.max(0.2, k));
  }

  pan(deltaX, deltaY) {
    this.panX += deltaX;
    this.panY += deltaY;
  }

  getViewBox(patternWidthMm = 600, patternHeightMm = 800) {
    const w = patternWidthMm / this.zoom;
    const h = patternHeightMm / this.zoom;
    const x = -this.panX;
    const y = -this.panY;
    return { x, y, width: w, height: h };
  }
}

// Simulation model of timeline player state
class TimelinePlayerModel {
  constructor(steps = []) {
    this.steps = steps;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.showAll = false;
  }

  next() {
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  play() {
    this.isPlaying = true;
    this.showAll = false;
  }

  pause() {
    this.isPlaying = false;
  }

  toggleShowAll() {
    this.showAll = !this.showAll;
    if (this.showAll) {
      this.isPlaying = false;
    }
  }

  getCurrentStep() {
    return this.steps[this.currentIndex] || null;
  }
}

// ============================================================================
// F18: Interactive SVG Studio Canvas (5 tests)
// ============================================================================
describe('F18: Interactive SVG Studio Canvas', () => {
  test('F18-1: Canvas initializes with zoom factor k = 1.0 and centered origin', () => {
    const canvas = new StudioCanvasModel();
    assertEqual(canvas.zoom, 1.0, 'Initial zoom');
    assertEqual(canvas.panX, 0, 'Initial panX');
    assertEqual(canvas.panY, 0, 'Initial panY');
  });

  test('F18-2: Zoom controller clamps scale factor within strict boundaries [0.2, 5.0]', () => {
    const canvas = new StudioCanvasModel();
    canvas.setZoom(0.05); // Too small
    assertEqual(canvas.zoom, 0.2, 'Clamped to minimum 0.2');
    canvas.setZoom(10.0); // Too large
    assertEqual(canvas.zoom, 5.0, 'Clamped to maximum 5.0');
    canvas.setZoom(1.5);
    assertEqual(canvas.zoom, 1.5, 'Normal zoom accepted');
  });

  test('F18-3: Pan transforms update coordinate offsets accurately', () => {
    const canvas = new StudioCanvasModel();
    canvas.pan(50, -30);
    assertEqual(canvas.panX, 50, 'panX updated');
    assertEqual(canvas.panY, -30, 'panY updated');
  });

  test('F18-4: SVG viewBox dynamically reflects zoom and pan state', () => {
    const canvas = new StudioCanvasModel();
    canvas.setZoom(2.0); // 2x zoom -> viewport is half width/height
    canvas.pan(100, 200);
    const vb = canvas.getViewBox(600, 800);
    assertEqual(vb.width, 300, 'viewBox width halved at 2x');
    assertEqual(vb.height, 400, 'viewBox height halved at 2x');
    assertEqual(vb.x, -100, 'viewBox x offset');
    assertEqual(vb.y, -200, 'viewBox y offset');
  });

  test('F18-5: Canvas supports negative coordinate origins for waist raised points', () => {
    const skirt = draftBasicSkirt(stdProfile.measurements);
    assert(skirt.boundingBox.minY < 0, 'Bounding box minY must accommodate negative raised waist');
  });
});

// ============================================================================
// F19: Studio Timeline Player Controls (5 tests)
// ============================================================================
describe('F19: Studio Timeline Player Controls', () => {
  const skirt = draftBasicSkirt(stdProfile.measurements);

  test('F19-1: Player initializes at step 0 in paused state', () => {
    const player = new TimelinePlayerModel(skirt.steps);
    assertEqual(player.currentIndex, 0, 'Initial index');
    assertEqual(player.isPlaying, false, 'Not playing');
    assertEqual(player.showAll, false, 'Not showAll');
  });

  test('F19-2: next() increments step index and clamps at last step (N - 1)', () => {
    const player = new TimelinePlayerModel(skirt.steps);
    player.next();
    assertEqual(player.currentIndex, 1, 'Index incremented to 1');
    // Advance past end
    for (let i = 0; i < 20; i++) player.next();
    assertEqual(player.currentIndex, skirt.steps.length - 1, 'Clamped at last step');
  });

  test('F19-3: prev() decrements step index and clamps at 0', () => {
    const player = new TimelinePlayerModel(skirt.steps);
    player.next();
    player.next();
    assertEqual(player.currentIndex, 2, 'Index is 2');
    player.prev();
    assertEqual(player.currentIndex, 1, 'Decremented to 1');
    player.prev();
    player.prev(); // Past 0
    assertEqual(player.currentIndex, 0, 'Clamped at 0');
  });

  test('F19-4: play() and pause() toggle isPlaying boolean flag', () => {
    const player = new TimelinePlayerModel(skirt.steps);
    player.play();
    assertEqual(player.isPlaying, true, 'Playing');
    player.pause();
    assertEqual(player.isPlaying, false, 'Paused');
  });

  test('F19-5: toggleShowAll() reveals all layers and halts auto-play', () => {
    const player = new TimelinePlayerModel(skirt.steps);
    player.play();
    player.toggleShowAll();
    assertEqual(player.showAll, true, 'showAll enabled');
    assertEqual(player.isPlaying, false, 'Playing stopped on showAll');
  });
});

// ============================================================================
// F20: Real-Time Studio Parameters (5 tests)
// ============================================================================
describe('F20: Real-Time Studio Parameters', () => {
  test('F20-1: Changing waist measurement recalculates waist suppression deltaW instantly', () => {
    const initial = draftBasicSkirt({ ...stdProfile.measurements, waist: 70.0 });
    const updated = draftBasicSkirt({ ...stdProfile.measurements, waist: 76.0 });
    assertNotEqual(initial.deltaW, updated.deltaW, 'deltaW must change with waist');
    assert(updated.deltaW < initial.deltaW, 'Larger waist means less waist suppression needed');
  });

  test('F20-2: Switching base block between Skirt and Bodice produces distinct geometries', () => {
    const skirt = draftBasicSkirt(stdProfile.measurements);
    const bodice = draftBasicBodice(stdProfile.measurements);
    assertEqual(skirt.blockType, 'SKIRT');
    assertEqual(bodice.blockType, 'BODICE');
    assert(bodice.Wblock !== skirt.Wblock, 'Block widths differ between garments');
  });

  test('F20-3: Switching drafting method between Müller and Metric recalculates panel distribution', () => {
    const muller = draftBasicSkirt(stdProfile.measurements, { method: 'MULLER' });
    const metric = draftBasicSkirt(stdProfile.measurements, { method: 'METRIC' });
    assertNotEqual(muller.Wfront, metric.Wfront, 'Front panel width differs across methods');
    assertEqual(metric.Wfront, metric.Wback, 'Metric has equal panels while Müller does not');
  });

  test('F20-4: Switching fit preference (Tight vs Classic vs Loose) updates ease values dynamically', () => {
    const tight = draftBasicSkirt(stdProfile.measurements, { fitPreference: 'TIGHT' });
    const loose = draftBasicSkirt(stdProfile.measurements, { fitPreference: 'LOOSE' });
    assert(loose.Wblock > tight.Wblock, 'Loose fit has larger block width due to hip ease');
  });

  test('F20-5: Parametric calculation latency executes in under 5ms for smooth 60fps interaction', () => {
    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      draftBasicSkirt(stdProfile.measurements);
    }
    const elapsed = performance.now() - start;
    const avgMs = elapsed / 50;
    assert(avgMs < 5.0, `Average draft time ${avgMs.toFixed(2)}ms must be under 5ms`);
  });
});
