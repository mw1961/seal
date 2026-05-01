import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });

    const apiId     = process.env.VECTORIZER_API_ID;
    const apiSecret = process.env.VECTORIZER_API_SECRET;
    if (!apiId || !apiSecret) return NextResponse.json({ error: 'Vectorizer not configured' }, { status: 500 });

    const formData = new FormData();
    formData.append('image.url', imageUrl);
    formData.append('output.file_format', 'svg');
    formData.append('processing.max_colors', '2');
    formData.append('output.group_by', 'none');
    // Change to 'production' after subscribing at vectorizer.ai
    formData.append('mode', 'test');

    const credentials = Buffer.from(`${apiId}:${apiSecret}`).toString('base64');
    const res = await fetch('https://vectorizer.ai/api/v1/vectorize', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${credentials}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: `Vectorizer failed: ${err}` }, { status: 500 });
    }

    const svg = await res.text();
    return NextResponse.json({ svg });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
