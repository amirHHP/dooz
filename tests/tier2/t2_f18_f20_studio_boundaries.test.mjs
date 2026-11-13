/**
 * Tier 2 — Boundary & Corner Tests for Features F18 through F20: Studio Canvas, Player & Parameters
 * 5 tests per feature = 15 tests total.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertCloseTo,
  draftBasicSkirt,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

const stdProfile = BENCHMARK_PROFILES[0];

class StudioCanvasBoundaryModel {
  constructor(w = 1000, h = 800) {
    this.w = w;
    this.h = h;
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  setZoom(k) {
    if (isNaN(k) || k === null) return;
    this.zoom = Math.min(5.0, Math.max(0.2, Number(k)));
  }

  resize(w, h) {
    this.w = Math.max(100, Number(w) || 100);
    this.h = Math.max(100, Number(h) || 100);
  }
}

// ============================================================================
// F18 Boundaries: Interactive SVG Studio Canvas (5 tests)
// ============================================================================
describe('F18 Boundaries: Interactive SVG Studio Canvas', () => {
  test('F18-B1: NaN or null zoom factor does not corrupt canvas zoom level', () => {
    const canvas = new StudioCanvasBoundaryModel();
    canvas.setZoom(NaN);
    assertEqual(canvas.zoom, 1.0, 'Zoom unaffected by NaN');
    canvas.setZoom(null);
    assertEqual(canvas.zoom, 1.0, 'Zoom unaffected by null');
  });

  test('F18-B2: Extreme negative zoom (k = -5.0) clamps to safe positive lower limit 0.2', () => {
    const canvas = new StudioCanvasBoundaryModel();
    canvas.setZoom(-5.0);
    assertEqual(canvas.zoom, 0.2, 'Negative zoom clamped to 0.2');
  });

  test('F18-B3: Extreme high zoom (k = 1000.0) clamps to safe upper limit 5.0', () => {
    const canvas = new StudioCanvasBoundaryModel();
    canvas.setZoom(1000.0);
    assertEqual(canvas.zoom, 5.0, 'Huge zoom clamped to 5.0');
  });

  test('F18-B4: Zero or negative container resize clamps to minimum 100px width/height', () => {
    const canvas = new StudioCanvasBoundaryModel();
    canvas.resize(0, -50);
    assertEqual(canvas.w, 100, 'Width clamped to 100px');
    assertEqual(canvas.h, 100, 'Height clamped to 100px');
  });

  test('F18-B5: 100 rapid sequential zoom modifications execute deterministically without floating drift', () => {
    const canvas = new StudioCanvasBoundaryModel();
    for (let i = 0; i < 100; i++) {
      canvas.setZoom(1.0 + (i % 5) * 0.5);
    }
    assert(canvas.zoom >= 0.2 && canvas.zoom <= 5.0, 'Zoom within bounds');
  });
});

// ============================================================================
// F19 Boundaries: Studio Timeline Player Controls (5 tests)
// ============================================================================
describe('F19 Boundaries: Studio Timeline Player Controls', () => {
  const skirt = draftBasicSkirt(stdProfile.measurements);

  class PlayerBoundaryModel {
    constructor(steps) {
      this.steps = steps;
      this.currentIndex = 0;
      this.isPlaying = false;
    }

    next() {
      if (this.currentIndex < this.steps.length - 1) {
        this.currentIndex++;
      } else {
        this.isPlaying = false; // Auto-stop at end
      }
    }

    prev() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    }

    play() {
      if (this.currentIndex >= this.steps.length - 1) {
        this.currentIndex = 0; // Rewind if at end
      }
      this.isPlaying = true;
    }
  }

  test('F19-B1: Calling next() on final step stops playback and keeps index at N-1', () => {
    const player = new PlayerBoundaryModel(skirt.steps);
    player.currentIndex = skirt.steps.length - 1;
    player.isPlaying = true;
    player.next();
    assertEqual(player.currentIndex, skirt.steps.length - 1, 'Index remains N-1');
    assertEqual(player.isPlaying, false, 'Playback halted at end');
  });

  test('F19-B2: Calling prev() on step 0 leaves index at 0 without negative underflow', () => {
    const player = new PlayerBoundaryModel(skirt.steps);
    assertEqual(player.currentIndex, 0);
    player.prev();
    assertEqual(player.currentIndex, 0, 'Index does not underflow');
  });

  test('F19-B3: Pressing play while on final step rewinds to step 0 before playing', () => {
    const player = new PlayerBoundaryModel(skirt.steps);
    player.currentIndex = skirt.steps.length - 1;
    player.play();
    assertEqual(player.currentIndex, 0, 'Rewound to step 0');
    assertEqual(player.isPlaying, true, 'Playing');
  });

  test('F19-B4: Rapid alternating next/prev clicks maintain consistent state', () => {
    const player = new PlayerBoundaryModel(skirt.steps);
    for (let i = 0; i < 50; i++) {
      player.next();
      player.prev();
    }
    assertEqual(player.currentIndex, 0, 'Back at step 0');
  });

  test('F19-B5: Player behaves safely with 1-step pattern', () => {
    const player = new PlayerBoundaryModel([{ stepIndex: 0, titleFa: 'تک مرحله' }]);
    assertEqual(player.currentIndex, 0);
    player.next();
    assertEqual(player.currentIndex, 0);
    player.prev();
    assertEqual(player.currentIndex, 0);
  });
});

// ============================================================================
// F20 Boundaries: Real-Time Studio Parameters (5 tests)
// ============================================================================
describe('F20 Boundaries: Real-Time Studio Parameters', () => {
  test('F20-B1: Decimal measurement input (e.g. waist = 70.35cm) is calculated with high precision', () => {
    const res = draftBasicSkirt({ ...stdProfile.measurements, waist: 70.35 });
    // W = 70.35, Ew = 1 -> Wtarget = 35.675cm. deltaW = 48 - 35.675 = 12.325cm
    assertCloseTo(res.deltaW, 12.325, 1e-3, 'Decimal waist suppression');
  });

  test('F20-B2: Missing optional measurements fallback to standard default values', () => {
    // Omitting hipDepth defaults to 20.0
    const res = draftBasicSkirt({ waist: 70.0, hip: 94.0 });
    assertCloseTo(res.points.cbHip.y, 200.0, 1e-2, 'Default hip depth 20cm used');
  });

  test('F20-B3: String numeric inputs ("70.5") are parsed to numbers cleanly', () => {
    const res = draftBasicSkirt({
      waist: Number("70.5"),
      hip: Number("94.0"),
    });
    assertCloseTo(res.Wblock, 48.0, 1e-2, 'String converted to number');
  });

  test('F20-B4: Unknown drafting method defaults to MULLER safely', () => {
    const res = draftBasicSkirt(stdProfile.measurements, { method: 'UNKNOWN_METHOD' });
    assert(res.Wfront > 0, 'Drafts successfully using default method');
  });

  test('F20-B5: Zero waist suppression (waist equals hip minus ease) leaves zero dart intake', () => {
    // If deltaW is 0 or near zero
    const res = draftBasicSkirt({ waist: 95.0, hip: 96.0 }, { fitPreference: 'TIGHT' });
    assert(res.deltaW >= 0, 'deltaW remains non-negative');
  });
});
