/**
 * Dooz Drafting Engine - 1:1 Scale PDF Export (A4 Tiled & A0 Plotter)
 * Pure TypeScript deterministic PDF 1.4 binary compiler.
 */

import { A4PageTile, A4TilingLayout, CalibrationSquareData } from '@/types/drafting';

export function calculateA4Tiling(patternWidthMm: number, patternHeightMm: number): A4TilingLayout {
  const paperWidthMm = 210.0;
  const paperHeightMm = 297.0;
  const marginMm = 10.0;

  const effWidthMm = paperWidthMm - 2 * marginMm;  // 190mm
  const effHeightMm = paperHeightMm - 2 * marginMm; // 277mm

  const cols = Math.ceil(patternWidthMm / effWidthMm);
  const rows = Math.ceil(patternHeightMm / effHeightMm);
  const totalPages = cols * rows;

  const pages: A4PageTile[] = [];
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pageIndex = `${rowLetters[r]}${c + 1}`;
      pages.push({
        row: r,
        col: c,
        indexLabel: pageIndex,
        xOffsetMm: c * effWidthMm,
        yOffsetMm: r * effHeightMm,
        hasTopNeighbor: r > 0,
        hasBottomNeighbor: r < rows - 1,
        hasLeftNeighbor: c > 0,
        hasRightNeighbor: c < cols - 1,
      });
    }
  }

  // 5cm x 5cm calibration square specifications
  const calibrationSquare: CalibrationSquareData = {
    widthMm: 50.0,
    heightMm: 50.0,
    widthPt: 50.0 * 2.834645669,
    heightPt: 50.0 * 2.834645669,
    diagonalMm: Math.sqrt(50 * 50 + 50 * 50),
    labelFa: 'مربع کالیبراسیون مقیاس ۵ × ۵ سانتی‌متر',
  };

  return {
    paperWidthMm,
    paperHeightMm,
    effWidthMm,
    effHeightMm,
    cols,
    rows,
    totalPages,
    pages,
    calibrationSquare,
  };
}

/**
 * Pure TypeScript PDF 1.4 Binary Generator
 */
export class SimplePdfDocument {
  private objects: string[] = [];
  private pageObjectIds: number[] = [];

  constructor() {}

  private addObject(content: string): number {
    this.objects.push(content);
    return this.objects.length + 1; // Object 1 is Pages root, so IDs start at 2
  }

  addPage(widthPt: number, heightPt: number, streamContent: string): void {
    const streamLen = Buffer.byteLength(streamContent, 'utf-8');
    const contentObjId = this.addObject(
      `<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream`
    );

    const pageObjId = this.addObject(
      `<< /Type /Page\n/Parent 1 0 R\n/MediaBox [0 0 ${widthPt.toFixed(2)} ${heightPt.toFixed(2)}]\n/Contents ${contentObjId} 0 R\n/Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>\n>>`
    );
    this.pageObjectIds.push(pageObjId);
  }

  build(): Uint8Array {
    let out = '%PDF-1.4\n';

    // Object 1: Pages Catalog Root
    const kidsStr = this.pageObjectIds.map((id) => `${id} 0 R`).join(' ');
    const pagesObj = `<< /Type /Pages\n/Kids [${kidsStr}]\n/Count ${this.pageObjectIds.length}\n>>`;
    
    // We place Pages object at index 0 (Object 1)
    const allObjs = [pagesObj, ...this.objects];

    // Build actual PDF stream with xref
    let currentOffset = Buffer.byteLength(out, 'utf-8');
    const actualOffsets: number[] = [];

    for (let i = 0; i < allObjs.length; i++) {
      actualOffsets.push(currentOffset);
      const objHeader = `${i + 1} 0 obj\n${allObjs[i]}\nendobj\n`;
      out += objHeader;
      currentOffset += Buffer.byteLength(objHeader, 'utf-8');
    }

    // Catalog object (id = allObjs.length + 1)
    const catalogId = allObjs.length + 1;
    actualOffsets.push(currentOffset);
    const catalogObj = `${catalogId} 0 obj\n<< /Type /Catalog /Pages 1 0 R >>\nendobj\n`;
    out += catalogObj;
    currentOffset += Buffer.byteLength(catalogObj, 'utf-8');

    // xref table
    const startXref = currentOffset;
    out += `xref\n0 ${catalogId + 1}\n0000000000 65535 f \n`;
    for (const off of actualOffsets) {
      out += `${off.toString().padStart(10, '0')} 00000 n \n`;
    }

    out += `trailer\n<< /Size ${catalogId + 1} /Root ${catalogId} 0 R >>\nstartxref\n${startXref}\n%%EOF`;
    return Buffer.from(out, 'utf-8');
  }
}

export async function exportA4TiledPdf(draftResult: any): Promise<Uint8Array> {
  const widthMm = draftResult.boundingBox?.width || 800;
  const heightMm = draftResult.boundingBox?.height || 1000;
  const tiling = calculateA4Tiling(widthMm, heightMm);

  const doc = new SimplePdfDocument();
  const ptPerMm = 2.834645669;
  const a4WidthPt = 210.0 * ptPerMm;
  const a4HeightPt = 297.0 * ptPerMm;
  const marginPt = 10.0 * ptPerMm;

  for (const page of tiling.pages) {
    let stream = `q\n`;
    // Draw outer cut boundary margin (dashed line)
    stream += `0.5 w [2 2] 0 d 0.7 0.7 0.7 RG\n`;
    stream += `${marginPt.toFixed(2)} ${marginPt.toFixed(2)} ${(190 * ptPerMm).toFixed(2)} ${(277 * ptPerMm).toFixed(2)} re S\n`;

    // Draw page grid label in header
    stream += `BT /F1 10 Tf 0 0 0 rg ${(marginPt + 5).toFixed(2)} ${(a4HeightPt - marginPt - 12).toFixed(2)} Td (${page.indexLabel} / ${tiling.cols}x${tiling.rows}) Tj ET\n`;

    // On page A1, render the 5cm x 5cm calibration square
    if (page.indexLabel === 'A1') {
      const sqWidthPt = 50.0 * ptPerMm;
      const sqX = marginPt + 10;
      const sqY = a4HeightPt - marginPt - 10 - sqWidthPt;
      stream += `[ ] 0 d 0.15 0.39 0.92 RG 0.5 w\n`;
      stream += `${sqX.toFixed(2)} ${sqY.toFixed(2)} ${sqWidthPt.toFixed(2)} ${sqWidthPt.toFixed(2)} re S\n`;
      stream += `BT /F1 8 Tf 0.15 0.39 0.92 rg ${(sqX + 5).toFixed(2)} ${(sqY + sqWidthPt / 2).toFixed(2)} Td (5cm x 5cm Calibration Square) Tj ET\n`;
    }

    stream += `Q\n`;
    doc.addPage(a4WidthPt, a4HeightPt, stream);
  }

  return doc.build();
}

export async function exportA0PlotterPdf(draftResult: any): Promise<Uint8Array> {
  const ptPerMm = 2.834645669;
  const a0WidthPt = 841.0 * ptPerMm;
  const a0HeightPt = 1189.0 * ptPerMm;

  const doc = new SimplePdfDocument();
  let stream = `q\n`;
  // Draw piece metadata header
  const blockType = draftResult.blockType || 'PATTERN';
  const method = draftResult.method || 'MULLER';
  stream += `BT /F1 14 Tf 0 0 0 rg 50 ${(a0HeightPt - 50).toFixed(2)} Td (Dooz Pattern Plotter - ${blockType} [${method}]) Tj ET\n`;

  // Draw 5cm x 5cm calibration square for roll tension
  const sqWidthPt = 50.0 * ptPerMm;
  stream += `[ ] 0 d 0.15 0.39 0.92 RG 0.5 w\n`;
  stream += `50 ${(a0HeightPt - 120).toFixed(2)} ${sqWidthPt.toFixed(2)} ${sqWidthPt.toFixed(2)} re S\n`;
  stream += `BT /F1 8 Tf 0.15 0.39 0.92 rg 55 ${(a0HeightPt - 95).toFixed(2)} Td (5cm x 5cm Plotter Check) Tj ET\n`;
  stream += `Q\n`;

  doc.addPage(a0WidthPt, a0HeightPt, stream);
  return doc.build();
}
