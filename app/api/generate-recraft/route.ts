import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSealPrompts } from '@/app/lib/prompt-builder';

export const maxDuration = 60;

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── System prompt for Claude ──────────────────────────────────────────────────

const CLAUDE_SYSTEM = `You are a specialized prompt engineer for industrial engraving design. Your task is to transform user profile data into 4 distinct, precise image generation prompts.

THE GOAL: Create a 30x30mm geometric seal design that is production-ready for metal/laser engraving.

STRICT DESIGN RULES (MUST BE IN EVERY PROMPT):
1. Color: Strictly solid black on a pure white background. No gray, no shading, no gradients.
2. Composition: Perfect centered symmetry. The design must be contained within a circular or square boundary, with clear safe margins (not touching the edges).
3. Line Weight: Very thick, bold solid lines (minimum 2mm thickness equivalent). No fine details or hairlines.
4. Content: Strictly geometric and abstract.
5. Forbidden: No text, no letters, no human figures, no animals, no religious symbols, no national flags, no colors.

TRANSLATION RULES — convert all input data to abstract geometry:
- Country/Origin → abstract cultural geometric pattern (e.g., Morocco → interlocking polygon star grid; Japan → radial circular mon symmetry)
- Profession → symbolic geometric metaphor (e.g., Carpenter → interlocking angular joints; Musician → concentric arc waves)
- Values → pure geometric forms (e.g., Resilience → nested triangle in concentric rings; Loyalty → two interlocked rings)
- Style → aesthetic language (Japanese → extreme negative space, single motif; Ancient → interlaced knotwork; Modern → grid precision)

OUTPUT FORMAT — exactly 4 prompts numbered 1-4:
- Prompt 1: Focus on Origin/Roots — abstract cultural geometric patterns from the family's origins.
- Prompt 2: Focus on Profession/Values — symbolic geometric shapes representing work and values.
- Prompt 3: Minimalist Style-first interpretation — pure aesthetic geometry (Japanese Zen / Swiss Grid / Celtic interlace / etc.)
- Prompt 4: Hybrid synthesis of all elements — concentric layered composition combining origin, profession, and values.

PROMPT TEMPLATE — use this exact structure for each:
"A bold geometric seal, [Style] aesthetic. [Visual description of abstract shapes]. Perfect circular symmetry, centered composition. Solid black thick lines on white background. Stencil-ready, high contrast, no anti-aliasing. --no shading, thin lines, text, letters, animals, faces, religious symbols, flags, colors, gradients"

Output exactly 4 lines:
REPLICATE_PROMPT_1: [prompt]
REPLICATE_PROMPT_2: [prompt]
REPLICATE_PROMPT_3: [prompt]
REPLICATE_PROMPT_4: [prompt]`;

// ── Ask Claude to generate 4 prompts ─────────────────────────────────────────

async function generatePromptsWithClaude(profile: {
  origin: string[];
  occupation: string[];
  values: string[];
  style: string;
}): Promise<string[]> {
  const userMessage =
    `Generate 4 different stamp design prompts for a family with:\n` +
    `Origin: ${profile.origin.join(', ')}\n` +
    `Occupation/Heritage: ${profile.occupation.join(', ')}\n` +
    `Values: ${profile.values.join(', ')}\n` +
    `Visual style preference: ${profile.style}`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: CLAUDE_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  console.log('Claude response:', text.slice(0, 500));

  const prompts: string[] = [];

  // Try numbered format: REPLICATE_PROMPT_1: ...
  for (let i = 1; i <= 4; i++) {
    const match = text.match(new RegExp(`REPLICATE_PROMPT_${i}:\\s*([^\\n]+)`));
    if (match) prompts.push(match[1].trim());
  }

  // Fallback: single REPLICATE_PROMPT: ...
  if (prompts.length === 0) {
    const single = text.match(/REPLICATE_PROMPT:\s*([^\n]+)/);
    if (single) prompts.push(single[1].trim());
  }

  // Fallback: any line that looks like a prompt (longer than 40 chars, no header)
  if (prompts.length === 0) {
    const lines = text.split('\n')
      .map(l => l.replace(/^[\d\.\-\*]+\s*/, '').trim())
      .filter(l => l.length > 40 && !l.startsWith('REPLICATE') && !l.startsWith('Output'));
    prompts.push(...lines.slice(0, 4));
  }

  if (prompts.length === 0) throw new Error('Claude returned no parseable prompts');
  return prompts;
}

// ── Generate image via Replicate ──────────────────────────────────────────────

async function generateImage(prompt: string): Promise<string> {
  if (!REPLICATE_TOKEN) throw new Error('REPLICATE_API_TOKEN not configured');

  const createRes = await fetch('https://api.replicate.com/v1/models/recraft-ai/recraft-v3-svg/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt,
        size: '1024x1024',
        style: 'line_art',
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Replicate error ${createRes.status}: ${err}`);
  }

  let pred = await createRes.json() as {
    id: string; status: string; output?: unknown; error?: string; urls?: { get: string };
  };

  const deadline = Date.now() + 50_000;
  while (pred.status !== 'succeeded' && pred.status !== 'failed') {
    if (Date.now() > deadline) throw new Error('Timeout');
    await new Promise(r => setTimeout(r, 2500));
    const pollRes = await fetch(
      pred.urls?.get ?? `https://api.replicate.com/v1/predictions/${pred.id}`,
      { headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` } }
    );
    pred = await pollRes.json() as typeof pred;
  }

  if (pred.status === 'failed') throw new Error(pred.error ?? 'Prediction failed');

  const output = pred.output;
  const url = Array.isArray(output) ? (output as string[])[0] : output as string;
  if (!url) throw new Error('No output URL');

  // recraft-v3-svg returns SVG file URL — fetch it
  const svgRes = await fetch(url);
  if (!svgRes.ok) throw new Error(`Failed to fetch SVG: ${svgRes.status}`);
  let svg = await svgRes.text();

  // Force square viewBox, responsive size
  svg = svg.replace(/<svg([^>]*)>/i, (_m, attrs: string) => {
    const clean = attrs.replace(/\s+width="[^"]*"/g, '').replace(/\s+height="[^"]*"/g, '').replace(/\s+viewBox="[^"]*"/g, '');
    return `<svg${clean} width="100%" height="100%" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet">`;
  });
  return svg;
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

    // Step 1: Claude generates 4 optimized prompts (fallback to static builder)
    let prompts: string[];
    try {
      prompts = await generatePromptsWithClaude(profile);
    } catch (claudeErr) {
      console.warn('Claude failed, using static builder:', claudeErr);
      prompts = buildSealPrompts(profile);
    }

    // Step 2: Replicate generates images in parallel
    const results = await Promise.allSettled(prompts.map(p => generateImage(p)));

    const seals = results.map((r, i) => ({
      variant:  i,
      svg:      r.status === 'fulfilled' ? r.value : null,
      error:    r.status === 'rejected'  ? String(r.reason) : null,
    }));

    const succeeded = seals.filter(s => s.svg !== null);
    if (succeeded.length === 0) {
      const errors = seals.map(s => s.error).join(' | ');
      return NextResponse.json({ error: `All generations failed: ${errors}` }, { status: 500 });
    }

    return NextResponse.json({ seals });
  } catch (err) {
    console.error('generate-recraft:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
