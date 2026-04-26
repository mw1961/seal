/**
 * Hand-crafted SVG symbol library for Sygneo Heritage Seals.
 * Every symbol is drawn to be bold, meaningful, and manufacturable.
 * Coordinate system: centered at 0,0 · fits within ±42 units.
 * stroke="{{COLOR}}" is replaced at render time.
 */

const SW = `stroke="{{COLOR}}" fill="none" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const SWS = `stroke="{{COLOR}}" fill="none" stroke-width="5"`;

export interface LibrarySymbol {
  id:       string;
  name:     string;
  tags:     string[];
  elements: string;
  scale?:   number;
}

export const SYMBOL_LIBRARY: LibrarySymbol[] = [

  // ── CANADA ───────────────────────────────────────────────────────────────────
  {
    id:   'maple_leaf',
    name: 'Maple Leaf',
    tags: ['canada', 'canadian', 'ontario', 'quebec', 'british columbia', 'maple'],
    elements: `
<path ${SW} d="
  M 0,-42
  L -8,-24  L -26,-30  L -20,-14
  L -42,2   L -20,2    L -24,42
  L 0,32    L 24,42    L 20,2
  L 42,2    L 20,-14   L 26,-30
  L 8,-24   Z
"/>`,
  },

  {
    id:   'cedar_tree',
    name: 'Cedar Tree',
    tags: ['canada', 'forest', 'nature', 'pacific', 'northern', 'mountain'],
    elements: `
<polygon ${SW} points="0,-42 -14,-12 14,-12"/>
<polygon ${SW} points="0,-30 -24,4  24,4"/>
<polygon ${SW} points="0,-14 -36,22 36,22"/>
<rect    ${SW} x="-6" y="22" width="12" height="20"/>`,
  },

  // ── CARPENTRY ────────────────────────────────────────────────────────────────
  {
    id:   'dovetail',
    name: 'Dovetail Joint',
    tags: ['carpenter', 'carpentry', 'woodworker', 'joiner', 'cabinet', 'furniture', 'timber', 'lumber', 'craft'],
    elements: `
<path ${SW} d="M -38,-20 L -12,-20 L -6,20 L -38,20 Z"/>
<path ${SW} d="M 12,-20  L 38,-20  L 38,20  L 6,20  Z"/>
<path ${SW} d="M -12,-20 L 12,-20  L 6,20   L -6,20 Z"/>`,
    scale: 0.9,
  },

  {
    id:   'compass_square',
    name: "Carpenter's Compass",
    tags: ['carpenter', 'craftsman', 'architect', 'builder', 'mason', 'engineer'],
    elements: `
<circle ${SWS} cx="0" cy="-10" r="7"/>
<line   ${SW}  x1="0" y1="-3"  x2="-28" y2="40"/>
<line   ${SW}  x1="0" y1="-3"  x2="28"  y2="40"/>
<path   ${SWS} d="M -28,40 A 32,32 0 0 0 28,40"/>
<line   ${SW}  x1="-16" y1="16" x2="16" y2="16"/>`,
  },

  {
    id:   'plane_blade',
    name: 'Wood Plane',
    tags: ['woodworker', 'joiner', 'cabinet', 'furniture', 'planer', 'craftsman'],
    elements: `
<rect  ${SW} x="-38" y="-12" width="76" height="24" rx="4"/>
<path  ${SW} d="M -10,-12 L 10,-26 L 30,-26 L 30,-12"/>
<line  ${SW} x1="-38" y1="0" x2="38" y2="0"/>
<path  ${SW} d="M -38,12 L -38,32 L 38,32 L 38,12"/>
<line  ${SW} x1="-20" y1="32" x2="-20" y2="42"/>
<line  ${SW} x1="20"  y1="32" x2="20"  y2="42"/>`,
    scale: 0.85,
  },

  // ── RESILIENCE / MARITIME ────────────────────────────────────────────────────
  {
    id:   'anchor',
    name: 'Anchor',
    tags: ['resilience', 'maritime', 'sailor', 'sea', 'strength', 'anchor', 'stability'],
    elements: `
<circle ${SWS} cx="0" cy="-28" r="8"/>
<line   ${SW}  x1="0"   y1="-20" x2="0"   y2="32"/>
<line   ${SW}  x1="-24" y1="-4"  x2="24"  y2="-4"/>
<path   ${SWS} d="M -22,18 C -36,28 -28,44 0,44 C 28,44 36,28 22,18"/>
<line   ${SW}  x1="-22" y1="22" x2="-10" y2="38"/>
<line   ${SW}  x1="22"  y1="22" x2="10"  y2="38"/>`,
  },

  // ── EUROPE ───────────────────────────────────────────────────────────────────
  {
    id:   'oak_branch',
    name: 'Oak Branch with Acorns',
    tags: ['europe', 'germany', 'england', 'britain', 'oak', 'strength', 'honor', 'eastern europe'],
    elements: `
<path ${SW} d="
  M 0,42 L 0,10
  M 0,10 C -8,4 -20,0 -28,-6 C -36,-12 -32,-24 -22,-24
           C -12,-24 -10,-16 -14,-8
  M 0,10 C 8,4 20,0 28,-6 C 36,-12 32,-24 22,-24
           C 12,-24 10,-16 14,-8
  M -14,-8 C -18,-2 -24,2 -28,10 C -32,18 -26,28 -16,24
  M 14,-8  C 18,-2  24,2  28,10  C 32,18  26,28  16,24
"/>
<circle ${SWS} cx="-22" cy="-32" r="6"/>
<line   ${SW}  x1="-22" y1="-26" x2="-22" y2="-20"/>
<circle ${SWS} cx="22"  cy="-32" r="6"/>
<line   ${SW}  x1="22"  y1="-26" x2="22"  y2="-20"/>`,
    scale: 0.9,
  },

  {
    id:   'fleur_de_lis',
    name: 'Fleur-de-Lis',
    tags: ['france', 'french', 'europe', 'western europe', 'honor', 'nobility', 'heraldry'],
    elements: `
<path ${SW} d="
  M 0,-42 C -8,-32 -12,-22 -8,-14
  C -14,-14 -22,-10 -24,-2
  C -18,-4 -12,-2 -8,4
  C -10,12 -12,20 -16,28
  L -8,28 C -6,20 -4,14 0,10
  C 4,14 6,20 8,28
  L 16,28 C 12,20 10,12 8,4
  C 12,-2 18,-4 24,-2
  C 22,-10 14,-14 8,-14
  C 12,-22 8,-32 0,-42
  Z
"/>
<line ${SW} x1="-16" y1="28" x2="16" y2="28"/>`,
  },

  // ── ASIA ─────────────────────────────────────────────────────────────────────
  {
    id:   'crane_wings',
    name: 'Crane Wings',
    tags: ['japan', 'japanese', 'asia', 'korean', 'china', 'harmony', 'freedom', 'crane'],
    elements: `
<path ${SW} d="M 0,0 C -8,-4 -24,-2 -42,-18 C -32,-12 -24,-4 -14,2"/>
<path ${SW} d="M 0,0 C 8,-4 24,-2 42,-18 C 32,-12 24,-4 14,2"/>
<path ${SW} d="M -14,2 C -8,4 -4,8 0,12 C 4,8 8,4 14,2 C 6,6 0,14 0,14"/>
<path ${SW} d="M 0,14 C -4,20 -8,30 -6,42 C -2,34 0,28 0,28 C 0,28 2,34 6,42 C 8,30 4,20 0,14"/>
<circle ${SWS} cx="0" cy="-8" r="6"/>`,
    scale: 0.95,
  },

  {
    id:   'mountain',
    name: 'Mountain Range',
    tags: ['mountain', 'mountains', 'peak', 'alps', 'rockies', 'strength', 'courage', 'canada'],
    elements: `
<path ${SW} d="M -42,30 L -22,-10 L -8,10 L 0,-20 L 8,10 L 22,-10 L 42,30 Z"/>
<path ${SW} d="M -8,10 L 0,-20 L 8,10"/>
<line ${SW} x1="-8" y1="6" x2="0" y2="-10"/>
<line ${SW} x1="8"  y1="6" x2="0" y2="-10"/>`,
  },

  {
    id:   'wheat_sheaf',
    name: 'Wheat Sheaf',
    tags: ['farmer', 'agriculture', 'grain', 'harvest', 'wheat', 'prosperity', 'community'],
    elements: `
<line ${SW} x1="0"   y1="42"  x2="0"   y2="-30"/>
<line ${SW} x1="-8"  y1="42"  x2="-10" y2="-22"/>
<line ${SW} x1="8"   y1="42"  x2="10"  y2="-22"/>
<line ${SW} x1="-16" y1="42"  x2="-20" y2="-10"/>
<line ${SW} x1="16"  y1="42"  x2="20"  y2="-10"/>
<line ${SW} x1="-24" y1="42"  x2="-30" y2="0"/>
<line ${SW} x1="24"  y1="42"  x2="30"  y2="0"/>
<ellipse ${SWS} cx="0"   cy="-34" rx="4"  ry="8"/>
<ellipse ${SWS} cx="-12" cy="-26" rx="4"  ry="8" transform="rotate(-12,-12,-26)"/>
<ellipse ${SWS} cx="12"  cy="-26" rx="4"  ry="8" transform="rotate(12,12,-26)"/>
<ellipse ${SWS} cx="-22" cy="-14" rx="4"  ry="8" transform="rotate(-22,-22,-14)"/>
<ellipse ${SWS} cx="22"  cy="-14" rx="4"  ry="8" transform="rotate(22,22,-14)"/>
<path   ${SW}  d="M -18,18 C -18,10 18,10 18,18"/>`,
    scale: 0.85,
  },

  // ── VALUES ───────────────────────────────────────────────────────────────────
  {
    id:   'eternal_knot',
    name: 'Eternal Knot',
    tags: ['loyalty', 'community', 'harmony', 'unity', 'family', 'bond'],
    elements: `
<path ${SW} d="
  M 0,-42 C 20,-42 42,-20 42,0
  C 42,20 20,42 0,42
  C -20,42 -42,20 -42,0
  C -42,-20 -20,-42 0,-42 Z
"/>
<path ${SW} d="
  M 0,-24 C 10,-24 24,-10 24,0
  C 24,10 10,24 0,24
  C -10,24 -24,10 -24,0
  C -24,-10 -10,-24 0,-24 Z
"/>
<path ${SW} d="M -42,0 L -24,0 M 24,0 L 42,0"/>
<path ${SW} d="M 0,-42 L 0,-24 M 0,24 L 0,42"/>`,
  },

  {
    id:   'flame',
    name: 'Flame',
    tags: ['courage', 'wisdom', 'creativity', 'spirit', 'fire', 'passion', 'truth'],
    elements: `
<path ${SW} d="
  M 0,40
  C -24,30 -28,10 -16,-8
  C -20,-4 -18,4 -14,6
  C -12,-10 -4,-28 0,-42
  C 4,-28 12,-10 14,6
  C 18,4 20,-4 16,-8
  C 28,10 24,30 0,40
  Z
"/>`,
  },

  {
    id:   'rising_sun',
    name: 'Rising Sun',
    tags: ['genesis', 'new', 'now', 'today', 'japan', 'beginning', 'dawn', 'hope'],
    elements: `
<path   ${SWS} d="M -42,8 A 42,42 0 0 1 42,8"/>
<line   ${SW}  x1="0"   y1="8"   x2="0"   y2="-38"/>
<line   ${SW}  x1="-20" y1="4"   x2="-34" y2="-28"/>
<line   ${SW}  x1="20"  y1="4"   x2="34"  y2="-28"/>
<line   ${SW}  x1="-36" y1="8"   x2="-14" y2="8"/>
<line   ${SW}  x1="14"  y1="8"   x2="36"  y2="8"/>
<line   ${SW}  x1="-42" y1="18"  x2="42"  y2="18"/>`,
  },

  {
    id:   'lotus',
    name: 'Lotus',
    tags: ['india', 'asia', 'harmony', 'spiritual', 'purity', 'buddhist', 'creativity'],
    elements: `
<path ${SW} d="M 0,20 C -8,8 -16,-8 -14,-24 C -10,-16 -6,-8 0,-4 C 6,-8 10,-16 14,-24 C 16,-8 8,8 0,20"/>
<path ${SW} d="M 0,20 C -16,14 -30,4 -32,-12 C -24,-8 -14,0 -8,4"/>
<path ${SW} d="M 0,20 C 16,14 30,4 32,-12 C 24,-8 14,0 8,4"/>
<path ${SW} d="M -32,-12 C -36,-24 -28,-36 -20,-32"/>
<path ${SW} d="M 32,-12 C 36,-24 28,-36 20,-32"/>
<line ${SW} x1="-42" y1="24" x2="42" y2="24"/>`,
  },

  {
    id:   'olive_branch',
    name: 'Olive Branch',
    tags: ['mediterranean', 'greece', 'italy', 'spain', 'peace', 'harmony', 'wisdom'],
    elements: `
<path ${SW} d="M 0,42 C -4,30 -8,18 -12,8 C -16,-2 -20,-12 -18,-24"/>
<ellipse ${SWS} cx="-26" cy="-18" rx="8" ry="5" transform="rotate(-40,-26,-18)"/>
<ellipse ${SWS} cx="-18" cy="-8"  rx="8" ry="5" transform="rotate(-20,-18,-8)"/>
<ellipse ${SWS} cx="-6"  cy="2"   rx="8" ry="5" transform="rotate(-10,-6,2)"/>
<ellipse ${SWS} cx="-8"  cy="16"  rx="8" ry="5" transform="rotate(10,-8,16)"/>
<ellipse ${SWS} cx="-4"  cy="30"  rx="8" ry="5" transform="rotate(20,-4,30)"/>
<circle  ${SWS} cx="-18" cy="-28" r="5"/>
<circle  ${SWS} cx="-8"  cy="-14" r="4"/>`,
    scale: 0.9,
  },

];

// ── Symbol selection ──────────────────────────────────────────────────────────

export function selectSymbols(
  origin:     string,
  occupation: string,
  values:     string[],
): { primary: LibrarySymbol; secondary?: LibrarySymbol } {
  const query = [origin, occupation, ...values].join(' ').toLowerCase();

  // Score each symbol
  const scored = SYMBOL_LIBRARY.map(sym => ({
    sym,
    score: sym.tags.reduce((acc, tag) => acc + (query.includes(tag) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);

  const primary = scored[0].sym;

  // Secondary: different category score, not the same symbol
  const secondary = scored.find((s, i) => i > 0 && s.score > 0 && s.sym.id !== primary.id)?.sym;

  return { primary, secondary };
}

// ── Render ────────────────────────────────────────────────────────────────────

const SHAPE_CLIP: Record<string, string> = {
  circle:   '<clipPath id="clip"><circle cx="100" cy="100" r="84"/></clipPath>',
  square:   '<clipPath id="clip"><rect x="16" y="16" width="168" height="168"/></clipPath>',
  triangle: '<clipPath id="clip"><polygon points="100,18 184,170 16,170"/></clipPath>',
};

const SHAPE_BORDER: Record<string, string> = {
  circle:   '<circle cx="100" cy="100" r="84" fill="none" stroke="COLOR" stroke-width="4.5"/>',
  square:   '<rect x="16" y="16" width="168" height="168" fill="none" stroke="COLOR" stroke-width="4.5"/>',
  triangle: '<polygon points="100,18 184,170 16,170" fill="none" stroke="COLOR" stroke-width="4.5"/>',
};

export function renderSealFromLibrary(
  origin:     string,
  occupation: string,
  values:     string[],
  shape:      string,
  color:      string,
  mode:       'primary_only' | 'with_secondary' = 'primary_only',
): { svg: string; symbolsUsed: string } {
  const { primary, secondary } = selectSymbols(origin, occupation, values);
  const scale = primary.scale ?? 1.0;

  const applyColor = (s: string) => s.replace(/\{\{COLOR\}\}/g, color);

  const primarySvg = applyColor(primary.elements);

  let secondarySvg = '';
  if (mode === 'with_secondary' && secondary) {
    const s2 = secondary.scale ?? 1.0;
    secondarySvg = `<g transform="translate(100,100) scale(${s2 * 0.38}) translate(-0,-0)" opacity="0.45">
      ${applyColor(secondary.elements)}
    </g>`;
  }

  const clipPath = SHAPE_CLIP[shape]  ?? SHAPE_CLIP.circle;
  const border   = (SHAPE_BORDER[shape] ?? SHAPE_BORDER.circle).replace(/COLOR/g, color);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>${clipPath}</defs>
  ${border}
  <g clip-path="url(#clip)">
    <g transform="translate(100,100) scale(${scale})">
      ${primarySvg}
    </g>
    ${secondarySvg}
  </g>
</svg>`;

  const used = secondary && mode === 'with_secondary'
    ? `${primary.name} + ${secondary.name}`
    : primary.name;

  return { svg, symbolsUsed: used };
}
