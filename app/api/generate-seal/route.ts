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
  circle:   '<circle cx="100" cy="100" r="88" fill="none" stroke="COLOR" stroke-width="2.5"/>',
  square:   '<rect x="12" y="12" width="176" height="176" fill="none" stroke="COLOR" stroke-width="2.5"/>',
  triangle: '<polygon points="100,14 188,174 12,174" fill="none" stroke="COLOR" stroke-width="2.5"/>',
};

function buildPrompt(profile: Omit<SealProfile, 'id' | 'createdAt'>, variationIndex: number): string {
  const style = STYLE_DESCRIPTIONS[profile.visual.style] ?? STYLE_DESCRIPTIONS.modern;
  const variationHints = [
    'Focus on the geographic/cultural origin as the primary motif',
    'Focus on the occupation/purpose as the primary motif',
    'Focus on the core values as the primary motif',
    'Blend all elements into a unified abstract composition',
    'Use the shape itself as the primary design element, filled with symbolic texture',
  ];

  return `You are a master seal designer specializing in ${profile.visual.style} heritage marks.

Design a single family seal symbol for this profile:
- Lineage: ${profile.roots.origin || 'unspecified origin'}
- Purpose/Occupation: ${profile.roots.historicOccupation || 'unspecified'}
- Core Values: ${profile.values.join(', ') || 'unspecified'}
- Shape boundary: ${profile.visual.shape}
- Style: ${style}
- Design focus for this variation: ${variationHints[variationIndex]}

OUTPUT RULES (strictly enforced — violations will be rejected):
1. Output ONLY the SVG <path> and <g> elements that form the INNER SYMBOL — no <svg> wrapper, no borders, no background
2. NO text, letters, numbers, or character glyphs anywhere
3. NO fill — only stroke. Use: stroke="{{COLOR}}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
4. All paths MUST end with Z (closed)
5. Design must be centered around the point 100,100
6. All coordinates must stay within a 30–170 range (fits inside all three shape options)
7. Minimum 3 distinct path elements, maximum 8
8. Pure geometric/abstract symbolic forms only — no literal drawings
9. The mark must feel like a family crest or clan mon, not a logo

Respond with ONLY the SVG path elements, nothing else. No explanation, no markdown, no code fences.`;
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
