/**
 * Symbol Mapper — translates SealProfile into specific symbolic vocabulary
 * for the AI generation prompt. This is what makes seals meaningful, not generic.
 */

// ── Geographic symbols ────────────────────────────────────────────────────────

const ORIGIN_SYMBOLS: { keywords: string[]; symbols: string[] }[] = [
  { keywords: ['canada', 'canadian', 'ontario', 'quebec', 'british columbia'],
    symbols: ['maple leaf', 'cedar tree', 'northern mountain ridge', 'beaver tail arc'] },
  { keywords: ['eastern europe', 'poland', 'ukraine', 'russia', 'czech', 'hungarian', 'romania'],
    symbols: ['oak branch with acorns', 'wheat sheaf', 'stag antler', 'broad cross with arms'] },
  { keywords: ['western europe', 'france', 'germany', 'england', 'britain', 'ireland', 'scotland'],
    symbols: ['fleur-de-lis outline', 'oak leaf cluster', 'thistle', 'celtic knot arc', 'lion silhouette'] },
  { keywords: ['mediterranean', 'italy', 'greece', 'spain', 'portugal'],
    symbols: ['olive branch', 'laurel wreath arc', 'column capital', 'wave crest'] },
  { keywords: ['middle east', 'israel', 'jewish', 'arabic', 'persia', 'iran'],
    symbols: ['pomegranate outline', 'palm frond', 'geometric star', 'almond branch'] },
  { keywords: ['africa', 'african', 'nigeria', 'ethiopia', 'kenya'],
    symbols: ['baobab silhouette', 'sun with rays', 'shield outline', 'elephant tusk arc'] },
  { keywords: ['asia', 'china', 'japan', 'korea', 'vietnam'],
    symbols: ['bamboo stalk', 'lotus flower outline', 'mountain with three peaks', 'crane wing arc'] },
  { keywords: ['india', 'hindu', 'bengal', 'punjab'],
    symbols: ['lotus petal arc', 'peacock feather curve', 'banyan root', 'flame teardrop'] },
  { keywords: ['latin america', 'mexico', 'brazil', 'argentina', 'colombia'],
    symbols: ['condor wing spread', 'maize stalk', 'sun face outline', 'jaguar paw'] },
  { keywords: ['scandinavia', 'sweden', 'norway', 'denmark', 'finland', 'iceland'],
    symbols: ['runic compass rose', 'Viking ship prow', 'pine branch', 'wolf silhouette outline'] },
  { keywords: ['now', 'today', 'new', 'fresh', 'present', 'current'],
    symbols: ['rising sun arc', 'seedling with roots', 'upward arrow with base', 'open horizon line'] },
];

// ── Occupation symbols ────────────────────────────────────────────────────────

const OCCUPATION_SYMBOLS: { keywords: string[]; symbols: string[] }[] = [
  { keywords: ['carpenter', 'woodworker', 'joiner', 'cabinet', 'furniture', 'timber', 'lumber'],
    symbols: ['dovetail joint (two interlocking wedge shapes)', 'carpenter\'s square (L-shape)', 'compass with open arc', 'wood grain chevron'] },
  { keywords: ['farmer', 'agriculture', 'farming', 'crops', 'harvest', 'grain'],
    symbols: ['wheat sheaf bound at center', 'plow blade profile', 'sun over horizon', 'sickle arc'] },
  { keywords: ['merchant', 'trade', 'commerce', 'business', 'trader'],
    symbols: ['balance scales', 'ship sail triangle', 'key outline', 'interlocked rings'] },
  { keywords: ['blacksmith', 'smith', 'forge', 'metal', 'iron'],
    symbols: ['anvil profile', 'hammer head', 'flame', 'horseshoe arc'] },
  { keywords: ['scholar', 'teacher', 'scribe', 'writer', 'intellectual', 'academic'],
    symbols: ['quill arc', 'open book outline', 'oil lamp', 'eye inside triangle'] },
  { keywords: ['soldier', 'warrior', 'military', 'knight', 'guard'],
    symbols: ['sword point upward', 'shield boss', 'crossed lances', 'helmet crest'] },
  { keywords: ['healer', 'doctor', 'physician', 'medicine', 'apothecary'],
    symbols: ['serpent coiled on staff', 'mortar silhouette', 'leaf with vein', 'cross with circle'] },
  { keywords: ['fisherman', 'sailor', 'maritime', 'sea', 'ocean', 'ship'],
    symbols: ['anchor', 'wave crest', 'compass rose', 'fishing net hexagon'] },
  { keywords: ['miner', 'mining', 'stone', 'mason', 'quarry'],
    symbols: ['pickaxe head', 'mountain profile', 'crystal facet', 'arch keystone'] },
  { keywords: ['baker', 'bread', 'mill', 'grain', 'miller'],
    symbols: ['windmill sail', 'wheat stalk', 'circular loaf score', 'millstone'] },
];

// ── Value symbols ─────────────────────────────────────────────────────────────

const VALUE_SYMBOLS: Record<string, string> = {
  resilience:  'anchor with chain loop',
  freedom:     'open bird wings spread',
  harmony:     'two flowing curves mirroring each other',
  loyalty:     'knotted cord circle',
  wisdom:      'flame inside eye outline',
  courage:     'bold upward arrow piercing circle',
  creativity:  'spiral expanding outward',
  justice:     'balanced scales beam',
  prosperity:  'cornucopia horn curve',
  community:   'three interlocked circles',
  honor:       'laurel branch arc',
  truth:       'vertical plumb line with weight',
};

// ── Mapper function ───────────────────────────────────────────────────────────

export interface SymbolVocabulary {
  geographic:   string[];
  occupational: string[];
  values:       string[];
  summary:      string;
}

function matchKeywords(text: string, entries: { keywords: string[]; symbols: string[] }[]): string[] {
  const lower = text.toLowerCase();
  for (const entry of entries) {
    if (entry.keywords.some(k => lower.includes(k))) {
      return entry.symbols;
    }
  }
  return [];
}

export function mapProfileToSymbols(
  origin: string,
  occupation: string,
  values: string[],
): SymbolVocabulary {
  const geographic   = matchKeywords(origin,     ORIGIN_SYMBOLS);
  const occupational = matchKeywords(occupation, OCCUPATION_SYMBOLS);
  const valueSymbols = values
    .map(v => VALUE_SYMBOLS[v.toLowerCase()])
    .filter(Boolean) as string[];

  // Fallbacks if no match
  const geoFinal = geographic.length   ? geographic   : ['mountain silhouette', 'horizon line with sun'];
  const occFinal = occupational.length ? occupational : ['intertwined rings', 'bold spiral'];
  const valFinal = valueSymbols.length ? valueSymbols : ['anchor', 'knotted cord'];

  const summary =
    `Geographic: ${geoFinal.slice(0, 2).join(', ')} | ` +
    `Craft: ${occFinal.slice(0, 2).join(', ')} | ` +
    `Values: ${valFinal.slice(0, 2).join(', ')}`;

  return { geographic: geoFinal, occupational: occFinal, values: valFinal, summary };
}
