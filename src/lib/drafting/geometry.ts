/**
 * Dooz Drafting Engine - 2D Vector & Bézier Geometry Library
 * Pure computational geometry for pattern cutting and verification.
 */

export class Point2D {
  public x: number;
  public y: number;
  public label: string;

  constructor(x: number, y: number, label: string = '') {
    this.x = Number(x);
    this.y = Number(y);
    this.label = label;
  }

  clone(): Point2D {
    return new Point2D(this.x, this.y, this.label);
  }

  dist(other: Point2D): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  add(other: Point2D): Point2D {
    return new Point2D(this.x + other.x, this.y + other.y);
  }

  sub(other: Point2D): Point2D {
    return new Point2D(this.x - other.x, this.y - other.y);
  }

  scale(factor: number): Point2D {
    return new Point2D(this.x * factor, this.y * factor);
  }

  dot(other: Point2D): number {
    return this.x * other.x + this.y * other.y;
  }

  cross(other: Point2D): number {
    return this.x * other.y - this.y * other.x;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Point2D {
    const len = this.length();
    if (len === 0) return new Point2D(0, 0);
    return new Point2D(this.x / len, this.y / len);
  }

  normal(): Point2D {
    // Perpendicular normal vector (-y, x)
    const len = this.length();
    if (len === 0) return new Point2D(0, 0);
    return new Point2D(-this.y / len, this.x / len);
  }
}

export class CubicBezier {
  public p0: Point2D;
  public c1: Point2D;
  public c2: Point2D;
  public p3: Point2D;

  constructor(p0: Point2D, c1: Point2D, c2: Point2D, p3: Point2D) {
    this.p0 = new Point2D(p0.x, p0.y);
    this.c1 = new Point2D(c1.x, c1.y);
    this.c2 = new Point2D(c2.x, c2.y);
    this.p3 = new Point2D(p3.x, p3.y);
  }

  evaluate(t: number): Point2D {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const x = uuu * this.p0.x + 3 * uu * t * this.c1.x + 3 * u * tt * this.c2.x + ttt * this.p3.x;
    const y = uuu * this.p0.y + 3 * uu * t * this.c1.y + 3 * u * tt * this.c2.y + ttt * this.p3.y;
    return new Point2D(x, y);
  }

  derivative(t: number): Point2D {
    const u = 1 - t;
    const dx = 3 * u * u * (this.c1.x - this.p0.x) + 6 * u * t * (this.c2.x - this.c1.x) + 3 * t * t * (this.p3.x - this.c2.x);
    const dy = 3 * u * u * (this.c1.y - this.p0.y) + 6 * u * t * (this.c2.y - this.c1.y) + 3 * t * t * (this.p3.y - this.c2.y);
    return new Point2D(dx, dy);
  }

  arcLength(segments: number = 64): number {
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
  public p0: Point2D;
  public c1: Point2D;
  public p2: Point2D;

  constructor(p0: Point2D, c1: Point2D, p2: Point2D) {
    this.p0 = new Point2D(p0.x, p0.y);
    this.c1 = new Point2D(c1.x, c1.y);
    this.p2 = new Point2D(p2.x, p2.y);
  }

  evaluate(t: number): Point2D {
    const u = 1 - t;
    const x = u * u * this.p0.x + 2 * u * t * this.c1.x + t * t * this.p2.x;
    const y = u * u * this.p0.y + 2 * u * t * this.c1.y + t * t * this.p2.y;
    return new Point2D(x, y);
  }

  arcLength(segments: number = 64): number {
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
