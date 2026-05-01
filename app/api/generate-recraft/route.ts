import { NextRequest, NextResponse } from 'next/server';
import { buildSealPrompts } from '@/app/lib/prompt-builder';

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN!;
const MODEL = 'recraft-ai/recraft-v3-svg';

async function generateSVG(prompt: string): Promise<string> {
  // Create prediction
  const createRes = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_TOKEN}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait=60',
    },
    body: JSON.stringify({
      input: {
        prompt,
        size: '1024x1024',
        style: 'vector_illustration/line_art',
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Replicate create failed: ${err}`);
  }

  let prediction = await createRes.json() as { id: string; status: string; output?: string; error?: string };

  // Poll until complete (fallback if Prefer:wait didn't resolve it)
  let attempts = 0;
  while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < 30) {
    await new Promise(r => setTimeout(r, 2000));
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Bearer ${REPLICATE_TOKEN}` },
    });
    prediction = await pollRes.json() as typeof prediction;
    attempts++;
  }

  if (prediction.status === 'failed' || !prediction.output) {
    throw new Error(prediction.error ?? 'Generation failed');
  }

  // Output is a URL to the SVG file — fetch it
  const svgUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  const svgRes = await fetch(svgUrl as string);
  if (!svgRes.ok) throw new Error('Failed to fetch SVG output');

  return await svgRes.text();
}

export async function POST(request: NextRequest) {
  try {
    const { origin, occupation, values, style } = await request.json();

    const prompts = buildSealPrompts({
      origin:     Array.isArray(origin)     ? origin     : [origin ?? ''],
      occupation: Array.isArray(occupation) ? occupation : [occupation ?? ''],
      values:     Array.isArray(values)     ? values     : [],
      style:      style ?? 'modern (clean, geometric)',
    });

    // Generate all 4 in parallel
    const results = await Promise.allSettled(prompts.map(p => generateSVG(p)));

    const seals = results.map((r, i) => ({
      variant: i,
      svg: r.status === 'fulfilled' ? r.value : null,
      error: r.status === 'rejected' ? String(r.reason) : null,
    }));

    const succeeded = seals.filter(s => s.svg !== null);
    if (succeeded.length === 0) {
      return NextResponse.json({ error: 'All generations failed' }, { status: 500 });
    }

    return NextResponse.json({ seals });
  } catch (err) {
    console.error('generate-recraft error:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
