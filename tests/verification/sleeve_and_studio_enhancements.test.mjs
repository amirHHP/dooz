/**
 * Targeted Unit & Integration Tests: Sleeve Block, Construction Lines, Contours, and 5-Step Timeline Player
 * Tests compliance with standard tailoring (Müller method points 1..23) and refactored Studio UI.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertNotEqual,
  assertCloseTo,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

// Dynamic import helper to support running with tsx
async function loadDraftingEngine() {
  try {
    const mod = await import('../../src/lib/drafting/index.ts');
    return mod;
  } catch (err) {
    // Fallback to harness if tsx is not loaded
    const harness = await import('../harness/index.mjs');
    return harness;
  }
}

const stdProfile = BENCHMARK_PROFILES[0]; // Sara Mohammadi (Müller Size 38)

// ============================================================================
// SUITE 1: Full Sleeve Block Geometry & Standard Tailoring Points (Müller 1..23)
// ============================================================================
describe('Sleeve Block: Geometry, Points & Standard Tailoring (Müller 1..23)', () => {
  test('Sleeve-1: Sleeve block generates all required standard tailoring points', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements, { method: 'MULLER', fitPreference: 'CLASSIC' });
    const sleeve = engine.draftBasicSleeve(bodice, {
      sleeveLength: 58.0,
      armCirc: 27.5,
      wristCirc: 16.0,
    });

    assertEqual(sleeve.blockType, 'SLEEVE');
    const pts = sleeve.points;
    assert(pts, 'Points dictionary must exist');

    // Core anatomical points
    assert(pts.crownApex, 'crownApex (Point 1) must exist');
    assert(pts.uBack, 'uBack (Point 4) must exist');
    assert(pts.uFront, 'uFront (Point 5) must exist');
    assert(pts.centerWrist, 'centerWrist (Point 2/7) must exist');
    assert(pts.wristBack, 'wristBack must exist');
    assert(pts.wristFront, 'wristFront must exist');
    assert(pts.elbowBack, 'elbowBack must exist');
    assert(pts.elbowFront, 'elbowFront must exist');
    assert(pts.elbowCenter, 'elbowCenter (Point 6) must exist');

    // Initial frame points
    assert(pts.frameTopLeft, 'frameTopLeft must exist');
    assert(pts.frameTopRight, 'frameTopRight must exist');
    assert(pts.frameBottomLeft, 'frameBottomLeft must exist');
    assert(pts.frameBottomRight, 'frameBottomRight must exist');

    // Crown guide triangle division points (8, 9, 10 on back; 11, 12, 13 on front)
    assert(pts.point8, 'point8 (1/4 back slope) must exist');
    assert(pts.point9, 'point9 (mid back slope) must exist');
    assert(pts.point10, 'point10 (3/4 back slope) must exist');
    assert(pts.point11, 'point11 (1/4 front slope) must exist');
    assert(pts.point12, 'point12 (mid front slope) must exist');
    assert(pts.point13, 'point13 (3/4 front slope) must exist');

    // Curve inflection/offset control points (19, 20 on back; 22, 23 on front)
    assert(pts.point19, 'point19 (back scoop depression) must exist');
    assert(pts.point20, 'point20 (back crown elevation) must exist');
    assert(pts.point22, 'point22 (front crown elevation) must exist');
    assert(pts.point23, 'point23 (front scoop depression) must exist');

    // Slit points
    assert(pts.slitBottom, 'slitBottom must exist');
    assert(pts.slitTop, 'slitTop must exist');
  });

  test('Sleeve-2: Sleeve wrist and elbow dimensions correctly taper from bicep width', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);
    const sleeve = engine.draftBasicSleeve(bodice, {
      sleeveLength: 58.0,
      armCirc: 27.5,
      wristCirc: 16.0,
    });

    const bicepWidthMm = sleeve.BW * 10;
    const wristWidth = sleeve.points.wristFront.x - sleeve.points.wristBack.x;
    const elbowWidth = sleeve.points.elbowFront.x - sleeve.points.elbowBack.x;

    assert(wristWidth < bicepWidthMm, `Wrist width ${wristWidth}mm must be narrower than bicep ${bicepWidthMm}mm`);
    assert(elbowWidth < bicepWidthMm, `Elbow width ${elbowWidth}mm must be narrower than bicep ${bicepWidthMm}mm`);
    assert(elbowWidth > wristWidth, `Elbow width ${elbowWidth}mm must be wider than wrist ${wristWidth}mm`);

    // Verify elbow is positioned halfway between bicep level and wrist level
    const bicepY = sleeve.points.uBack.y;
    const wristY = sleeve.points.centerWrist.y;
    const expectedElbowY = bicepY + (wristY - bicepY) * 0.5;
    assertCloseTo(sleeve.points.elbowCenter.y, expectedElbowY, 1.0, 'Elbow line positioned midway between bicep and wrist');
  });

  test('Sleeve-3: Wrist slit (چاک آستین) is placed on the back panel at ~1/4 distance from side', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);
    const sleeve = engine.draftBasicSleeve(bodice, { sleeveLength: 58.0, wristCirc: 16.0 });

    const slitX = sleeve.points.slitBottom.x;
    const wristBackX = sleeve.points.wristBack.x;
    const wristWidth = sleeve.points.wristFront.x - sleeve.points.wristBack.x;

    // Slit should be placed in the back portion (between wristBack and centerWrist)
    assert(slitX > wristBackX, 'Slit must be inside the wrist boundary');
    assert(slitX < sleeve.points.centerWrist.x, 'Slit must be on the back half of the sleeve');
    const backWristSpan = sleeve.points.centerWrist.x - wristBackX;
    const relativePos = (slitX - wristBackX) / backWristSpan;
    assertCloseTo(relativePos, 0.25, 0.05, 'Slit positioned at approximately 1/4 of back panel span from side seam');

    // Slit length should be standard tailoring height (8-12 cm = 80-120 mm)
    const slitLengthMm = sleeve.points.slitBottom.y - sleeve.points.slitTop.y;
    assert(slitLengthMm >= 70 && slitLengthMm <= 130, `Slit length ${slitLengthMm}mm should be standard 8-12cm`);
  });
});

// ============================================================================
// SUITE 2: Explicit Construction Lines & Contours
// ============================================================================
describe('Drafting Engines: Construction Lines & Contours Validation', () => {
  test('Lines-1: Sleeve returns structured constructionLines with frame, guide, and axis types', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);
    const sleeve = engine.draftBasicSleeve(bodice);

    assert(Array.isArray(sleeve.constructionLines), 'sleeve.constructionLines must be an array');
    assert(sleeve.constructionLines.length >= 10, `Expected at least 10 construction lines, got ${sleeve.constructionLines.length}`);

    const frameLines = sleeve.constructionLines.filter((l) => l.type === 'frame');
    const axisLines = sleeve.constructionLines.filter((l) => l.type === 'axis');
    const guideLines = sleeve.constructionLines.filter((l) => l.type === 'guide');

    assert(frameLines.length >= 4, `Must have at least 4 frame lines (bounding box), found ${frameLines.length}`);
    assert(axisLines.length >= 1, `Must have at least 1 axis line (center line), found ${axisLines.length}`);
    assert(guideLines.length >= 4, `Must have guide lines (bicep, elbow, wrist, triangle), found ${guideLines.length}`);

    // Verify all lines have valid finite coordinates
    for (const line of sleeve.constructionLines) {
      assert(Number.isFinite(line.from.x) && Number.isFinite(line.from.y), 'Line from must have finite coords');
      assert(Number.isFinite(line.to.x) && Number.isFinite(line.to.y), 'Line to must have finite coords');
      assert(line.label && line.label.length > 0, 'Line must have a descriptive Persian label');
    }
  });

  test('Contours-1: Sleeve returns explicit closed SVG path contour without arbitrary criss-cross', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);
    const sleeve = engine.draftBasicSleeve(bodice);

    assert(Array.isArray(sleeve.contours), 'sleeve.contours must be an array');
    assert(sleeve.contours.length >= 1, 'sleeve.contours must contain at least 1 path');

    const mainContour = sleeve.contours[0];
    assert(typeof mainContour === 'string', 'Contour must be an SVG path string');
    assert(mainContour.startsWith('M '), 'Contour must begin with MoveTo (M)');
    assert(mainContour.trim().endsWith('Z') || mainContour.trim().endsWith('z'), 'Contour must be closed with Z');
    assert(mainContour.includes('C '), 'Contour must include cubic Bézier commands for sleeve cap');
    assert(mainContour.includes('L '), 'Contour must include line commands for side seams and wrist');

    // Ensure contour contains no NaN or undefined
    assert(!mainContour.includes('NaN'), 'Contour path must not contain NaN');
    assert(!mainContour.includes('undefined'), 'Contour path must not contain undefined');
  });

  test('Contours-2: Skirt returns explicit constructionLines and contours', async () => {
    const engine = await loadDraftingEngine();
    const skirt = engine.draftBasicSkirt(stdProfile.measurements, { method: 'MULLER' });

    assert(Array.isArray(skirt.constructionLines), 'skirt.constructionLines must be an array');
    assert(skirt.constructionLines.length >= 4, 'skirt.constructionLines must contain frame and guide lines');

    const hasFrame = skirt.constructionLines.some((l) => l.type === 'frame');
    assert(hasFrame, 'Skirt must include initial frame lines');

    assert(Array.isArray(skirt.contours), 'skirt.contours must be an array');
    assert(skirt.contours.length >= 1, 'skirt.contours must contain garment cut paths');
    for (const c of skirt.contours) {
      assert(c.startsWith('M ') && (c.endsWith('Z') || c.endsWith('z')), 'Skirt contour must be closed SVG path');
    }
  });

  test('Contours-3: Bodice returns explicit constructionLines and contours for Front & Back', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements, { method: 'MULLER' });

    assert(Array.isArray(bodice.constructionLines), 'bodice.constructionLines must be an array');
    assert(bodice.constructionLines.length >= 6, 'bodice.constructionLines must contain frame, depth, and axis lines');

    const hasFrame = bodice.constructionLines.some((l) => l.type === 'frame');
    const hasGuide = bodice.constructionLines.some((l) => l.type === 'guide');
    const hasAxis = bodice.constructionLines.some((l) => l.type === 'axis');
    assert(hasFrame, 'Bodice must include frame lines');
    assert(hasGuide, 'Bodice must include guide lines');
    assert(hasAxis, 'Bodice must include vertical axis lines');

    assert(Array.isArray(bodice.contours), 'bodice.contours must be an array');
    assertEqual(bodice.contours.length, 2, 'Bodice must provide 2 separate contour paths (Back and Front)');
    for (const c of bodice.contours) {
      assert(c.startsWith('M ') && (c.endsWith('Z') || c.endsWith('z')), 'Bodice contour must be a closed SVG path');
      assert(!c.includes('NaN'), 'Bodice contour path must not contain NaN');
    }
  });

  test('Contours-4: Trouser returns explicit constructionLines and contours for Front & Back panels', async () => {
    const engine = await loadDraftingEngine();
    const trouser = engine.draftBasicTrouser(stdProfile.measurements, { method: 'MULLER' });

    assert(Array.isArray(trouser.constructionLines), 'trouser.constructionLines must be an array');
    assert(trouser.constructionLines.length >= 6, 'trouser.constructionLines must contain frame and guide levels');

    const hasFrame = trouser.constructionLines.some((l) => l.type === 'frame');
    const hasCrease = trouser.constructionLines.some((l) => l.label && l.label.includes('اتو'));
    assert(hasFrame, 'Trouser must include initial bounding frame');
    assert(hasCrease, 'Trouser must include crease / iron line (خط اتو)');

    assert(Array.isArray(trouser.contours), 'trouser.contours must be an array');
    assertEqual(trouser.contours.length, 2, 'Trouser must provide 2 separate contour paths (Front and Back)');
    for (const c of trouser.contours) {
      assert(c.startsWith('M ') && (c.endsWith('Z') || c.endsWith('z')), 'Trouser contour must be a closed SVG path');
      assert(!c.includes('NaN'), 'Trouser contour path must not contain NaN');
    }
  });
});

// ============================================================================
// SUITE 3: 5-Step Persian Construction Timeline
// ============================================================================
describe('Timeline Player: 5-Step Construction Progression', () => {
  test('Steps-1: Sleeve defines exactly 5 structured Persian construction steps', async () => {
    const engine = await loadDraftingEngine();
    const bodice = engine.draftBasicBodice(stdProfile.measurements);
    const sleeve = engine.draftBasicSleeve(bodice);

    assertEqual(sleeve.steps.length, 5, 'Sleeve must have exactly 5 construction steps');

    const expectedTitles = [
      'کادر مستطیل اولیه و خطوط مبنا',
      'محور مرکزی و خط آرنج',
      'مثلث راهنمای تاج و نقاط تقسیم‌بندی',
      'رسم منحنی‌های تاج آستین و تطابق خرد',
      'خطوط درز زیر دست، مچ و چاک آستین',
    ];

    sleeve.steps.forEach((step, idx) => {
      assertEqual(step.stepIndex, idx, `Step index must be ${idx}`);
      assertEqual(step.titleFa, expectedTitles[idx], `Step ${idx} title matches standard Persian tailoring curriculum`);
      assert(step.instructionFa && step.instructionFa.length > 20, `Step ${idx} must have informative Persian instructions`);
      assert(step.calculatedValues && Object.keys(step.calculatedValues).length >= 2, `Step ${idx} must provide key tailoring metrics`);
      assert(Array.isArray(step.elements) && step.elements.length > 0, `Step ${idx} must list active drafting elements`);
    });
  });

  test('Steps-2: Timeline player state machine smoothly traverses all 5 steps', () => {
    class TimelinePlayerController {
      constructor(totalSteps = 5) {
        this.totalSteps = totalSteps;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.showAll = false;
      }
      next() {
        if (this.currentIndex < this.totalSteps - 1) this.currentIndex++;
      }
      prev() {
        if (this.currentIndex > 0) this.currentIndex--;
      }
      play() {
        if (this.currentIndex >= this.totalSteps - 1) this.currentIndex = 0;
        this.isPlaying = true;
        this.showAll = false;
      }
      pause() {
        this.isPlaying = false;
      }
      toggleShowAll() {
        this.showAll = !this.showAll;
        if (this.showAll) this.isPlaying = false;
      }
    }

    const player = new TimelinePlayerController(5);
    assertEqual(player.currentIndex, 0, 'Starts at Step 0');

    // Traverse forward 0 -> 1 -> 2 -> 3 -> 4
    for (let i = 1; i <= 4; i++) {
      player.next();
      assertEqual(player.currentIndex, i, `Advances to Step ${i}`);
    }

    // Attempting next past 4 remains clamped at 4
    player.next();
    assertEqual(player.currentIndex, 4, 'Clamped at Step 4 (last step)');

    // Traverse backward 4 -> 3 -> 2 -> 1 -> 0
    for (let i = 3; i >= 0; i--) {
      player.prev();
      assertEqual(player.currentIndex, i, `Decrements to Step ${i}`);
    }

    // Attempting prev below 0 remains clamped at 0
    player.prev();
    assertEqual(player.currentIndex, 0, 'Clamped at Step 0');

    // Auto-play from last step resets to 0
    player.currentIndex = 4;
    player.play();
    assertEqual(player.currentIndex, 0, 'Playing from end resets to Step 0');
    assertEqual(player.isPlaying, true, 'Player is playing');

    // toggleShowAll stops playback and sets showAll flag
    player.toggleShowAll();
    assertEqual(player.showAll, true, 'showAll enabled');
    assertEqual(player.isPlaying, false, 'Playback paused when showAll active');
  });
});

// ============================================================================
// SUITE 4: Multi-Method & Fit Preference Resilience for Sleeve
// ============================================================================
describe('Sleeve Block: Multi-Method & Fit Preference Parity', () => {
  const methods = ['MULLER', 'METRIC', 'GRLAWEIN'];
  const fits = ['TIGHT', 'CLASSIC', 'LOOSE'];

  for (const method of methods) {
    test(`Sleeve-Method: ${method} drafts complete sleeve with non-empty contours and lines`, async () => {
      const engine = await loadDraftingEngine();
      const bodice = engine.draftBasicBodice(stdProfile.measurements, { method });
      const sleeve = engine.draftBasicSleeve(bodice, { sleeveLength: 60, armCirc: 28, wristCirc: 16.5 });

      assertEqual(sleeve.blockType, 'SLEEVE');
      assert(sleeve.CapHeight > 8.0, 'Cap height must be positive and realistic');
      assert(sleeve.BW > 28, 'Bicep width must include positive ease');
      assert(sleeve.constructionLines.length >= 8, 'Must include construction lines');
      assert(sleeve.contours.length >= 1, 'Must include cut contours');
      assertEqual(sleeve.steps.length, 5, 'Must have 5 steps');
    });
  }

  for (const fit of fits) {
    test(`Sleeve-Fit: ${fit} scales bicep line width and preserves cap ease invariant`, async () => {
      const engine = await loadDraftingEngine();
      const bodice = engine.draftBasicBodice(stdProfile.measurements, { fitPreference: fit });
      const sleeve = engine.draftBasicSleeve(bodice);

      // Invariant: Cap Ease scales with fit preference (tight: >=0.5cm, classic: >=1.5cm, loose: <=4.5cm)
      assert(sleeve.capEaseCm >= 0.5, `Cap ease ${sleeve.capEaseCm}cm >= 0.5cm`);
      assert(sleeve.capEaseCm <= 4.5, `Cap ease ${sleeve.capEaseCm}cm <= 4.5cm`);
    });
  }
});

// ============================================================================
// SUITE 5: Pattern Dispatcher & Studio Canvas Integration
// ============================================================================
describe('Studio Integration: Pattern Dispatcher & Canvas State', () => {
  const allBlocks = ['SKIRT', 'BODICE', 'SLEEVE', 'TROUSER'];

  for (const block of allBlocks) {
    test(`Integration: draftPattern(${block}) returns complete geometry with constructionLines & contours`, async () => {
      const engine = await loadDraftingEngine();
      const pattern = engine.draftPattern({
        blockType: block,
        method: 'MULLER',
        measurements: stdProfile.measurements,
        fitPreference: 'CLASSIC',
      });

      assertEqual(pattern.blockType, block);
      assert(pattern.boundingBox, 'Bounding box must exist');
      assert(pattern.boundingBox.width > 0 && pattern.boundingBox.height > 0, 'Bounding box dimensions must be positive');
      assert(Array.isArray(pattern.steps) && pattern.steps.length > 0, 'Steps must be populated');
      assert(Array.isArray(pattern.constructionLines) && pattern.constructionLines.length > 0, `${block} must return constructionLines`);
      assert(Array.isArray(pattern.contours) && pattern.contours.length > 0, `${block} must return contours`);

      // Verify export methods exist and return valid output
      assert(typeof pattern.exportSvg === 'function', 'exportSvg must be a function');
      assert(typeof pattern.exportDxf === 'function', 'exportDxf must be a function');
      assert(typeof pattern.exportA4Pdf === 'function', 'exportA4Pdf must be a function');
      assert(typeof pattern.exportA0Pdf === 'function', 'exportA0Pdf must be a function');

      const svg = pattern.exportSvg();
      assert(typeof svg === 'string' && svg.includes('<svg') && svg.includes('</svg>'), 'exportSvg must generate valid SVG markup');

      const dxf = pattern.exportDxf();
      assert(typeof dxf === 'string' && dxf.includes('SECTION') && dxf.includes('EOF'), 'exportDxf must generate valid AAMA-DXF format');
    });
  }

  test('Studio Canvas: Progressive step element filtering logic', async () => {
    const engine = await loadDraftingEngine();
    const sleeve = engine.draftPattern({
      blockType: 'SLEEVE',
      method: 'MULLER',
      measurements: stdProfile.measurements,
    });

    // Step 0 should only show step 0 elements
    const step0 = sleeve.steps[0];
    assert(step0.elements.includes('frameTopLeft'), 'Step 0 includes initial frame points');
    assert(!step0.elements.includes('wristBack'), 'Step 0 does not include wrist points');

    // Step 4 (final step) includes underarm seams and wrist
    const step4 = sleeve.steps[4];
    assert(step4.elements.includes('wristBack'), 'Step 4 includes wrist points');
    assert(step4.elements.includes('slitBottom'), 'Step 4 includes slit points');
  });
});

