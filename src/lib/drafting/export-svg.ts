/**
 * Dooz Drafting Engine - 1:1 Scale SVG Generator
 */

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generatePatternSvg(draftResult: any): string {
  const widthMm = draftResult.boundingBox?.width || 800;
  const heightMm = draftResult.boundingBox?.height || 1000;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm}mm" viewBox="0 0 ${widthMm} ${heightMm}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#059669" />
    </marker>
  </defs>
  <g id="calibration-square" transform="translate(20, 20)">
    <rect width="50" height="50" fill="none" stroke="#2563EB" stroke-width="0.5" />
    <text x="25" y="25" font-family="Vazirmatn" font-size="3" text-anchor="middle">${escapeXml('مربع کالیبراسیون ۵×۵ سانتی‌متر')}</text>
  </g>
  <g id="layer-construction-lines" stroke="#CBD5E1" stroke-dasharray="3,3" stroke-width="0.3"></g>
  <g id="layer-pattern-cut-outline" stroke="#0F172A" stroke-width="0.7" fill="none"></g>
  <g id="layer-darts" stroke="#2563EB" stroke-width="0.5" fill="none"></g>
  <g id="layer-grainlines" stroke="#059669" stroke-width="0.5" marker-start="url(#arrow)" marker-end="url(#arrow)"></g>
  <g id="layer-notches" stroke="#DC2626" stroke-width="0.7"></g>
  <g id="layer-labels-persian" font-family="Vazirmatn" font-size="3.5" fill="#1E293B"></g>
</svg>`;
}
