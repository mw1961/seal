import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { validateSealSafety, validateVectorSpecs } from '@/app/lib/root-library';
import type { SealProfile } from '@/app/lib/root-library';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STYLE_DESCRIPTIONS: Record<string, string> = {
  japanese:  'Japanese kamon/mon style — extreme minimalism, perfect symmetry, bold geometric forms, negative space is as important as the mark itself',
  modern:    'Modern minimalist — clean geometric shapes, mathematical precision, no ornamentation, architectural clarity',
  ancient:   'Ancient heritage — organic curves, irregular hand-carved quality, layered organic forms, feels like it was made centuries ago',
  abstract:  'Abstract symbolic — free-form geometric, shapes carry meaning not appearance, could be read multiple ways',
};

const SHAPE_CLIP: Record<string, string> = {
  circle:   '<clipPath id="clip"><circle cx="100" cy="100" r="88"/></clipPath>',
  square:   '<clipPath id="clip"><rect x="12" y="12" width="176" height="176"/></clipPath>',
  triangle: '<clipPath id="clip"><polygon points="100,14 188,174 12,174"/></clipPath>',
};

const SHAPE_BORDER: Record<string, string> = {
  circle:   '<circle cx="100" cy="100" r="88" fill="none" stroke="COLOR" stroke-width="4"/>',
  square:   '<rect x="12" y="12" width="176" height="176" fill="none" stroke="COLOR" stroke-width="4"/>',
  triangle: '<polygon points="100,14 188,174 12,174" fill="none" stroke="COLOR" stroke-width="4"/>',
};

function buildPrompt(profile: Omit<SealProfile, 'id' | 'createdAt'>, variationIndex: number): string {
  const style = STYLE_DESCRIPTIONS[profile.visual.style] ?? STYLE_DESCRIPTIONS.modern;
  const variationHints = [
    'Draw a single bold geometric form inspired by the geographic or cultural origin',
    'Draw a single bold geometric form inspired by the family occupation or purpose',
    'Draw a single bold geometric form that expresses the core values symbolically',
    'Draw a unified abstract mark combining origin and values into one simple shape',
    'Draw a bold minimalist mark using only 2–3 geometric primitives (circle, line, arc)',
  ];

  return `You are a master hanko and wax-seal engraver. You design marks that will be physically CNC-engraved into metal and used as ink stamps.

PHYSICAL PRODUCTION CONSTRAINTS — these are hard limits, not suggestions:
- Minimum stroke-width: 4 (anything thinner breaks during engraving)
- NO enclosed areas smaller than 12×12 units (they fill with ink and become blobs)
- NO more than 4 path elements total (complexity destroys stamp legibility)
- NO star shapes, NO snowflakes, NO multi-point radial patterns
- NO overlapping lines or paths that cross each other more than once
- Minimum gap between any two parallel lines: 10 units
- All paths closed with Z

Family profile:
- Origin: ${profile.roots.origin || 'unspecified'}
- Occupation/Purpose: ${profile.roots.historicOccupation || 'unspecified'}
- Core Values: ${profile.values.join(', ') || 'unspecified'}
- Style: ${style}
- This variation: ${variationHints[variationIndex]}

DESIGN APPROACH — think like a Japanese kamon master:
- One dominant shape that fills the space boldly
- Maximum 1 secondary element inside or around it
- Wide strokes, open spaces, strong silhouette
- The mark must be readable at 30mm diameter
- Think: crescent + dot, bold spiral, three parallel arcs, a single open lotus form

SVG RULES:
1. Output ONLY inner path/g elements — no svg wrapper, no border, no background
2. stroke="{{COLOR}}" fill="none" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
3. Center all elements around 100,100
4. All coordinates within 35–165 range
5. NO text, letters, numbers anywhere

Respond with ONLY the SVG elements. No explanation, no markdown, no code fences.`;
}

async function generateOneSeal(
  profile: Omit<SealProfile, 'id' | 'createdAt'>,
  variationIndex: number,
  color: string
): Promise<string | null> {
  const prompt = buildPrompt(profile, variationIndex);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();

  // Inject color and wrap in full SVG
  const innerWithColor = raw.replace(/\{\{COLOR\}\}/g, color).replace(/stroke="[^"]*"/g, `stroke="${color}"`);

  const clipPath = SHAPE_CLIP[profile.visual.shape] ?? SHAPE_CLIP.circle;
  const border = (SHAPE_BORDER[profile.visual.shape] ?? SHAPE_BORDER.circle).replace(/COLOR/g, color);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>${clipPath}</defs>
  ${border}
  <g clip-path="url(#clip)">
    ${innerWithColor}
  </g>
</svg>`;

  // Validate
  const safety = validateSealSafety(svg);
  if (!safety.ok) return null;

  const specs = validateVectorSpecs(svg);
  if (!specs.ok) return null;

  return svg;
}

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json() as { profile: Omit<SealProfile, 'id' | 'createdAt'> };

    if (!profile) {
      return NextResponse.json({ error: 'Profile required' }, { status: 400 });
    }

    const color = profile.visual.inkColor ?? '#000000';
    const results: (string | null)[] = await Promise.all(
      [0, 1, 2, 3, 4].map(i => generateOneSeal(profile, i, color))
    );

    const seals = results.filter((s): s is string => s !== null);

    if (seals.length === 0) {
      return NextResponse.json({ error: 'Generation failed — all variations were rejected by safety filter' }, { status: 500 });
    }

    return NextResponse.json({ seals });
  } catch (err) {
    console.error('generate-seal error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
