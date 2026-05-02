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

FORBIDDEN in every SVG:
- NO 5-pointed stars (too close to national/religious symbols)
- NO text, letters, numbers
- NO animals, faces, human figures
- NO religious symbols (no crosses, crescents, Stars of David)
- NO national flags or emblems
- NO thin strokes under 9px`;

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

    const seals = parsed.svgs.map((svg, i) => ({ variant: i, svg, imageUrl: null, error: null }));
    return NextResponse.json({ seals });

  } catch (err) {
    console.error('generate-seal:', err);
    // Fallback: 2 circles + 2 squares with distinct inner motifs
    const fallbackDefs = [
      {
        border: `<circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>`,
        inner: `<polygon points="150,48 190,116 270,116 210,164 232,242 150,196 68,242 90,164 30,116 110,116" fill="none" stroke="black" stroke-width="9"/><circle cx="150" cy="150" r="20" fill="black"/>`,
      },
      {
        border: `<rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>`,
        inner: `<circle cx="150" cy="150" r="90" fill="none" stroke="black" stroke-width="9"/><line x1="150" y1="60" x2="150" y2="240" stroke="black" stroke-width="9"/><line x1="60" y1="150" x2="240" y2="150" stroke="black" stroke-width="9"/><circle cx="150" cy="150" r="18" fill="black"/>`,
      },
      {
        border: `<circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>`,
        inner: `<polygon points="150,52 178,126 258,126 196,170 218,244 150,200 82,244 104,170 42,126 122,126" fill="none" stroke="black" stroke-width="9"/><circle cx="150" cy="150" r="28" fill="none" stroke="black" stroke-width="9"/>`,
      },
      {
        border: `<rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>`,
        inner: `<rect x="68" y="68" width="164" height="164" fill="none" stroke="black" stroke-width="9" transform="rotate(45 150 150)"/><circle cx="150" cy="150" r="40" fill="none" stroke="black" stroke-width="9"/><circle cx="150" cy="150" r="12" fill="black"/>`,
      },
    ];
    const seals = fallbackDefs.map(({ border, inner }, i) => ({
      variant: i, imageUrl: null, error: null,
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="white"/>${border}${inner}</svg>`,
    }));
    return NextResponse.json({ seals });
  }
}
