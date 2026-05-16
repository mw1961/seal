/**
 * SYGNEO — Legacy Stamp Design Architect
 * 10 templates per shape. 6 selected per call based on profile hash.
 * Different profile = different template combination = genuine personalization.
 */

export function fontSpec(language: string): string {
  if (language.includes('Hebrew'))   return "'Frank Ruhl Libre', 'David', serif";
  if (language.includes('Arabic'))   return "'Noto Naskh Arabic', 'Scheherazade New', serif";
  if (language.includes('Greek'))    return "'GFS Didot', 'Palatino', serif";
  if (language.includes('Armenian')) return "'Noto Serif Armenian', serif";
  if (language.includes('Georgian')) return "'Noto Serif Georgian', serif";
  if (language.includes('Japanese') || language.includes('Chinese') || language.includes('Korean'))
                                     return "'Noto Serif CJK JP', serif";
  if (language.includes('Cyrillic')) return "'Palatino Linotype', 'PT Serif', serif";
  return "'Palatino Linotype', 'Palatino', 'Georgia', serif";
}

export function dyOffset(language: string): string {
  if (language.includes('Japanese') || language.includes('Chinese') || language.includes('Korean')) return '.38em';
  return '.35em';
}

// ── Deterministic profile-based template selection ─────────────────────────

export function profileHash(origin: string, values: string): number {
  const str = (origin + '|' + values).toLowerCase();
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h, 31) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

export function selectIndices(hash: number, total: number, count: number): number[] {
  const arr = Array.from({ length: total }, (_, i) => i);
  let h = hash;
  for (let i = total - 1; i > 0; i--) {
    h = Math.imul(h, 1664525) + 1013904223 | 0;
    const j = Math.abs(h) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

// ── Circle template library (10 options) ──────────────────────────────────

const CIRCLE_TEMPLATES: string[] = [
  // C0 — SINGLE RING
  `LAYOUT: Single bold ring. The letter is the hero.
Adapt r to origin strength: powerful lineage (Morocco, Iran, India) → r=84. Refined lineage (Japan, Scandinavia) → r=72. Default → r=78.
stroke-width=11. ONE element only.`,

  // C1 — DIAMOND FRAME
  `LAYOUT: Single rotated rect at 45°, centered on (150,150).
Adapt size to values: Courage/Justice/Honor → 96×96. Harmony/Wisdom → 82×82. Freedom/Creativity → 74×74. Default → 86×86.
stroke-width=11. ONE element only. Check: half-diagonal must be ≤ 100px from center.`,

  // C2 — DOUBLE RING
  `LAYOUT: Two concentric rings. Gap ≥ 24px between stroke centers.
Outer r=90, inner r=62 (gap=28). If lineage is new/future, reduce both by 6. If ancient, increase outer to r=94.
stroke-width=11 both. TWO elements only.`,

  // C3 — SUNBURST SPOKES
  `LAYOUT: 8 radial <line> elements. NO rings, NO rects.
Each spoke: inner end at r=52, outer end at r=88. Angles: 0° 45° 90° 135° 180° 225° 270° 315°.
Adapt length to values: analytical values (Wisdom, Justice) → longer spokes (r=48 to r=92). Default → r=52 to r=88.
stroke-width=10 each. EIGHT lines only.`,

  // C4 — RING + DIAMOND
  `LAYOUT: Ring + rotated rect inside.
Ring r: adapt to occupation — Scholar/Architect → r=88, Craftsman/Farmer → r=82. Default r=85.
Rotated rect: 72×72 at 45° (half-diagonal=51px, well within ring). stroke-width=11 both.
TWO elements. Verify rect corners stay inside ring.`,

  // C5 — CULTURAL HERITAGE PATH
  `LAYOUT: Ring + ONE cultural ornament path reflecting origin.
Ring r=84, stroke-width=11.
Cultural path MUST match origin:
  Morocco/Turkey/Iran → 6-arc interlace rosette inside r=60
  Japan/China/Korea → single bold arc 200° sweep at r=60
  Ireland/UK/Celtic → triple-arc spiral (3 arcs, each 120°, r=58)
  Greece/Mediterranean → 6-segment stepped meander at r=55-65
  Israel/Middle East → interlocked hexagonal arcs at r=58
  Russia/Eastern Europe → bold concentric arc brackets at r=60
  Default → 4 convex arcs at N/E/S/W, r=60, sweep=60°
All path points must stay outside r=52 and inside r=80.`,

  // C6 — WEIGHTED FRAME
  `LAYOUT: Bold thick outer ring + small inner ring.
Outer: r=94, stroke-width=13. Inner: r=58, stroke-width=11. Gap between stroke edges: (94-13/2)-(58+11/2) = 87.5-63.5 = 24px ✓
Adapt to lineage type: past dynasty → outer r=96, inner r=56. New lineage → outer r=90, inner r=60.
TWO elements. Minimum gap 22px.`,

  // C7 — RING + 8 TICK MARKS
  `LAYOUT: Ring + 8 short tick lines evenly spaced.
Ring r=86, stroke-width=11.
8 ticks: each 18px long, inner end at r=96, outer end at r=114. Wait — r=114 exceeds safe zone!
Correct: ticks between r=98 and r=112 (between border r=132 and ring r=86+5=91).
Angles: 0° 45° 90° 135° 180° 225° 270° 315°.
Adapt tick count to values: Community/Loyalty → 12 ticks at 30°. Default → 8 ticks.`,

  // C8 — TRIPLE CONCENTRIC
  `LAYOUT: Three concentric rings. Gaps ≥ 22px between each pair.
Rings: r=96, r=72, r=50. Gaps: 24px and 22px ✓
stroke-width=10 each. THREE elements only.
Adapt spacing to values: Resilience/Wisdom → equal spacing. Freedom/Creativity → unequal (r=98, r=68, r=48).`,

  // C9 — RING + CORNER BRACKETS
  `LAYOUT: Ring + 4 short L-bracket paths inside the ring.
Ring r=84, stroke-width=11.
4 L-brackets placed at NE/NW/SE/SW inside the ring (at ~r=62 from center).
Each bracket: two arms of 14px each, forming an L-shape. stroke-width=10 stroke-linecap="round".
Adapt to occupation: Builder/Carpenter/Architect → longer arms (18px). Default → 14px.`,
];

// ── Square template library (10 options) ──────────────────────────────────

const SQUARE_TEMPLATES: string[] = [
  // S0 — SINGLE INNER SQUARE
  `LAYOUT: Single bold inner square. The letter is the hero.
Adapt size to origin: ancient/complex → x=36, w=228. Simple/minimal → x=44, w=212. Default → x=40, w=220.
stroke-width=11. ONE element only.`,

  // S1 — DIAMOND FRAME
  `LAYOUT: Single rotated rect at 45°, centered on (150,150).
Adapt size to values: Courage/Justice → 104×104. Harmony/Wisdom → 88×88. Default → 96×96.
stroke-width=11. ONE element only. Half-diagonal must be ≤ 105px.`,

  // S2 — DOUBLE SQUARE
  `LAYOUT: Two nested squares. Gap ≥ 24px between stroke centers.
Outer: x=38, w=224. Inner: x=70, w=160. Gap = (70-5)-(38+5+112) = 65-155...
Correct: outer x=38 w=224 (half=112 from center minus 5=107 to inner edge). Inner x=72 w=156 (72-5=67 to outer edge). Gap = 107-67 = 40px ✓
stroke-width=11 both. Adapt gap to values: Loyalty/Community → 36px. Freedom → 44px.`,

  // S3 — SUNBURST SPOKES
  `LAYOUT: 8 radial <line> elements. NO squares, NO rings.
Each spoke: inner end r=52, outer end r=88. Same as circle C3.
stroke-width=10 each. EIGHT lines only.`,

  // S4 — SQUARE + RING
  `LAYOUT: Square + bold inner ring.
Square: adapt to occupation — Merchant/Diplomat → x=38 w=224. Craftsman/Farmer → x=44 w=212. Default x=40 w=220.
Ring r=76, stroke-width=11.
TWO elements. Ring must be well inside square (inner square edge at x+sw/2 = minimum 43px from center, ring outer edge 76+5=81px — ring IS inside square ✓).`,

  // S5 — HERITAGE FRAME + L-BRACKETS
  `LAYOUT: Square + 4 corner L-bracket paths.
Square: x=40, w=220, stroke-width=11.
4 L-brackets at inner corners of square. Each bracket 24px arms.
Top-left: M 72 100 L 72 72 L 100 72. Top-right: M 228 100 L 228 72 L 200 72.
Bottom-left: M 72 200 L 72 228 L 100 228. Bottom-right: M 228 200 L 228 228 L 200 228.
stroke-width=10 stroke-linecap="round".
Adapt arm length to origin: Western European → 28px. Default → 24px.`,

  // S6 — TRIPLE NESTED SQUARES
  `LAYOUT: Three nested squares. Gaps ≥ 22px.
Squares: x=38 w=224 (inner edge at 43px from border), x=72 w=156 (gap=34px), x=106 w=88 (gap=34px).
stroke-width=10 each. THREE elements. Gaps: both 34px ✓
Adapt to lineage: past dynasty → equal 34px gaps. New lineage → decreasing gaps (36, 28px).`,

  // S7 — SQUARE + TICK MARKS
  `LAYOUT: Square + 8 short tick marks at midpoints and corners.
Square: x=40, w=220, stroke-width=11.
8 ticks placed just outside the square on N/NE/E/SE/S/SW/W/NW, each 16px long.
Actually ticks should be INSIDE between the border and the square:
Ticks at r=105-118 from center at 8 angles. stroke-width=10.`,

  // S8 — SQUARE + ROTATED DIAMOND
  `LAYOUT: Square + small rotated rect (diamond) inside.
Square: x=40, w=220, stroke-width=11.
Diamond: rotated rect 80×80 at 45° (half-diagonal=57px, fits inside square ✓).
stroke-width=11. TWO elements.
Adapt diamond size to values: Courage/Honor → 90×90. Wisdom → 78×78. Default → 84×84.`,

  // S9 — CROSS MARKS
  `LAYOUT: Square + 4 line marks at midpoints of each side (inside).
Square: x=40, w=220, stroke-width=11.
4 lines: top (x1=150 y1=56 x2=150 y2=76), right (x1=244 y1=150 x2=224 y2=150),
bottom (x1=150 y1=244 x2=150 y2=224), left (x1=56 y1=150 x2=76 y2=150).
Each line 20px long, perpendicular to the side. stroke-width=10.
Adapt to occupation: Scholar → longer marks (24px). Default → 20px.`,
];

// ── Public API ──────────────────────────────────────────────────────────────

export function buildSystemPrompt(
  shape: 'circle' | 'square',
  selectedTemplates: string[],
): string {
  const border   = shape === 'circle'
    ? `<circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>`
    : `<rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>`;
  const safeZone = shape === 'circle'
    ? 'All inner shapes within radius 105 from center (150,150).'
    : 'All inner shapes within x:33–267, y:33–267.';
  const shapeRule = shape === 'circle'
    ? 'ALL 6 SVGs MUST use the circle border (r=132). No square borders.'
    : 'ALL 6 SVGs MUST use the square border (264×264 at x=18 y=18). No circle borders.';

  const templateList = selectedTemplates
    .map((t, i) => `\nDESIGN ${i + 1}:\n${t}`)
    .join('\n---');

  return `You are a master heritage stamp engineer for rubber stamp production.
Output ONLY valid JSON — no markdown:
{"svgs":["<svg>...</svg>","<svg>...</svg>","<svg>...</svg>","<svg>...</svg>","<svg>...</svg>","<svg>...</svg>"]}

${shapeRule}

EVERY SVG must contain in order:
1. <rect width="300" height="300" fill="white"/>
2. The outer border (as above)
3. The inner design shapes per the layout below

PRODUCTION RULES — non-negotiable:
- viewBox="0 0 300 300"
- Minimum stroke-width="10" for ALL decorative elements
- Only fill="none" fill="white" fill="black" — NO grays or gradients
- ${safeZone}
- CLEAR ZONE: no decorative element closer than r=58 from center (150,150) — letter sits there
- Minimum 22px gap between any two parallel stroke CENTERS (not edges)
- Do NOT add extra shapes beyond what each layout specifies

PERSONALIZATION RULE: Adapt sizes and proportions to the family profile as instructed in each layout. Each design must feel specific to THIS family, not generic.

${templateList}

BANNED: <polygon> <polyline> <ellipse> <text> <tspan>
BANNED CONTENT: religious symbols, military/weapon symbols, stars, crosses, crescents, triangles, eyes, flags, animals, faces, nationalist or hate symbols, scalloped/floral patterns`;
}

export function buildUserMessage(params: {
  origin:     string;
  occupation: string;
  values:     string;
  lineage:    string;
}): string {
  return `Family profile — use this to personalise sizes and ornamental styles:
Origins: ${params.origin || 'Universal'}
Occupation: ${params.occupation || 'Artisan'}
Values: ${params.values || 'Wisdom, Resilience'}
Lineage: ${params.lineage || 'From the past'}

Generate all 6 designs now, each adapted to this specific family.`;
}

export function getCircleTemplates(indices: number[]): string[] {
  return indices.map(i => CIRCLE_TEMPLATES[i % CIRCLE_TEMPLATES.length]);
}

export function getSquareTemplates(indices: number[]): string[] {
  return indices.map(i => SQUARE_TEMPLATES[i % SQUARE_TEMPLATES.length]);
}
