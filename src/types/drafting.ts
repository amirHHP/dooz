/**
 * Dooz Parametric Pattern Drafting Core Types
 */

export type DraftingMethod = 'MULLER' | 'METRIC' | 'GRLAWEIN';
export type BlockType = 'SKIRT' | 'BODICE' | 'SLEEVE' | 'TROUSER';
export type FitPreference = 'TIGHT' | 'CLASSIC' | 'LOOSE';
export type ShoulderSlope = 'NORMAL' | 'SLOPING' | 'SQUARE';

export interface PostureAdjustments {
  prominentAbdomen?: boolean;
  swayback?: boolean;
  prominentHip?: boolean;
  shoulderSlope?: ShoulderSlope;
}

export interface FitEaseSpec {
  bust: number;
  waist: number;
  hip: number;
  bicep: number;
  multiplier: number;
}

export interface AnthropometricMeasurements {
  bust?: number;
  waist?: number;
  hip?: number;
  hipDepth?: number;
  skirtLength?: number;
  backLength?: number;
  frontLength?: number;
  acrossBack?: number;
  acrossFront?: number;
  neck?: number;
  shoulder?: number;
  bustHeight?: number;
  bustSpan?: number;
  sleeveLength?: number;
  armCirc?: number;
  wristCirc?: number;
  trouserLength?: number;
  crotchDepth?: number;
  kneeWidth?: number;
  hemWidth?: number;
  [key: string]: number | undefined;
}

export interface ConstructionElementHighlight {
  id: string;
  type: 'POINT' | 'LINE' | 'CURVE';
}

export interface ConstructionStep {
  stepIndex: number;
  titleFa: string;
  instructionFa: string;
  calculatedValues: Record<string, string>;
  elements: string[];
}

export interface BoundingBox2D {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface CalibrationSquareData {
  widthMm: number;
  heightMm: number;
  widthPt: number;
  heightPt: number;
  diagonalMm: number;
  labelFa: string;
}

export interface A4PageTile {
  row: number;
  col: number;
  indexLabel: string;
  xOffsetMm: number;
  yOffsetMm: number;
  hasTopNeighbor: boolean;
  hasBottomNeighbor: boolean;
  hasLeftNeighbor: boolean;
  hasRightNeighbor: boolean;
}

export interface A4TilingLayout {
  paperWidthMm: number;
  paperHeightMm: number;
  effWidthMm: number;
  effHeightMm: number;
  cols: number;
  rows: number;
  totalPages: number;
  pages: A4PageTile[];
  calibrationSquare: CalibrationSquareData;
}

export interface ParametricInput {
  blockType: BlockType;
  method: DraftingMethod;
  measurements: AnthropometricMeasurements | Record<string, number>;
  postureAdjustments?: PostureAdjustments;
  fitPreference?: FitPreference;
}

export interface PatternGeometry {
  blockType: BlockType;
  method: DraftingMethod;
  fitPreference: FitPreference;
  boundingBox: BoundingBox2D;
  steps: ConstructionStep[];
  points: Record<string, { x: number; y: number; label?: string }>;
  exportA4Pdf: () => Promise<Uint8Array>;
  exportA0Pdf: () => Promise<Uint8Array>;
  exportSvg: () => string;
  exportDxf: () => string;
  [key: string]: any;
}
