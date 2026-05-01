/**
 * Builds Recraft V3 SVG prompts from a family profile.
 * Rules: no national flags, no religious symbols, no text, single color,
 * thick strokes, suitable for 30mm rubber/metal stamp production.
 */

// ── Region → abstract artistic tradition (NO national symbols) ───────────────

const REGION_STYLE: Record<string, string> = {
  // Middle East / North Africa
  israel: 'geometric arabesque interlace pattern',
  morocco: 'Islamic geometric star pattern',
  tunisia: 'zellige geometric mosaic',
  egypt: 'ancient geometric border pattern',
  iraq: 'ancient mesopotamian geometric motif',
  iran: 'persian geometric tile pattern',
  turkey: 'anatolian geometric weave',
  jordan: 'ancient desert geometric carving',
  lebanon: 'levantine geometric inlay',
  yemen: 'ancient arabian geometric pattern',
  saudi: 'geometric lattice pattern',

  // Europe — West
  france: 'gothic stone carving geometric',
  spain: 'mudéjar geometric star pattern',
  portugal: 'azulejo geometric tile pattern',
  italy: 'renaissance geometric medallion',
  germany: 'medieval guild geometric emblem',
  austria: 'baroque geometric cartouche',
  switzerland: 'alpine geometric relief',
  netherlands: 'delft geometric pattern',
  belgium: 'flemish geometric weave',

  // Europe — North
  sweden: 'norse geometric interlace',
  norway: 'viking geometric knotwork',
  denmark: 'scandinavian geometric pattern',
  finland: 'nordic geometric rune-inspired form',

  // Europe — East
  poland: 'slavic folk geometric star',
  russia: 'russian folk geometric motif',
  ukraine: 'folk vyshyvanka geometric pattern',
  romania: 'carpathian geometric border',
  hungary: 'magyar folk geometric emblem',
  czech: 'bohemian geometric medallion',
  bulgaria: 'balkan geometric weave',
  serbia: 'balkan folk geometric pattern',
  croatia: 'dalmatian geometric pattern',
  greece: 'hellenic meander geometric pattern',

  // UK / Ireland
  'united kingdom': 'celtic interlace knotwork',
  ireland: 'celtic spiral knotwork',

  // Americas
  'united states': 'art deco geometric emblem',
  canada: 'art deco geometric medallion',
  mexico: 'pre-columbian geometric motif',
  brazil: 'baroque geometric medallion',
  argentina: 'geometric architectural motif',

  // Asia
  japan: 'japanese mon circular geometric',
  china: 'cloud and wave geometric pattern',
  india: 'jali geometric lattice pattern',
  'south korea': 'korean geometric dancheong pattern',

  // Africa
  'south africa': 'zulu geometric beadwork pattern',
  ethiopia: 'aksumite geometric cross pattern',
  ghana: 'adinkra geometric symbol',
  nigeria: 'yoruba geometric pattern',

  // Default
  default: 'classical heraldic geometric pattern',
};

function getRegionStyle(origins: string[]): string {
  for (const origin of origins) {
    const key = origin.toLowerCase().trim();
    for (const [country, style] of Object.entries(REGION_STYLE)) {
      if (key.includes(country)) return style;
    }
  }
  return REGION_STYLE.default;
}

// ── Occupation → visual motif ─────────────────────────────────────────────────

const OCCUPATION_MOTIF: Record<string, string> = {
  'farmer':      'stylized wheat bundle in circular arrangement',
  'shepherd':    'abstract crook staff with spiral',
  'fisherman':   'geometric fish silhouette with wave',
  'sailor':      'abstract compass rose with clean lines',
  'merchant':    'geometric balanced scale',
  'banker':      'geometric cube with key',
  'craftsman':   'interlocking geometric tools',
  'blacksmith':  'abstract anvil with hammer silhouette',
  'carpenter':   'geometric joined timber angles',
  'weaver':      'interlaced geometric lattice',
  'potter':      'circular wheel with spiral',
  'jeweler':     'geometric faceted diamond form',
  'baker':       'circular grain wheel',
  'miner':       'pickaxe geometric silhouette',
  'physician':   'geometric caduceus staff abstraction',
  'scholar':     'abstract open book geometric',
  'soldier':     'geometric shield with chevron',
  'judge':       'balanced geometric scale',
  'artist':      'geometric spiral brush form',
  'musician':    'abstract wave frequency pattern',
  'architect':   'geometric arch with proportional lines',
  'engineer':    'geometric cog wheel',
  'writer':      'geometric quill spiral',
  'diplomat':    'geometric olive branch abstraction',
  'hunter':      'abstract bow and arrow geometric',
  'gardener':    'botanical leaf in geometric frame',
  'inventor':    'lightbulb geometric abstraction',
  'priest':      'geometric sunburst without cross',
  'default':     'geometric interlocking rings emblem',
};

function getOccupationMotif(occupations: string[]): string {
  for (const occ of occupations) {
    const key = occ.toLowerCase();
    for (const [k, motif] of Object.entries(OCCUPATION_MOTIF)) {
      if (key.includes(k)) return motif;
    }
  }
  return OCCUPATION_MOTIF.default;
}

// ── Values → abstract geometric form ─────────────────────────────────────────

const VALUE_FORM: Record<string, string> = {
  resilience:   'mountain triangle with base',
  freedom:      'abstract bird wings spread',
  harmony:      'yin-yang inspired balanced form',
  loyalty:      'interlocked geometric rings',
  wisdom:       'geometric owl silhouette',
  courage:      'abstract lion head silhouette',
  creativity:   'expanding spiral form',
  justice:      'balanced geometric scale',
  prosperity:   'ascending geometric steps',
  community:    'three interlocking circles',
  honor:        'geometric shield form',
  truth:        'geometric eye of proportion',
  default:      'geometric star form',
};

function getValueForm(values: string[]): string {
  for (const val of values) {
    const key = val.toLowerCase();
    for (const [k, form] of Object.entries(VALUE_FORM)) {
      if (key.includes(k)) return form;
    }
  }
  return VALUE_FORM.default;
}

// ── Style → visual language ───────────────────────────────────────────────────

const STYLE_LANGUAGE: Record<string, string> = {
  'japanese (minimal, precise)': 'Japanese mon style, radial symmetry, extreme minimalism, single elegant motif, generous negative space',
  'modern (clean, geometric)':   'Swiss-style geometric, mathematical proportions, clean angles, modernist precision',
  'ancient (classical, ornate)': 'Celtic interlace, ancient craftwork aesthetic, interwoven complexity, timeless depth',
  'abstract (symbolic, open)':   'abstract geometric, non-representational pure form, balanced asymmetry',
};

function getStyleLanguage(style: string): string {
  const key = style.toLowerCase();
  for (const [k, lang] of Object.entries(STYLE_LANGUAGE)) {
    if (key.includes(k.split(' ')[0])) return lang;
  }
  return STYLE_LANGUAGE['modern (clean, geometric)'];
}

// ── Safety constraint block (always appended) ─────────────────────────────────

const SAFETY_BLOCK = [
  'NO national flags',
  'NO country emblems or symbols',
  'NO religious symbols',
  'NO crosses',
  'NO crescents',
  'NO stars of David',
  'NO pentagrams',
  'NO swastikas',
  'NO offensive imagery',
  'NO text',
  'NO letters',
  'NO numbers',
  'NO words',
  'NO background fills',
  'NO gradients',
  'NO shading',
].join(', ');

const PRODUCTION_BLOCK =
  'thick bold strokes minimum 2mm width, clean crisp edges, ' +
  'pure black on white, single solid color only, ' +
  'suitable for 30mm rubber stamp and metal seal production, ' +
  'professional production-ready vector quality, no noise, no artifacts';

// ── Main: build 4 variant prompts ─────────────────────────────────────────────

export function buildSealPrompts(profile: {
  origin:     string[];
  occupation: string[];
  values:     string[];
  style:      string;
}): string[] {
  const regionStyle    = getRegionStyle(profile.origin);
  const occupMotif     = getOccupationMotif(profile.occupation);
  const valueForm      = getValueForm(profile.values);
  const styleLang      = getStyleLanguage(profile.style);

  const base = `heritage family seal emblem, single bold monochromatic symbol, circular composition, ${PRODUCTION_BLOCK}, ${SAFETY_BLOCK}`;

  return [
    // Variant 1 — occupation dominant, chosen style
    `${base}, central motif: ${occupMotif}, ${styleLang}`,

    // Variant 2 — values dominant, geometric modern
    `${base}, central motif: ${valueForm}, Swiss-style geometric, mathematical proportions`,

    // Variant 3 — regional artistic tradition, ancient feel
    `${base}, pattern inspired by ${regionStyle}, ancient craftwork aesthetic, intricate yet bold`,

    // Variant 4 — combined occupation + values, balanced composition
    `${base}, combined motif of ${occupMotif} and ${valueForm}, balanced symmetrical composition, ${styleLang}`,
  ];
}
