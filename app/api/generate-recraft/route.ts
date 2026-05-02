import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { buildSealPrompts } from '@/app/lib/prompt-builder';

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Claude: generate 4 prompts ────────────────────────────────────────────────

const CLAUDE_SYSTEM = `You are a specialized prompt engineer for industrial engraving design. Transform family heritage data into 4 distinct image generation prompts.

GOAL: 30x30mm geometric seal, production-ready for metal/laser engraving.

STRICT RULES FOR EVERY PROMPT:
- Strictly solid black on pure white background. No grey, no shading, no gradients.
- Perfect centered symmetry within a circular boundary.
- Very thick bold lines only. No fine details or hairlines.
- Strictly geometric and abstract.
- FORBIDDEN: text, letters, human figures, animals, religious symbols, national flags.

TRANSLATE input data to abstract geometry — NEVER literal objects:
- Origin → cultural geometric pattern (Morocco → 12-point star grid; Japan → circular mon)
- Profession → symbolic geometry (Carpenter → interlocking angular joints; Scholar → mathematical grid)
- Values → abstract form (Resilience → nested triangle in rings; Loyalty → two interlocked rings)

Output EXACTLY 4 lines:
REPLICATE_PROMPT_1: [origin-focused prompt]
REPLICATE_PROMPT_2: [profession/values-focused prompt]
REPLICATE_PROMPT_3: [style-first minimalist prompt]
REPLICATE_PROMPT_4: [hybrid synthesis prompt]`;

async function getPromptsFromClaude(profile: {
  origin: string[]; occupation: string[]; values: string[]; style: string;
}): Promise<string[]> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: CLAUDE_SYSTEM,
    messages: [{
      role: 'user',
      content: `Origin: ${profile.origin.join(', ')}\nOccupation: ${profile.occupation.join(', ')}\nValues: ${profile.values.join(', ')}\nStyle: ${profile.style}`,
    }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  const prompts: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const m = text.match(new RegExp(`REPLICATE_PROMPT_${i}:\\s*([^\\n]+)`));
    if (m) prompts.push(m[1].trim());
  }
  if (prompts.length === 0) {
    const lines = text.split('\n').map(l => l.replace(/^[\d\.\-\*]+\s*/, '').trim()).filter(l => l.length > 40);
    prompts.push(...lines.slice(0, 4));
  }
  if (prompts.length === 0) throw new Error('No prompts');
  return prompts;
}

// ── Leonardo: generate PNG ────────────────────────────────────────────────────

async function callLeonardoAPI(prompt: string): Promise<string> {
  const apiKey = process.env.LEONARDO_API_KEY;
  if (!apiKey) throw new Error('LEONARDO_API_KEY not configured');

  const createRes = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      negative_prompt: 'photo, realistic, texture, noise, blur, gradients, shading, grey, colors, animals, faces, text, letters, messy, chaotic',
      width: 1024,
      height: 1024,
      num_images: 1,
      contrast: 3.5,
    }),
  });

  if (!createRes.ok) throw new Error(`Leonardo ${createRes.status}: ${await createRes.text()}`);

  const data = await createRes.json() as { sdGenerationJob?: { generationId?: string } };
  const generationId = data?.sdGenerationJob?.generationId;
  if (!generationId) throw new Error('No generationId');

  const deadline = Date.now() + 50_000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 3000));
    const poll = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const d = await poll.json() as { generations_by_pk?: { status?: string; generated_images?: { url: string }[] } };
    const gen = d?.generations_by_pk;
    if (gen?.status === 'COMPLETE' && gen.generated_images?.[0]?.url) return gen.generated_images[0].url;
    if (gen?.status === 'FAILED') throw new Error('Leonardo failed');
  }
  throw new Error('Timeout');
}

// ── POST ──────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { origin, occupation, values, style } = await request.json();
    const profile = {
      origin:     Array.isArray(origin)     ? origin     : [origin ?? ''],
      occupation: Array.isArray(occupation) ? occupation : [occupation ?? ''],
      values:     Array.isArray(values)     ? values     : [],
      style:      style ?? 'modern (clean, geometric)',
    };

    let prompts: string[];
    try {
      prompts = await getPromptsFromClaude(profile);
    } catch {
      prompts = buildSealPrompts(profile);
    }

    const results = await Promise.allSettled(prompts.map(p => callLeonardoAPI(p)));

    const seals = results.map((r, i) => ({
      variant:  i,
      imageUrl: r.status === 'fulfilled' ? r.value : null,
      error:    r.status === 'rejected'  ? String(r.reason) : null,
    }));

    if (seals.every(s => !s.imageUrl)) {
      return NextResponse.json({ error: seals.map(s => s.error).join(' | ') }, { status: 500 });
    }

    return NextResponse.json({ seals });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
