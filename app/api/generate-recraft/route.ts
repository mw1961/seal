import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SVG_SYSTEM = `You are an SVG engineer for rubber stamp and metal seal production.

Output ONLY valid JSON — no markdown, no explanation:
{"svgs":["<svg>...</svg>","<svg>...</svg>","<svg>...</svg>","<svg>...</svg>"]}

MANDATORY LAYOUT — always exactly:
- SVG 1: CIRCLE border + origin-inspired inner motif
- SVG 2: SQUARE border + occupation-inspired inner motif
- SVG 3: CIRCLE border + values-inspired inner motif
- SVG 4: SQUARE border + combined motif (origin + occupation + values)

PRODUCTION RULES (rubber/metal stamp):
- viewBox="0 0 300 300", white background rect
- Circle border: <circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>
- Square border: <rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>
- ALL inner strokes: stroke-width="9" minimum
- NO hairlines, NO thin details — minimum 9px or they break in production
- Only fill="black" or fill="none" with stroke="black"
- Maximum 5 shapes total per SVG (including border)
- All inner shapes centered at (150,150), within safe area (radius 110 for circles, 110px inset for squares)

PROFILE TRANSLATION — make each design UNIQUE to this specific family:
Origin examples:
  Morocco → 8-point interlocked star polygon (Zellige geometry)
  Poland → angular folk cross with diamond ends
  Israel → interlaced hexagonal ring pattern
  Japan → single circle with minimal radial divisions
  Germany → bold angular interlocked squares
  Italy → circular rosette with triangular petals
  Russia → concentric bold rings with angular dividers

Occupation examples:
  Farmer/Agriculture → radial spoke wheel (12 spokes)
  Craftsman/Carpenter → interlocking angular L-joints forming a square
  Merchant/Trader → balanced diamond bisected by horizontal axis
  Physician/Healer → bold plus inside circle (NOT a cross — geometric plus shape)
  Scholar/Teacher → nested squares rotated 45 degrees
  Sailor/Fisherman → 8-point compass star with inner ring
  Engineer → bold gear-like polygon with 8 flat teeth

Values examples:
  Resilience → bold upward triangle inscribed in circle
  Loyalty → two interlocked bold rings
  Wisdom → hexagon with inner triangle
  Courage → bold diamond with rays
  Harmony → yin-yang inspired bisected circle (bold arcs only)
  Community → three interlocked circles

STRICTLY FORBIDDEN — if you include any of these, the output is invalid:
- NO star shapes of any kind — no polygon with alternating long/short radii
- NO 5-pointed, 6-pointed, or any-pointed star polygons
- NO <polygon> with 10 points (that is a 5-pointed star) — use <polygon> with 6, 8, or 12 EQUAL sides only
- NO text, letters, numbers
- NO animals, faces, human figures, hands
- NO religious symbols: no crosses, crescents, Stars of David, triangles pointing up combined with circles
- NO national flags or emblems
- NO thin strokes under 9px
- Each of the 4 SVGs MUST have a visually different inner motif — no two can look similar

ALLOWED polygon types (equal sides only):
- Hexagon: 6 equal sides
- Octagon: 8 equal sides
- Decagon: 10 equal sides (all same length — NOT a star)
- Use <circle>, <rect>, <line>, <path> with arcs for variety`;

// ── Fallback SVG (clean geometric, no stars) ─────────────────────────────────

function fallbackSvg(i: number): string {
  const defs = [
    {
      border: `<circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>`,
      inner:  `<polygon points="150,55 237,97 237,203 150,245 63,203 63,97" fill="none" stroke="black" stroke-width="9"/><circle cx="150" cy="150" r="30" fill="black"/>`,
    },
    {
      border: `<rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>`,
      inner:  `<circle cx="150" cy="150" r="90" fill="none" stroke="black" stroke-width="9"/><line x1="150" y1="60" x2="150" y2="240" stroke="black" stroke-width="9"/><line x1="60" y1="150" x2="240" y2="150" stroke="black" stroke-width="9"/><line x1="86" y1="86" x2="214" y2="214" stroke="black" stroke-width="9"/><line x1="214" y1="86" x2="86" y2="214" stroke="black" stroke-width="9"/>`,
    },
    {
      border: `<circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>`,
      inner:  `<circle cx="150" cy="150" r="90" fill="none" stroke="black" stroke-width="9"/><circle cx="150" cy="150" r="50" fill="none" stroke="black" stroke-width="9"/><polygon points="150,65 224,107 224,193 150,235 76,193 76,107" fill="none" stroke="black" stroke-width="9"/>`,
    },
    {
      border: `<rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>`,
      inner:  `<rect x="65" y="65" width="170" height="170" fill="none" stroke="black" stroke-width="9" transform="rotate(45 150 150)"/><circle cx="150" cy="150" r="45" fill="none" stroke="black" stroke-width="9"/><circle cx="150" cy="150" r="14" fill="black"/>`,
    },
  ];
  const d = defs[i % defs.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="white"/>${d.border}${d.inner}</svg>`;
}

export async function POST(request: NextRequest) {
  try {
    const { origin, occupation, values, style } = await request.json();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SVG_SYSTEM,
      messages: [{
        role: 'user',
        content: `Origin: ${Array.isArray(origin) ? origin.join(', ') : origin}\nOccupation: ${Array.isArray(occupation) ? occupation.join(', ') : occupation}\nValues: ${Array.isArray(values) ? values.join(', ') : values}\nStyle: ${style}`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*"svgs"[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]) as { svgs?: string[] };
    if (!parsed.svgs?.length) throw new Error('No SVGs');

    // Validate: reject any SVG containing a star polygon (10-point polygon)
    const validated = parsed.svgs.map((svg, i) => {
      const isStarPolygon = /points="[^"]*"/.test(svg) &&
        (svg.match(/\d+\.\d+,\d+\.\d+/g) || []).length === 10;
      if (isStarPolygon) {
        console.warn(`SVG ${i} contains star polygon — using fallback`);
        return fallbackSvg(i);
      }
      return svg;
    });

    const seals = validated.map((svg, i) => ({ variant: i, svg, imageUrl: null, error: null }));
    return NextResponse.json({ seals });

  } catch (err) {
    console.error('generate-seal:', err);
    const seals = [0, 1, 2, 3].map(i => ({ variant: i, imageUrl: null, error: null, svg: fallbackSvg(i) }));
    return NextResponse.json({ seals });
  }
}
