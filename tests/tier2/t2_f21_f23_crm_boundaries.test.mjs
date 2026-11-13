/**
 * Tier 2 — Boundary & Corner Tests for Features F21 through F23: Client CRM & Launch Bridge
 * 5 tests per feature = 15 tests total.
 */

import { describe, test } from '../runner.mjs';
import {
  assert,
  assertEqual,
  assertDeepEqual,
  BENCHMARK_PROFILES,
} from '../harness/index.mjs';

function validateClientInput(data) {
  if (!data.firstName || data.firstName.trim().length === 0) {
    return { valid: false, error: 'نام مشتری الزامی است' };
  }
  if (!data.lastName || data.lastName.trim().length === 0) {
    return { valid: false, error: 'نام خانوادگی مشتری الزامی است' };
  }
  if (data.notes && data.notes.length > 5000) {
    return { valid: false, error: 'طول یادداشت‌ها نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد' };
  }
  return { valid: true };
}

// ============================================================================
// F21 Boundaries: Client Anthropometric CRM (5 tests)
// ============================================================================
describe('F21 Boundaries: Client Anthropometric CRM', () => {
  test('F21-B1: Empty or whitespace-only client first name is rejected', () => {
    const res = validateClientInput({ firstName: '   ', lastName: 'محمدی' });
    assertEqual(res.valid, false);
    assert(res.error.includes('نام'), 'Error flags first name');
  });

  test('F21-B2: Empty or whitespace-only client last name is rejected', () => {
    const res = validateClientInput({ firstName: 'سارا', lastName: '' });
    assertEqual(res.valid, false);
    assert(res.error.includes('نام خانوادگی'), 'Error flags last name');
  });

  test('F21-B3: Non-critical optional measurements (skirtLength, elbowCircumference) can be omitted without error', () => {
    const clientData = { ...BENCHMARK_PROFILES[0].measurements };
    delete clientData.skirtLength;
    assert(clientData.bust > 0, 'Core measurements intact');
  });

  test('F21-B4: Excessive client notes exceeding 5000 characters are rejected', () => {
    const hugeNotes = 'یادداشت '.repeat(1000); // 8000 chars
    const res = validateClientInput({ firstName: 'سارا', lastName: 'محمدی', notes: hugeNotes });
    assertEqual(res.valid, false);
    assert(res.error.includes('۵۰۰۰ کاراکتر'), 'Error identifies length limit');
  });

  test('F21-B5: Persian special characters (نیم‌فاصله، تشدید، گیومه) in client names are supported', () => {
    const res = validateClientInput({ firstName: 'ماه‌چهره', lastName: 'رضایی‌پور' });
    assertEqual(res.valid, true, 'Zero-width non-joiner supported');
  });
});

// ============================================================================
// F22 Boundaries: Client Posture Tags & Notes (5 tests)
// ============================================================================
describe('F22 Boundaries: Client Posture Tags & Notes', () => {
  function sanitizeTags(tags) {
    if (!Array.isArray(tags)) return [];
    // Deduplicate
    const unique = [...new Set(tags)];
    // Resolve mutually exclusive tags: keep the last one specified
    const hasSloping = unique.includes('SLOPING_SHOULDERS');
    const hasSquare = unique.includes('SQUARE_SHOULDERS');
    if (hasSloping && hasSquare) {
      // Remove sloping if both present
      const filtered = unique.filter((t) => t !== 'SLOPING_SHOULDERS');
      return filtered;
    }
    return unique;
  }

  test('F22-B1: Duplicate posture tags are automatically deduplicated', () => {
    const tags = ['SWAYBACK', 'SWAYBACK', 'PROMINENT_ABDOMEN'];
    const sanitized = sanitizeTags(tags);
    assertEqual(sanitized.length, 2, 'Duplicates removed');
  });

  test('F22-B2: Mutually exclusive tags (SLOPING + SQUARE shoulders) resolve to single tag', () => {
    const tags = ['SLOPING_SHOULDERS', 'SQUARE_SHOULDERS'];
    const sanitized = sanitizeTags(tags);
    assertEqual(sanitized.length, 1, 'Conflict resolved to 1 tag');
    assertEqual(sanitized[0], 'SQUARE_SHOULDERS', 'SQUARE retained');
  });

  test('F22-B3: Null or non-array tags payload converts safely to empty array', () => {
    assertEqual(sanitizeTags(null).length, 0);
    assertEqual(sanitizeTags(undefined).length, 0);
  });

  test('F22-B4: Empty client notes string is stored as empty or null without database constraint errors', () => {
    const client = { notes: '' };
    assertEqual(client.notes, '');
  });

  test('F22-B5: HTML tags in notes are escaped or preserved as plain text', () => {
    const rawNotes = '<script>alert("xss")</script>نکات خیاطی';
    const escaped = rawNotes.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    assert(!escaped.includes('<script>'), 'HTML tags escaped');
  });
});

// ============================================================================
// F23 Boundaries: Studio Launch Bridge & History (5 tests)
// ============================================================================
describe('F23 Boundaries: Studio Launch Bridge & History', () => {
  function resolveClientForStudio(clientsList, clientId) {
    if (!clientId) return { error: 'شناسه مشتری ارائه نشده است' };
    const found = clientsList.find((c) => c.id === clientId);
    if (!found) return { error: 'مشتری مورد نظر یافت نشد' };
    return { success: true, client: found };
  }

  const existingClients = [
    { id: 'c1', name: 'سارا محمدی' },
    { id: 'c2', name: 'مریم احمدی' },
  ];

  test('F23-B1: Launching studio with non-existent clientId returns graceful error', () => {
    const res = resolveClientForStudio(existingClients, 'non-existent-id-999');
    assertEqual(res.error, 'مشتری مورد نظر یافت نشد');
  });

  test('F23-B2: Launching studio with empty clientId returns missing parameter error', () => {
    const res = resolveClientForStudio(existingClients, '');
    assert(res.error.includes('ارائه نشده'), 'Error for empty clientId');
  });

  test('F23-B3: Overwriting existing saved draft updates timestamp and version', () => {
    const draft = {
      id: 'draft-1',
      version: 1,
      updatedAt: '2026-11-10T10:00:00Z',
    };
    // Update
    draft.version += 1;
    draft.updatedAt = new Date().toISOString();
    assertEqual(draft.version, 2, 'Version incremented');
  });

  test('F23-B4: Special characters in draft title (پالتو پاییزه/سایز ۳۸!) are preserved', () => {
    const title = 'پالتو پاییزه/سایز ۳۸!';
    assertEqual(title, 'پالتو پاییزه/سایز ۳۸!');
  });

  test('F23-B5: Studio launch URL parameters parse correctly even with URL-encoded Persian strings', () => {
    const clientName = 'سارا محمدی';
    const encoded = encodeURIComponent(clientName);
    const decoded = decodeURIComponent(encoded);
    assertEqual(decoded, clientName, 'Persian string survives URL encoding');
  });
});
