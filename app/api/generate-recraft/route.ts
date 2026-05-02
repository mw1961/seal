import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SVG_SYSTEM = `You are a heritage seal designer. Each design must carry a VISUAL METAPHOR — geometry that tells the story of this specific family.

Output ONLY valid JSON — no markdown, no explanation:
{"svgs":["<svg>...</svg>","<svg>...</svg>","<svg>...</svg>","<svg>...</svg>"]}

MANDATORY LAYOUT:
- SVG 1: CIRCLE border — motif based on family ORIGIN
- SVG 2: SQUARE border — motif based on family OCCUPATION
- SVG 3: CIRCLE border — motif based on family VALUES
- SVG 4: SQUARE border — synthesis of all three

PRODUCTION RULES:
- viewBox="0 0 300 300", always start with <rect width="300" height="300" fill="white"/>
- Circle border: <circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>
- Square border: <rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>
- Minimum stroke-width="9" everywhere — thinner lines break in rubber/metal engraving
- Only fill="black" or fill="none" + stroke="black"
- Max 5 shapes per SVG (including border)
- Safe zone: stay within radius 108 for circle, 15px inset for square

VISUAL METAPHORS — geometry with meaning (not just abstract shapes):

ORIGIN metaphors:
  Morocco → interlocking octagon grid (Zellige tile geometry)
  Poland → nested diamond with angular folk ornament
  Israel → interlaced hexagonal ring (ancient craftwork)
  Japan → single bold arc + dot (Ma — space and essence)
  Germany → precision interlocked rectangles (engineering heritage)
  Italy → circular wedge rosette (Renaissance craft wheel)
  Russia → bold concentric squares (folk lacquer geometry)
  UK/Ireland → triple arc spiral (ancient Celtic form)
  Greece → angular meander pattern inside ring
  France → radial wedge with bold outer ring
  Spain → 8-segment circle (Mozarab geometry)
  Turkey → 12-segment concentric ring (Ottoman tile)
  Default → concentric bold rings

OCCUPATION metaphors:
  Farmer → wheel of 8 radiating spokes (harvest wheel, spokes end before center)
  Carpenter/Builder → interlocking L-shapes forming a square (joinery)
  Merchant → two balanced semicircles facing each other (scales of exchange)
  Scholar → nested squares at 45° offset (pages, layers of knowledge)
  Sailor → octagon with 4 long diagonal lines (navigation, bearing)
  Engineer → octagon with equal flat-cut edges (precision gear form)
  Musician → 3 concentric arcs on one side (sound waves emanating)
  Physician → two concentric circles with bold outer ring, open top arc
  Craftsman → diamond rotated inside a ring (stone setting)
  Blacksmith → bold pentagon with centered dot (anvil geometry)
  Default → concentric rings with bold dividing lines

VALUES metaphors:
  Resilience → bold concentric rings growing outward (each ring = a challenge overcome)
  Freedom → open spiral from center (growing, expanding, unbound)
  Harmony → two equal interlocking arcs forming a lens shape
  Loyalty → two interlocked rings of equal size
  Wisdom → hexagon with inner hexagon rotated 30° (nested insight)
  Courage → bold diamond pointing upward inside ring (direction, strength)
  Creativity → irregular but balanced arcs offset from center (organic rhythm)
  Justice → two equal arcs balanced on a horizontal axis
  Prosperity → expanding octagon rings (growing outward in steps)
  Community → three equal overlapping circles (connection, overlap)
  Honor → octagon inside circle with bold ring (protection + precision)
  Truth → three concentric perfect circles (unwavering consistency)
  Default → spiral with clear bold strokes

ALLOWED SVG ELEMENTS ONLY — use nothing else:
- <circle> — for rings, dots, arcs
- <rect> — for squares and rectangles (use transform="rotate(N 150 150)" to rotate)
- <line> — for individual straight lines (must NOT pass through center 150,150)
- <path> — for arcs and curves using A (arc) and C (curve) commands only

BANNED ELEMENTS — do NOT use these under any circumstances:
- NO <polygon> — this always produces stars or star-like shapes. NEVER USE IT.
- NO <polyline>
- NO <ellipse>

STRICTLY FORBIDDEN content:
- NO crosshair: no circle + lines crossing through center (150,150) = gun sight. LINES MUST NEVER PASS THROUGH (150,150).
- NO target/bullseye: no concentric rings with ANY line through center — looks like a weapon sight
- NO triangle or pyramid shapes of any kind — triangles always read as masonic/Illuminati symbols. NEVER USE <path> commands that form a triangle. NEVER draw 3-sided shapes.
- NO star shapes of any kind (no pointy alternating shapes)
- NO eye shapes: no oval/almond/lens shape with a dot = "Eye of Providence" / Illuminati symbol — STRICTLY BANNED
- NO iris, pupil, or any shape that resembles an eye
- NO religious symbols: crosses, crescents, Stars of David, OM, ankh
- NO national symbols or flags
- NO text, letters, numbers
- NO animals, faces, human figures, hands
- NO offensive, conspiratorial, or militaristic imagery
- NO masonic symbols (pyramids, triangles, compasses, all-seeing eye)
- NO thin strokes under 9px
- All 4 designs MUST be visually distinct from each other — no two designs may use the same base shape combination`;

// ── Fallback SVG (clean geometric, no stars) ─────────────────────────────────

function fallbackSvg(i: number): string {
  const defs = [
    {
      border: `<circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>`,
      inner:  `<polygon points="150,55 237,97 237,203 150,245 63,203 63,97" fill="none" stroke="black" stroke-width="9"/><circle cx="150" cy="150" r="30" fill="black"/>`,
    },
    {
      border: `<rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>`,
      inner:  `<circle cx="150" cy="150" r="90" fill="none" stroke="black" stroke-width="9"/><line x1="150" y1="60" x2="150" y2="240" stroke="black" stroke-width="9"/><line x1="60" y1="150" x2="240" y2="150" stroke="black" stroke-width="9"/><line x1="86" y1="86" x2="214" y2="214" stroke="black" stroke-width="9"/><line x1="214" y1="86" x2="86" y2="214" stroke="black" stroke-width="9"/>`,
    },
    {
      border: `<circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>`,
      inner:  `<circle cx="150" cy="150" r="90" fill="none" stroke="black" stroke-width="9"/><circle cx="150" cy="150" r="50" fill="none" stroke="black" stroke-width="9"/><polygon points="150,65 224,107 224,193 150,235 76,193 76,107" fill="none" stroke="black" stroke-width="9"/>`,
    },
    {
      border: `<rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>`,
      inner:  `<rect x="65" y="65" width="170" height="170" fill="none" stroke="black" stroke-width="9" transform="rotate(45 150 150)"/><circle cx="150" cy="150" r="45" fill="none" stroke="black" stroke-width="9"/><circle cx="150" cy="150" r="14" fill="black"/>`,
    },
  ];
  const d = defs[i % defs.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="white"/>${d.border}${d.inner}</svg>`;
}

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

    // Validate: reject banned shapes
    const validated = parsed.svgs.map((svg, i) => {
      if (/<polygon/i.test(svg) || /<polyline/i.test(svg)) {
        console.warn(`SVG ${i} contains banned polygon — using fallback`);
        return fallbackSvg(i);
      }
      // Detect triangle paths: M...L...L...Z with only 3 line segments
      const trianglePattern = /M\s*[\d.,\s]+\s*L\s*[\d.,\s]+\s*L\s*[\d.,\s]+\s*Z/i;
      if (trianglePattern.test(svg.replace(/\s+/g, ' '))) {
        console.warn(`SVG ${i} contains triangle path — using fallback`);
        return fallbackSvg(i);
      }
      // Detect crosshair: any line passing through center (x1=150 or x2=150 AND y1=150 or y2=150)
      const lines = [...svg.matchAll(/<line[^>]+>/gi)];
      for (const [lineTag] of lines) {
        const x1 = parseFloat(lineTag.match(/x1="([\d.]+)"/)?.[1] ?? '0');
        const y1 = parseFloat(lineTag.match(/y1="([\d.]+)"/)?.[1] ?? '0');
        const x2 = parseFloat(lineTag.match(/x2="([\d.]+)"/)?.[1] ?? '0');
        const y2 = parseFloat(lineTag.match(/y2="([\d.]+)"/)?.[1] ?? '0');
        const passesThroughCenter =
          (Math.abs(x1 - 150) < 5 || Math.abs(x2 - 150) < 5) &&
          (Math.abs(y1 - 150) < 5 || Math.abs(y2 - 150) < 5);
        if (passesThroughCenter) {
          console.warn(`SVG ${i} contains crosshair line — using fallback`);
          return fallbackSvg(i);
        }
      }
      return svg;
    });

    const seals = validated.map((svg, i) => ({ variant: i, svg, imageUrl: null, error: null }));
    return NextResponse.json({ seals });

  } catch (err) {
    console.error('generate-seal:', err);
    const seals = [0, 1, 2, 3].map(i => ({ variant: i, imageUrl: null, error: null, svg: fallbackSvg(i) }));
    return NextResponse.json({ seals });
  }
}
