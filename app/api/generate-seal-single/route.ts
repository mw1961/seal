import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { validateSealSafety, validateVectorSpecs } from '@/app/lib/root-library';
import { mapProfileToSymbols } from '@/app/lib/symbol-mapper';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SHAPE_CLIP: Record<string, string> = {
  circle:   '<clipPath id="clip"><circle cx="100" cy="100" r="86"/></clipPath>',
  square:   '<clipPath id="clip"><rect x="14" y="14" width="172" height="172"/></clipPath>',
  triangle: '<clipPath id="clip"><polygon points="100,16 186,172 14,172"/></clipPath>',
};

const SHAPE_BORDER: Record<string, string> = {
  circle:   '<circle cx="100" cy="100" r="86" fill="none" stroke="COLOR" stroke-width="4"/>',
  square:   '<rect x="14" y="14" width="172" height="172" fill="none" stroke="COLOR" stroke-width="4"/>',
  triangle: '<polygon points="100,16 186,172 14,172" fill="none" stroke="COLOR" stroke-width="4"/>',
};

const STYLE_FEEL: Record<string, string> = {
  japanese: 'extreme minimalism — one dominant symbol, vast negative space, like a kamon clan mark',
  modern:   'clean architectural precision — bold geometry, no decoration, confident and timeless',
  ancient:  'hand-carved quality — organic curves, slightly irregular, feels like it was made centuries ago',
  abstract: 'symbolic interpretation — the symbol suggests meaning rather than depicting it literally',
};

function buildRichPrompt(
  origin: string,
  occupation: string,
  values: string[],
  shape: string,
  style: string,
  lineage: string,
): string {
  const vocab = mapProfileToSymbols(origin, occupation, values);
  const feel  = STYLE_FEEL[style] ?? STYLE_FEEL.modern;
  const lineageNote = lineage === 'genesis'
    ? 'This is a new dynasty being founded TODAY — the seal marks a beginning, not a past.'
    : 'This seal honours an ancestral lineage — it should feel ancient, earned, and rooted.';

  return `You are a master seal engraver creating a heritage family crest for physical production.

FAMILY PROFILE:
- Origin: ${origin}
- Craft/Purpose: ${occupation}
- Core Values: ${values.join(', ')}
- ${lineageNote}

SYMBOLIC VOCABULARY FOR THIS FAMILY (use these — do not invent generic shapes):
- Geographic symbols: ${vocab.geographic.slice(0, 3).join(' · ')}
- Craft symbols: ${vocab.occupational.slice(0, 3).join(' · ')}
- Value symbols: ${vocab.values.slice(0, 2).join(' · ')}

DESIGN BRIEF:
Choose ONE primary symbol from the list above and compose it boldly inside a ${shape} boundary.
Add ONE secondary element that complements or frames it.
Style feel: ${feel}

The result must feel like this specific family's coat of arms — not a generic logo.
A family member should look at it and say "that is US."

PHYSICAL PRODUCTION RULES (hard limits — violations will be rejected):
- stroke-width MINIMUM 4 (thinner breaks during laser engraving)
- NO enclosed areas smaller than 12×12 units (fill with ink)
- MAX 5 path/shape elements total
- NO crossing lines that create tiny trapped areas
- Gap between parallel lines: minimum 10 units
- All paths closed with Z
- Monochrome only — stroke="{{COLOR}}" fill="none"
- Center around 100,100 — all coords within 30–170

OUTPUT: ONLY the inner SVG elements (paths, circles, lines, polygons).
No svg wrapper. No border. No background. No text. No explanation.`;
}

export async function POST(request: NextRequest) {
  try {
    const { origin, occupation, values, shape, style, lineage, color } = await request.json();

    const prompt = buildRichPrompt(
      origin     ?? '',
      occupation ?? '',
      values     ?? [],
      shape      ?? 'circle',
      style      ?? 'modern',
      lineage    ?? 'ancestry',
    );

    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw   = (message.content[0] as { type: string; text: string }).text.trim();
    const inkColor = color ?? '#000000';
    const inner = raw
      .replace(/```[a-z]*/gi, '').replace(/```/g, '')
      .replace(/\{\{COLOR\}\}/g, inkColor)
      .replace(/stroke="(?!none)[^"]*"/g, `stroke="${inkColor}"`);

    const clipPath = SHAPE_CLIP[shape]  ?? SHAPE_CLIP.circle;
    const border   = (SHAPE_BORDER[shape] ?? SHAPE_BORDER.circle).replace(/COLOR/g, inkColor);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>${clipPath}</defs>
  ${border}
  <g clip-path="url(#clip)">
    ${inner}
  </g>
</svg>`;

    const safety = validateSealSafety(svg);
    if (!safety.ok) return NextResponse.json({ error: safety.reason }, { status: 422 });

    const specs = validateVectorSpecs(svg);

    return NextResponse.json({ svg, valid: specs.ok, issues: specs.issues, symbols: mapProfileToSymbols(origin, occupation, values).summary });
  } catch (err) {
    console.error('generate-seal-single error:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
