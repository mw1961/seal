import { NextRequest, NextResponse } from 'next/server';
import { renderSealFromLibrary, selectSymbols, SYMBOL_LIBRARY } from '@/app/lib/symbol-library';

export async function POST(request: NextRequest) {
  try {
    const { origin, occupation, values, shape, color, mode } = await request.json();

    const result = renderSealFromLibrary(
      origin     ?? '',
      occupation ?? '',
      values     ?? [],
      shape      ?? 'circle',
      color      ?? '#000000',
      mode       ?? 'primary_only',
    );

    const { primary, secondary } = selectSymbols(origin, occupation, values);

    return NextResponse.json({
      svg:          result.svg,
      symbolsUsed:  result.symbolsUsed,
      primaryId:    primary.id,
      secondaryId:  secondary?.id ?? null,
    });
  } catch (err) {
    console.error('generate-seal-library error:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    symbols: SYMBOL_LIBRARY.map(s => ({ id: s.id, name: s.name, tags: s.tags })),
  });
}
