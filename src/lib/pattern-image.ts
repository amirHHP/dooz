/**
 * Helper to safely resolve pattern cover images.
 * Maps external Unsplash URLs (blocked in Iran) and missing images
 * to local, beautifully drafted vector SVG patterns.
 */
export const SLUG_TO_PATTERN_IMAGE: Record<string, string> = {
  "high-waisted-wide-leg-pants": "/images/patterns/high-waisted-wide-leg-pants.svg",
  "casual-trench-coat-raglan": "/images/patterns/casual-trench-coat-raglan.svg",
  "casual-raglan-trench-coat": "/images/patterns/casual-trench-coat-raglan.svg",
  "tiered-summer-maxi-dress": "/images/patterns/tiered-summer-maxi-dress.svg",
  "a-line-four-panel-skirt": "/images/patterns/a-line-four-panel-skirt.svg",
  "a-line-4-panel-skirt": "/images/patterns/a-line-four-panel-skirt.svg",
  "classic-straight-leg-trousers": "/images/patterns/classic-straight-leg-trousers.svg",
  "bishop-sleeve-blouse": "/images/patterns/bishop-sleeve-blouse.svg",
  "princess-seam-evening-dress": "/images/patterns/princess-seam-evening-dress.svg",
  "classic-tailored-blazer-coat": "/images/patterns/classic-tailored-blazer-coat.svg",
};

export const DEFAULT_PATTERN_IMAGE = "/images/patterns/default-pattern.svg";

export function resolvePatternImage(coverImage?: string | null, slug?: string): string {
  // If the coverImage is missing, an unsplash domain, or relative missing, resolve to local SVG
  if (!coverImage || coverImage.includes("images.unsplash.com")) {
    if (slug && SLUG_TO_PATTERN_IMAGE[slug]) {
      return SLUG_TO_PATTERN_IMAGE[slug];
    }
    return DEFAULT_PATTERN_IMAGE;
  }
  return coverImage;
}
