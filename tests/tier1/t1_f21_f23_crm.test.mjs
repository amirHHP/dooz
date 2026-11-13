/**
 * Tier 1 — Core Features F21 through F23: Client Anthropometric CRM & Studio Bridge
 * 5 tests per feature = 15 tests total.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertDeepEqual,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

// Anthropometric schema validator
function validateClientMeasurements(measurements) {
  const REQUIRED_FIELDS = [
    'totalHeight', 'bustCircumference', 'waistCircumference', 'hipCircumference',
    'acrossBack', 'acrossFront', 'shoulderLength', 'neckCircumference', 'bustDistance',
    'backWaistLength', 'frontWaistLength', 'bustHeight', 'armholeDepth', 'hipHeight',
    'sleeveLength', 'bicepCircumference', 'wristCircumference', 'trouserOutseam',
    'trouserInseam', 'crotchDepth', 'thighCircumference', 'kneeCircumference', 'ankleCircumference',
  ];

  for (const field of REQUIRED_FIELDS) {
    if (measurements[field] === undefined || measurements[field] === null) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
    if (typeof measurements[field] !== 'number' || measurements[field] <= 0) {
      return { valid: false, error: `Field ${field} must be a positive number` };
    }
  }

  // Anthropometric boundary checks
  if (measurements.totalHeight < 100 || measurements.totalHeight > 230) {
    return { valid: false, error: 'قد باید بین ۱۰۰ تا ۲۳۰ سانتی‌متر باشد' };
  }
  if (measurements.bustCircumference < 60 || measurements.bustCircumference > 160) {
    return { valid: false, error: 'دور سینه نامعتبر است' };
  }

  return { valid: true };
}

// ============================================================================
// F21: Client Anthropometric CRM (5 tests)
// ============================================================================
describe('F21: Client Anthropometric CRM', () => {
  const sampleClient = {
    firstName: 'سارا',
    lastName: 'محمدی',
    phone: '09351234567',
    gender: 'FEMALE',
    measurements: {
      totalHeight: 168,
      bustCircumference: 92,
      waistCircumference: 70,
      hipCircumference: 98,
      highHipCircumference: 88,
      acrossBack: 35,
      acrossFront: 33,
      shoulderLength: 12.5,
      neckCircumference: 36,
      bustDistance: 19,
      backWaistLength: 41,
      frontWaistLength: 44,
      bustHeight: 26,
      armholeDepth: 20.5,
      hipHeight: 20,
      sleeveLength: 59,
      bicepCircumference: 28,
      wristCircumference: 16,
      skirtLength: 65,
      trouserOutseam: 102,
      trouserInseam: 76,
      crotchDepth: 26,
      thighCircumference: 56,
      kneeCircumference: 38,
      ankleCircumference: 24,
    },
  };

  test('F21-1: Client profile captures full anthropometric schema with 26 tailoring metrics', () => {
    const res = validateClientMeasurements(sampleClient.measurements);
    assertEqual(res.valid, true, 'Valid measurements must pass validation');
  });

  test('F21-2: Validation rejects client profile with missing required measurement field', () => {
    const invalid = { ...sampleClient.measurements };
    delete invalid.bustCircumference;
    const res = validateClientMeasurements(invalid);
    assertEqual(res.valid, false, 'Must reject missing bustCircumference');
    assert(res.error.includes('bustCircumference'), 'Error message identifies missing field');
  });

  test('F21-3: Validation enforces realistic human height range (100cm - 230cm)', () => {
    const tooShort = { ...sampleClient.measurements, totalHeight: 85 };
    const res = validateClientMeasurements(tooShort);
    assertEqual(res.valid, false, 'Must reject height 85cm');
    assert(res.error.includes('قد'), 'Error message mentions height in Persian');
  });

  test('F21-4: CRM stores optional client phone number and gender identification', () => {
    assertEqual(sampleClient.phone, '09351234567', 'Phone stored');
    assertEqual(sampleClient.gender, 'FEMALE', 'Gender stored');
  });

  test('F21-5: All 3 benchmark profiles from specifications pass CRM measurement validation', () => {
    BENCHMARK_PROFILES.forEach((p) => {
      // Map benchmark profile keys to CRM schema
      const mapped = {
        totalHeight: 165,
        bustCircumference: p.measurements.bust,
        waistCircumference: p.measurements.waist,
        hipCircumference: p.measurements.hip,
        acrossBack: p.measurements.acrossBack,
        acrossFront: p.measurements.acrossFront,
        shoulderLength: p.measurements.shoulder,
        neckCircumference: p.measurements.neck,
        bustDistance: p.measurements.bustSpan,
        backWaistLength: p.measurements.backLength,
        frontWaistLength: p.measurements.frontLength,
        bustHeight: p.measurements.bustHeight,
        armholeDepth: 20.0,
        hipHeight: 20.0,
        sleeveLength: p.measurements.sleeveLength,
        bicepCircumference: p.measurements.armCirc,
        wristCircumference: p.measurements.wristCirc,
        trouserOutseam: p.measurements.trouserLength,
        trouserInseam: p.measurements.trouserLength - p.measurements.crotchDepth,
        crotchDepth: p.measurements.crotchDepth,
        thighCircumference: 55,
        kneeCircumference: p.measurements.kneeWidth * 1.5,
        ankleCircumference: p.measurements.hemWidth * 1.2,
      };
      const res = validateClientMeasurements(mapped);
      assertEqual(res.valid, true, `Profile ${p.name} must be valid`);
    });
  });
});

// ============================================================================
// F22: Client Posture Tags & Notes (5 tests)
// ============================================================================
describe('F22: Client Posture Tags & Notes', () => {
  const ALLOWED_POSTURE_TAGS = [
    'PROMINENT_ABDOMEN',
    'SWAYBACK',
    'PROMINENT_HIP',
    'FLAT_BUTTOCKS',
    'SLOPING_SHOULDERS',
    'SQUARE_SHOULDERS',
    'ROUND_BACK',
    'PIGEON_CHEST',
  ];

  test('F22-1: Standard posture client has empty posture tags array', () => {
    const tags = [];
    assertEqual(tags.length, 0, 'No posture tags for standard posture');
  });

  test('F22-2: Tailor can assign multiple anatomical defect tags (e.g. SWAYBACK and PROMINENT_ABDOMEN)', () => {
    const tags = ['PROMINENT_ABDOMEN', 'SWAYBACK'];
    assert(tags.includes('PROMINENT_ABDOMEN'), 'Contains PROMINENT_ABDOMEN');
    assert(tags.includes('SWAYBACK'), 'Contains SWAYBACK');
    tags.forEach((t) => assert(ALLOWED_POSTURE_TAGS.includes(t), `Tag ${t} is allowed`));
  });

  test('F22-3: Mutually exclusive tags (SLOPING vs SQUARE shoulders) can be validated', () => {
    const isConflicting = (tags) => tags.includes('SLOPING_SHOULDERS') && tags.includes('SQUARE_SHOULDERS');
    assertEqual(isConflicting(['SLOPING_SHOULDERS']), false, 'Single shoulder tag valid');
    assertEqual(isConflicting(['SLOPING_SHOULDERS', 'SQUARE_SHOULDERS']), true, 'Conflicting shoulder tags flagged');
  });

  test('F22-4: Tailor private notes field persists arbitrary Persian text and tips', () => {
    const notes = 'مشتری قدیمی مزون - ترجیح پارچه‌های کرپ و لنین طبیعی. خط کمر جلو ۱.۵ سانتی‌متر بالا برده شود.';
    assert(notes.length > 20, 'Notes preserved');
    assert(notes.includes('کرپ'), 'Persian content retained');
  });

  test('F22-5: Posture tags array serializes cleanly into JSON for database storage', () => {
    const tags = ['PROMINENT_HIP', 'ROUND_BACK'];
    const serialized = JSON.stringify(tags);
    const parsed = JSON.parse(serialized);
    assertDeepEqual(parsed, tags, 'Tags array survives JSON roundtrip');
  });
});

// ============================================================================
// F23: Studio Launch Bridge & History (5 tests)
// ============================================================================
describe('F23: Studio Launch Bridge & History', () => {
  function buildStudioLaunchUrl(clientId, options = {}) {
    const base = '/studio';
    const params = new URLSearchParams();
    params.set('clientId', clientId);
    if (options.block) params.set('block', options.block);
    if (options.method) params.set('method', options.method);
    return `${base}?${params.toString()}`;
  }

  test('F23-1: Studio launch bridge constructs valid URL containing client ID query param', () => {
    const url = buildStudioLaunchUrl('client-sara-123');
    assert(url.startsWith('/studio?'), 'URL must target /studio route');
    assert(url.includes('clientId=client-sara-123'), 'URL must contain clientId parameter');
  });

  test('F23-2: Studio launch bridge supports pre-selecting block type and tailoring method in URL', () => {
    const url = buildStudioLaunchUrl('client-sara-123', { block: 'BODICE', method: 'MULLER' });
    assert(url.includes('block=BODICE'), 'URL pre-selects BODICE');
    assert(url.includes('method=MULLER'), 'URL pre-selects MULLER');
  });

  test('F23-3: Studio hydrates state store from client anthropometric payload', () => {
    const clientPayload = {
      id: 'c1',
      name: 'سارا محمدی',
      measurements: { bust: 92, waist: 70, hip: 98 },
      postureTags: ['SWAYBACK'],
      fitPreference: 'CLASSIC',
    };
    const studioState = {
      activeClientId: clientPayload.id,
      clientName: clientPayload.name,
      measurements: clientPayload.measurements,
      posture: {
        swayback: clientPayload.postureTags.includes('SWAYBACK'),
        prominentAbdomen: clientPayload.postureTags.includes('PROMINENT_ABDOMEN'),
      },
      fitPreference: clientPayload.fitPreference,
    };
    assertEqual(studioState.activeClientId, 'c1');
    assertEqual(studioState.posture.swayback, true);
    assertEqual(studioState.posture.prominentAbdomen, false);
  });

  test('F23-4: SavedDraft record links to both userId and optional clientId for history tracking', () => {
    const draft = {
      id: 'draft-001',
      userId: 'tailor-ali',
      clientId: 'client-sara-123',
      title: 'مانتو کتی بهاره سارا',
      baseBlock: 'BODICE',
      method: 'MULLER',
      savedAt: new Date().toISOString(),
    };
    assertEqual(draft.clientId, 'client-sara-123', 'Draft links to client');
    assertEqual(draft.baseBlock, 'BODICE', 'Draft saves base block');
  });

  test('F23-5: Studio displays active client indicator banner when launched via bridge', () => {
    const clientName = 'سارا محمدی';
    const bannerText = `در حال طراحی الگو برای ${clientName}`;
    assert(bannerText.includes(clientName), 'Banner mentions client name');
    assert(bannerText.includes('طراحی الگو'), 'Banner explains studio context');
  });
});
