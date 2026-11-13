/**
 * Dooz Test Harness - Assertions & Testing Utilities
 * Provides rich, readable assertions with clear error messages and tolerance checking.
 */

export class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

export function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new AssertionError(message, condition, true);
  }
}

export function assertEqual(actual, expected, message = '') {
  if (actual !== expected) {
    const msg = message ? `${message}: expected ${expected}, got ${actual}` : `Expected ${expected}, got ${actual}`;
    throw new AssertionError(msg, actual, expected);
  }
}

export function assertNotEqual(actual, expected, message = '') {
  if (actual === expected) {
    const msg = message ? `${message}: expected value not to equal ${expected}` : `Expected value not to equal ${expected}`;
    throw new AssertionError(msg, actual, expected);
  }
}

export function assertDeepEqual(actual, expected, message = '') {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const msg = message ? `${message}: deep equality mismatch` : `Deep equality mismatch`;
    throw new AssertionError(`${msg}\nExpected: ${expectedStr}\nActual:   ${actualStr}`, actual, expected);
  }
}

export function assertCloseTo(actual, expected, tolerance = 1e-3, message = '') {
  const diff = Math.abs(Number(actual) - Number(expected));
  if (diff > tolerance) {
    const msg = message 
      ? `${message}: expected ${actual} to be close to ${expected} (diff ${diff} > tol ${tolerance})`
      : `Expected ${actual} to be close to ${expected} within tolerance ${tolerance} (diff: ${diff})`;
    throw new AssertionError(msg, actual, expected);
  }
}

export function assertThrows(fn, expectedRegexOrMessage, message = '') {
  let threw = false;
  let caughtError = null;
  try {
    fn();
  } catch (err) {
    threw = true;
    caughtError = err;
  }
  if (!threw) {
    throw new AssertionError(message || 'Expected function to throw an error, but it returned normally', false, true);
  }
  if (expectedRegexOrMessage) {
    const errMsg = caughtError.message || String(caughtError);
    if (expectedRegexOrMessage instanceof RegExp) {
      if (!expectedRegexOrMessage.test(errMsg)) {
        throw new AssertionError(`Error message "${errMsg}" did not match regex ${expectedRegexOrMessage}`, errMsg, expectedRegexOrMessage);
      }
    } else if (typeof expectedRegexOrMessage === 'string') {
      if (!errMsg.includes(expectedRegexOrMessage)) {
        throw new AssertionError(`Error message "${errMsg}" did not contain "${expectedRegexOrMessage}"`, errMsg, expectedRegexOrMessage);
      }
    }
  }
}

export function assertDoesNotThrow(fn, message = '') {
  try {
    fn();
  } catch (err) {
    throw new AssertionError(message ? `${message}: unexpected error thrown: ${err.message}` : `Unexpected error thrown: ${err.message}`, err, null);
  }
}

export function assertPointClose(p1, p2, tolerance = 0.5, message = '') {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  if (dx > tolerance || dy > tolerance) {
    const msg = message ? `${message}: ` : '';
    throw new AssertionError(
      `${msg}Point (${p1.x}, ${p1.y}) not close to expected (${p2.x}, ${p2.y}) within ${tolerance}mm (dx=${dx.toFixed(3)}, dy=${dy.toFixed(3)})`,
      p1,
      p2
    );
  }
}

export function assertSeamParity(len1, len2, maxDiffMm = 3.0, message = 'Seam length parity check') {
  const diff = Math.abs(len1 - len2);
  if (diff > maxDiffMm) {
    throw new AssertionError(
      `${message}: seam discrepancy ${diff.toFixed(2)}mm exceeds maximum allowed tolerance of ${maxDiffMm}mm (L1=${len1.toFixed(2)}mm, L2=${len2.toFixed(2)}mm)`,
      diff,
      maxDiffMm
    );
  }
}

export function assertDartClosure(leftLegLen, rightLegLen, maxDiffMm = 0.5, message = 'Dart leg equality') {
  const diff = Math.abs(leftLegLen - rightLegLen);
  if (diff > maxDiffMm) {
    throw new AssertionError(
      `${message}: dart legs are unequal by ${diff.toFixed(2)}mm (left=${leftLegLen.toFixed(2)}, right=${rightLegLen.toFixed(2)})`,
      diff,
      maxDiffMm
    );
  }
}

export function assertCalibrationSquare(squareData, expectedMm = 50.0, toleranceMm = 0.1, message = '5cmx5cm calibration square verification') {
  const widthMm = squareData.widthMm ?? (squareData.widthPt ? squareData.widthPt / 2.834645669 : null);
  const heightMm = squareData.heightMm ?? (squareData.heightPt ? squareData.heightPt / 2.834645669 : null);
  assert(widthMm !== null && heightMm !== null, `${message}: calibration square dimensions could not be read`);
  assertCloseTo(widthMm, expectedMm, toleranceMm, `${message}: square width in mm`);
  assertCloseTo(heightMm, expectedMm, toleranceMm, `${message}: square height in mm`);
  if (squareData.diagonalMm) {
    const expectedDiag = Math.sqrt(expectedMm * expectedMm + expectedMm * expectedMm);
    assertCloseTo(squareData.diagonalMm, expectedDiag, toleranceMm * 1.5, `${message}: square diagonal check`);
  }
}
