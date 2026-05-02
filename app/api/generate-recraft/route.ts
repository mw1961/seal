import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { SINGLE_SVG_SYSTEM, SINGLE_SVG_SHAPES, SVG_SYSTEM, BATCH_VOCABULARY } from '@/app/lib/seal-prompt';
import { generateMazeSvg } from '@/app/lib/maze-generator';

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Shape rotation per batch — guarantees no repeats across SVGs 1-4
const BATCH_SHAPES = [
  ['arcs',         'rotated_rects', 'radial_lines', 'rings'],
  ['rings',        'cultural',      'arcs',         'rotated_rects'],
  ['radial_lines', 'rings',         'cultural',     'arcs'],
  ['rotated_rects','arcs',          'rings',         'cultural'],
];

const BORDERS = {
  circle: `<circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>`,
  square: `<rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>`,
};

const SVG_ROLES = [
  { border: 'circle', lead: 'ORIGIN' },
  { border: 'square', lead: 'OCCUPATION' },
  { border: 'circle', lead: 'VALUES' },
  { border: 'square', lead: 'SYNTHESIS of all three' },
];

// Fallback for a single SVG slot
function fallbackSvg(i: number): string {
  const defs = [
    { b: BORDERS.circle, inner: `<circle cx="150" cy="150" r="80" fill="none" stroke="black" stroke-width="9"/><rect x="110" y="110" width="80" height="80" fill="none" stroke="black" stroke-width="9" transform="rotate(45 150 150)"/>` },
    { b: BORDERS.square, inner: `<rect x="65" y="65" width="170" height="170" fill="none" stroke="black" stroke-width="9" transform="rotate(45 150 150)"/><circle cx="150" cy="150" r="45" fill="none" stroke="black" stroke-width="9"/>` },
    { b: BORDERS.circle, inner: `<circle cx="150" cy="150" r="90" fill="none" stroke="black" stroke-width="9"/><rect x="100" y="100" width="100" height="100" fill="none" stroke="black" stroke-width="9" transform="rotate(45 150 150)"/>` },
    { b: BORDERS.square, inner: `<circle cx="150" cy="150" r="85" fill="none" stroke="black" stroke-width="9"/><rect x="115" y="115" width="70" height="70" fill="none" stroke="black" stroke-width="9"/>` },
  ];
  const d = defs[i % defs.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="white"/>${d.b}${d.inner}</svg>`;
}

// Validate a single SVG
function validateSvg(svg: string, idx: number): string {
  if (!svg || svg.length < 50) return fallbackSvg(idx);
  if (/<polygon/i.test(svg) || /<polyline/i.test(svg)) return fallbackSvg(idx);
  if (/M[\d\s.,]+L[\d\s.,]+L[\d\s.,]+Z/i.test(svg.replace(/\s+/g, ' '))) return fallbackSvg(idx);

  for (const [tag] of svg.matchAll(/<line[^>]+>/gi)) {
    const x1 = parseFloat(tag.match(/x1="([\d.]+)"/)?.[1] ?? '0');
    const y1 = parseFloat(tag.match(/y1="([\d.]+)"/)?.[1] ?? '0');
    const x2 = parseFloat(tag.match(/x2="([\d.]+)"/)?.[1] ?? '0');
    const y2 = parseFloat(tag.match(/y2="([\d.]+)"/)?.[1] ?? '0');
    const dx = x2-x1, dy = y2-y1, lenSq = dx*dx+dy*dy;
    if (lenSq < 1) continue;
    const t = Math.max(0, Math.min(1, ((150-x1)*dx+(150-y1)*dy)/lenSq));
    if (Math.abs(x1+t*dx-150) < 5 && Math.abs(y1+t*dy-150) < 5) return fallbackSvg(idx);
  }

  const circles = [...svg.matchAll(/<circle[^>]+>/gi)].map(m => {
    const tag = m[0];
    return {
      cx:   parseFloat(tag.match(/cx="([\d.]+)"/)?.[1] ?? '150'),
      cy:   parseFloat(tag.match(/cy="([\d.]+)"/)?.[1] ?? '150'),
      r:    parseFloat(tag.match(/\br="([\d.]+)"/)?.[1] ?? '0'),
      fill: tag.match(/fill="([^"]+)"/)?.[1] ?? 'none',
    };
  });
  const centeredRings = circles.filter(c => Math.hypot(c.cx-150, c.cy-150) < 5 && c.fill !== 'black').length;
  const centeredDot   = circles.some(c => Math.hypot(c.cx-150, c.cy-150) < 5 && c.fill === 'black' && c.r < 25);
  if (centeredRings >= 2 && centeredDot) return fallbackSvg(idx);

  for (const [tag] of svg.matchAll(/<circle[^>]+>/gi)) {
    const cx   = parseFloat(tag.match(/cx="([\d.]+)"/)?.[1] ?? '150');
    const cy   = parseFloat(tag.match(/cy="([\d.]+)"/)?.[1] ?? '150');
    const r    = parseFloat(tag.match(/\br="([\d.]+)"/)?.[1] ?? '0');
    const fill = tag.match(/fill="([^"]+)"/)?.[1] ?? 'none';
    const dist = Math.hypot(cx-150, cy-150);
    if (dist > 35 && r > 15 && r < 80) return fallbackSvg(idx);
    if (fill === 'black' && dist > 20 && r < 20) return fallbackSvg(idx);
  }

  return svg;
}

// Generate one SVG via a focused single-SVG call
async function generateOneSvg(
  origin: string, occupation: string, values: string,
  role: { border: string; lead: string },
  shapeType: string,
  idx: number,
): Promise<string> {
  const shapeInstruction = SINGLE_SVG_SHAPES[shapeType] ?? SINGLE_SVG_SHAPES.rings;
  const borderSvg = role.border === 'circle' ? BORDERS.circle : BORDERS.square;
  const prompt = `Family profile — Origin: ${origin} | Occupation: ${occupation} | Values: ${values}

Design role: Lead with ${role.lead} geometry.
Border: ${role.border} — use exactly: ${borderSvg}

SHAPE TYPE LOCKED — you must use ONLY this shape family:
${shapeInstruction}

Output a single complete SVG. Start with:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
<rect width="300" height="300" fill="white"/>
${borderSvg}`;

  try {
    const res = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: SINGLE_SVG_SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = res.content[0].type === 'text' ? res.content[0].text : '';
    // Extract SVG — Claude outputs raw SVG
    const match = text.match(/<svg[\s\S]*<\/svg>/i);
    const svg = match ? match[0] : '';
    return validateSvg(svg, idx);
  } catch {
    return fallbackSvg(idx);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { origin, occupation, values, variant = 0 } = await request.json();
    const originStr     = Array.isArray(origin)     ? origin.join(', ')     : origin;
    const occupationStr = Array.isArray(occupation) ? occupation.join(', ') : occupation;
    const valuesStr     = Array.isArray(values)     ? values.join(', ')     : values;

    const shapes = BATCH_SHAPES[variant % BATCH_SHAPES.length];

    // Run SVGs 1-4 in parallel, each with a different locked shape type
    const [svg0, svg1, svg2, svg3] = await Promise.all(
      SVG_ROLES.map((role, i) =>
        generateOneSvg(originStr, occupationStr, valuesStr, role, shapes[i], i)
      )
    );

    // SVGs 5 & 6: programmatic maze (deterministic, always valid, always different)
    const svg4 = generateMazeSvg(variant * 100 + 5);
    const svg5 = generateMazeSvg(variant * 100 + 6);

    const svgs = [svg0, svg1, svg2, svg3, svg4, svg5];
    const seals = svgs.map((svg, i) => ({ variant: i, svg, imageUrl: null, error: null }));
    return NextResponse.json({ seals });

  } catch (err) {
    console.error('generate-seal:', err);
    const seals = [0,1,2,3,4,5].map(i => ({ variant: i, imageUrl: null, error: null, svg: fallbackSvg(i) }));
    return NextResponse.json({ seals });
  }
}
