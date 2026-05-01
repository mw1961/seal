import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSealPrompts } from '@/app/lib/prompt-builder';

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── System prompt: Claude as SVG engineer ─────────────────────────────────────

const SVG_SYSTEM = `You are an expert SVG engineer specialized in geometric family seals for metal and rubber stamp production.

Your task: Generate 4 unique SVG seal designs based on a family profile.

SVG TECHNICAL REQUIREMENTS:
- viewBox="0 0 300 300", width="300", height="300"
- All elements: stroke="black", stroke-width between 5 and 10
- Fills: ONLY fill="black" (solid) or fill="white" or fill="none"
- NO grey, NO colors, NO gradients, NO opacity
- Stroke caps: stroke-linecap="round" stroke-linejoin="round"
- All designs centered at (150, 150)
- ALWAYS include an outer circular border: <circle cx="150" cy="150" r="135" fill="none" stroke="black" stroke-width="8"/>

DESIGN RULES:
- Strictly geometric and abstract — circles, polygons, lines, arcs, spirals only
- NO text, NO letters, NO animals, NO faces, NO human figures
- NO religious symbols, NO national flags, NO political symbols
- Bold thick strokes — minimum 5px (production requirement for 30mm stamp)
- Symmetric composition — radial or grid symmetry
- Translate origin/occupation/values into pure geometry:
  * Morocco → 12-point star polygon
  * Japan → minimal single centered circle motif
  * Carpenter → interlocking angular joints
  * Scholar → nested squares with proportional grid
  * Resilience → bold triangle nested in concentric rings
  * Loyalty → two interlocked rings

FOUR VARIANTS:
1. Origin-focused: geometric pattern inspired by the family's cultural roots
2. Occupation-focused: bold symbolic geometry representing the family's work
3. Values-focused: abstract geometric forms representing core values
4. Combined: concentric layered composition integrating all three elements

RESPONSE FORMAT — return ONLY valid JSON, no markdown, no explanation:
{
  "svgs": [
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='300' height='300'>DESIGN_1</svg>",
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='300' height='300'>DESIGN_2</svg>",
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='300' height='300'>DESIGN_3</svg>",
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='300' height='300'>DESIGN_4</svg>"
  ]
}`;

// ── Generate 4 SVGs via Claude ────────────────────────────────────────────────

async function generateSVGsWithClaude(profile: {
  origin: string[]; occupation: string[]; values: string[]; style: string;
}): Promise<string[]> {
  const userMessage =
    `Generate 4 geometric seal SVG designs for a family with:\n` +
    `Origin: ${profile.origin.join(', ')}\n` +
    `Occupation: ${profile.occupation.join(', ')}\n` +
    `Values: ${profile.values.join(', ')}\n` +
    `Style preference: ${profile.style}\n\n` +
    `Remember: return ONLY the JSON object with the "svgs" array.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    system: SVG_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  // Extract JSON — handle potential markdown code blocks
  const jsonMatch = text.match(/\{[\s\S]*"svgs"[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Claude returned no JSON');

  const parsed = JSON.parse(jsonMatch[0]) as { svgs?: string[] };
  if (!parsed.svgs || parsed.svgs.length === 0) throw new Error('No SVGs in response');

  return parsed.svgs;
}

// ── Fallback: algorithmic SVG ─────────────────────────────────────────────────

function algorithmicFallback(profile: {
  origin: string[]; occupation: string[]; values: string[]; style: string;
}): string[] {
  const prompts = buildSealPrompts(profile);
  return prompts.map((_, i) => {
    const angles = [3, 4, 5, 6][i];
    const points = Array.from({ length: angles * 2 }, (__, j) => {
      const r = j % 2 === 0 ? 120 : 60;
      const a = (j / (angles * 2)) * Math.PI * 2 - Math.PI / 2;
      return `${(150 + r * Math.cos(a)).toFixed(1)},${(150 + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300' width='300' height='300'>
  <circle cx="150" cy="150" r="135" fill="none" stroke="black" stroke-width="8"/>
  <circle cx="150" cy="150" r="100" fill="none" stroke="black" stroke-width="5"/>
  <polygon points="${points}" fill="none" stroke="black" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="150" cy="150" r="20" fill="black"/>
</svg>`;
  });
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { origin, occupation, values, style } = await request.json();

    const profile = {
      origin:     Array.isArray(origin)     ? origin     : [origin ?? ''],
      occupation: Array.isArray(occupation) ? occupation : [occupation ?? ''],
      values:     Array.isArray(values)     ? values     : [],
      style:      style ?? 'modern (clean, geometric)',
    };

    let svgs: string[];
    try {
      svgs = await generateSVGsWithClaude(profile);
    } catch (err) {
      console.warn('Claude SVG generation failed, using fallback:', err);
      svgs = algorithmicFallback(profile);
    }

    const seals = svgs.map((svg, i) => ({
      variant: i,
      svg,
      error: null,
    }));

    return NextResponse.json({ seals });
  } catch (err) {
    console.error('generate-seal:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
