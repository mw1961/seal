// Generates a deterministic maze bracket SVG based on a numeric seed.
// No AI involved — always valid, always different per seed.

const CELL_ORIGINS_X = [55, 96, 137, 178, 219];
const CELL_ORIGINS_Y = [55, 96, 137, 178, 219];
const BRACKET = 22;
const SW = 10;

type Bracket = 'L-right' | 'L-left' | 'L-up' | 'L-down' | 'C' | 'dash';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function bracketPath(type: Bracket, cx: number, cy: number): string {
  const b = BRACKET;
  switch (type) {
    case 'L-right': return `M ${cx} ${cy} L ${cx} ${cy+b} L ${cx+b} ${cy+b}`;
    case 'L-left':  return `M ${cx+b} ${cy} L ${cx+b} ${cy+b} L ${cx} ${cy+b}`;
    case 'L-up':    return `M ${cx} ${cy+b} L ${cx} ${cy} L ${cx+b} ${cy}`;
    case 'L-down':  return `M ${cx} ${cy} L ${cx+b} ${cy} L ${cx+b} ${cy+b}`;
    case 'C':       return `M ${cx+b} ${cy} L ${cx} ${cy} L ${cx} ${cy+b} L ${cx+b} ${cy+b}`;
    case 'dash':    return `M ${cx} ${cy+11} L ${cx+20} ${cy+11}`;
  }
}

export function generateMazeSvg(seed: number): string {
  const rng = seededRandom(seed);
  const types: Bracket[] = ['L-right','L-left','L-up','L-down','C','dash'];

  // Build 5×5 grid — fill ~19 of 25 cells, skip ~6
  const cells: { x: number; y: number; type: Bracket }[] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      // Skip ~24% of cells based on seed
      if (rng() < 0.24) continue;
      const cx = CELL_ORIGINS_X[col];
      const cy = CELL_ORIGINS_Y[row];
      // Prefer varied orientations — weight by position
      const typeIdx = Math.floor(rng() * types.length);
      cells.push({ x: cx, y: cy, type: types[typeIdx] });
    }
  }

  const d = cells.map(c => bracketPath(c.type, c.x, c.y)).join('  ');
  const border = `<rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>`;
  const path   = `<path d="${d}" fill="none" stroke="black" stroke-width="${SW}" stroke-linejoin="round"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="white"/>${border}${path}</svg>`;
}
