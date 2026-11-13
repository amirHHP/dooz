/**
 * Dooz Test Harness - 2D Vector & Bézier Geometry Library
 * Deterministic computational geometry for sewing pattern verification.
 */

export class Point2D {
  constructor(x, y, label = '') {
    this.x = Number(x);
    this.y = Number(y);
    this.label = label;
  }

  clone() {
    return new Point2D(this.x, this.y, this.label);
  }

  dist(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  add(other) {
    return new Point2D(this.x + other.x, this.y + other.y);
  }

  sub(other) {
    return new Point2D(this.x - other.x, this.y - other.y);
  }

  scale(factor) {
    return new Point2D(this.x * factor, this.y * factor);
  }

  dot(other) {
    return this.x * other.x + this.y * other.y;
  }

  cross(other) {
    return this.x * other.y - this.y * other.x;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const len = this.length();
    if (len === 0) return new Point2D(0, 0);
    return new Point2D(this.x / len, this.y / len);
  }

  normal() {
    // Perpendicular normal vector (-y, x)
    const len = this.length();
    if (len === 0) return new Point2D(0, 0);
    return new Point2D(-this.y / len, this.x / len);
  }
}

export class CubicBezier {
  constructor(p0, c1, c2, p3) {
    this.p0 = new Point2D(p0.x, p0.y);
    this.c1 = new Point2D(c1.x, c1.y);
    this.c2 = new Point2D(c2.x, c2.y);
    this.p3 = new Point2D(p3.x, p3.y);
  }

  evaluate(t) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const x = uuu * this.p0.x + 3 * uu * t * this.c1.x + 3 * u * tt * this.c2.x + ttt * this.p3.x;
    const y = uuu * this.p0.y + 3 * uu * t * this.c1.y + 3 * u * tt * this.c2.y + ttt * this.p3.y;
    return new Point2D(x, y);
  }

  derivative(t) {
    const u = 1 - t;
    const dx = 3 * u * u * (this.c1.x - this.p0.x) + 6 * u * t * (this.c2.x - this.c1.x) + 3 * t * t * (this.p3.x - this.c2.x);
    const dy = 3 * u * u * (this.c1.y - this.p0.y) + 6 * u * t * (this.c2.y - this.c1.y) + 3 * t * t * (this.p3.y - this.c2.y);
    return new Point2D(dx, dy);
  }

  arcLength(segments = 64) {
    let len = 0;
    let prev = this.evaluate(0);
    for (let i = 1; i <= segments; i++) {
      const curr = this.evaluate(i / segments);
      len += prev.dist(curr);
      prev = curr;
    }
    return len;
  }
}

export class QuadraticBezier {
  constructor(p0, c1, p2) {
    this.p0 = new Point2D(p0.x, p0.y);
    this.c1 = new Point2D(c1.x, c1.y);
    this.p2 = new Point2D(p2.x, p2.y);
  }

  evaluate(t) {
    const u = 1 - t;
    const x = u * u * this.p0.x + 2 * u * t * this.c1.x + t * t * this.p2.x;
    const y = u * u * this.p0.y + 2 * u * t * this.c1.y + t * t * this.p2.y;
    return new Point2D(x, y);
  }

  arcLength(segments = 64) {
    let len = 0;
    let prev = this.evaluate(0);
    for (let i = 1; i <= segments; i++) {
      const curr = this.evaluate(i / segments);
      len += prev.dist(curr);
      prev = curr;
    }
    return len;
  }
}
