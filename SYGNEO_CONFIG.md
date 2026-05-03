# SYGNEO — Configuration Snapshot
**Backup Point:** 2026-05-03  
**Git Commit:** `38b2bc5` — Hero letter 90px, SVG mask knockout  
**Repo:** https://github.com/mw1961/sygneo  
**Live:** Vercel (auto-deploy from `main`)

---

## 1. Architecture Overview

| Layer | File | Role |
|-------|------|------|
| Questionnaire UI | `app/page.tsx` | 6-step flow → confirming → generating → results |
| Design Prompts | `app/lib/seal-prompt.ts` | System prompt + user message builder |
| API Route | `app/api/generate-recraft/route.ts` | 2 parallel Claude calls + SVG injection |
| Profiler | `app/lib/profiler-agent.ts` | Questions, alphabet tables, buildProfile |
| DB | `app/lib/db.ts` | Upstash Redis, order storage |
| Admin | `app/admin/dashboard/` | Production panel, SVG export |

---

## 2. Generation Parameters

```
Model:              claude-sonnet-4-6
Max tokens/call:    5000
Max duration:       60s (Vercel limit)
Calls per batch:    2 parallel (circle batch + square batch)
SVGs per call:      6
Total per batch:    12 (6 circle + 6 square)
Max batches:        2  →  24 designs total
```

---

## 3. Initial Letter — Injection Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| `font-size` | `90px` | Hero scale — fills central void |
| `dy` (Latin/Hebrew/Cyrillic/Greek/Armenian/Georgian) | `.35em` | cap_height/2 ≈ 31.5px → optical center at y=150 |
| `dy` (Japanese/Chinese/Korean) | `.38em` | CJK fills full em square |
| Mask stroke-width | `18px` | 9px safety buffer on all sides |
| Technique | SVG `<mask>` | Background shapes cut out at letter shape |

### Font families by language
| Language | Font stack |
|----------|-----------|
| Hebrew | `'Frank Ruhl Libre', 'David', serif` |
| Arabic | `'Noto Naskh Arabic', 'Scheherazade New', serif` |
| Greek | `'GFS Didot', 'Palatino', serif` |
| Armenian | `'Noto Serif Armenian', serif` |
| Georgian | `'Noto Serif Georgian', serif` |
| Japanese / Chinese / Korean | `'Noto Serif CJK JP', serif` |
| Cyrillic | `'Palatino Linotype', 'PT Serif', serif` |
| Latin (default) | `'Palatino Linotype', 'Palatino', 'Georgia', serif` |

### SVG Mask Knockout — code pattern
```svg
<defs>
  <mask id="lm">
    <rect width="300" height="300" fill="white"/>
    <!-- black = hide background here -->
    <text x="150" y="150" dy=".35em" font-family="..." font-size="90"
      text-anchor="middle" fill="black" stroke="black"
      stroke-width="18" stroke-linejoin="round">A</text>
  </mask>
</defs>
<rect width="300" height="300" fill="white"/>
<g mask="url(#lm)">
  <!-- all background shapes — cut at letter area -->
</g>
<!-- visible letter on top -->
<text x="150" y="150" dy=".35em" font-family="..." font-size="90"
  text-anchor="middle" fill="black">A</text>
```

---

## 4. SVG Production Constraints

| Rule | Value |
|------|-------|
| viewBox | `0 0 300 300` |
| Outer border (circle) | `<circle cx="150" cy="150" r="132" stroke-width="12"/>` |
| Outer border (square) | `<rect x="18" y="18" width="264" height="264" stroke-width="12"/>` |
| Min decorative stroke-width | `10px` |
| Min gap between parallel strokes | `20px` |
| Safe zone (circle) | All inner shapes within `r=105` from center |
| Safe zone (square) | All inner shapes within `x:33–267, y:33–267` |
| Clear zone (letter area) | No decorative element within `r=62` from center `(150,150)` |
| Colors allowed | `fill="black"`, `fill="white"`, `fill="none"` only |

---

## 5. Design Templates

### Circle (6 designs)
| # | Name | Structure |
|---|------|-----------|
| 1 | The Minimalist Ring | Single ring `r=80, sw=11` |
| 2 | The Double Heritage Ring | Rings `r=92` + `r=66`, gap=26px |
| 3 | The Sunburst | 8 radial `<line>` spokes, `r=62→96` |
| 4 | The Modern Shield | Ring `r=84` + rotated rect `76×76` at 45° |
| 5 | The Heritage Band | Ring `r=84` + 8 short arc segments outside `r=65` |
| 6 | The Weighted Frame | Thick ring `r=96, sw=13` + small ring `r=64` |

### Square (6 designs)
| # | Name | Structure |
|---|------|-----------|
| 1 | The Weighted Square | Single inner rect `x=40, w=220, sw=11` |
| 2 | The Modern Diamond | Rotated rect `100×100` at 45° |
| 3 | The Double Heritage Square | Rects `x=40, w=220` + `x=92, w=116`, gap=42px |
| 4 | The Sunburst | 8 radial `<line>` spokes (same as circle #3) |
| 5 | The Modern Shield | Rect `x=40, w=220` + circle `r=76` |
| 6 | The Heritage Frame | Rect `x=40, w=220` + 4 corner L-bracket paths |

---

## 6. Questionnaire Flow (6 Steps)

| Step | ID | Type | Description |
|------|----|------|-------------|
| 1 | `lineageStart` | select | From the past / From now |
| 2 | `origin` | dropdown | Up to 3 countries (list of ~90) |
| 3 | `occupation` | multiselect | Up to 3 professions (28 options) |
| 4 | `values` | multiselect | 2–3 values (13 options) |
| 5 | `language` | select | 10 script families |
| 6 | `initial` | alphabet | Letter grid from selected script |

→ **Confirming phase:** shows large initial + profile summary  
→ **Generating phase:** 2 parallel API calls (~35–45s)  
→ **Results phase:** 12 designs, toggle ○/□, color picker, master preview modal

---

## 7. Supported Scripts & Alphabets

| Language | Letters |
|----------|---------|
| Latin | A–Z (26) |
| Hebrew | א–ת (22) |
| Arabic | ا–ي (28, isolated forms) |
| Cyrillic | А–Я (27 Russian) |
| Greek | Α–Ω (24) |
| Armenian | Ա–Ք (36) |
| Japanese | あ–ん (46 hiragana) |
| Chinese | 40 most common family name characters |
| Korean | 30 most common family name syllables |
| Georgian | ა–ჰ (33) |

---

## 8. Ink Colors

| Label | Hex |
|-------|-----|
| Black | `#000000` |
| Royal Blue | `#002366` |
| Deep Red | `#8B0000` |
| Forest Green | `#013220` |

---

## 9. Banned Content (always enforced)

- Religious symbols: cross, crescent, Star of David, OM, ankh, menorah
- Military/weapon: crosshair, gun sight, sword, bullet, target
- Nationalist/political: flags, state emblems, party symbols
- Racist or hate symbols
- Gender-specific symbols
- Animals, faces, human figures
- Stars (pointy alternating), triangles, eyes
- Scalloped/floral/petal borders (ink traps)
- Three or more concentric frames of same type
- Dense lattices or cross-hatching
- SVG elements: `<polygon>`, `<polyline>`, `<ellipse>`, `<text>`, `<tspan>`

---

## 10. Authentication

| Role | Path | Credential |
|------|------|-----------|
| Admin | `/admin/login` | password: `mw10` |
| Client | `/login/client` | username: `123` / password: `mw11` |

---

## 11. Infrastructure

| Service | Usage | Plan |
|---------|-------|------|
| Vercel | Hosting + serverless | Pro (auto-deploy from main) |
| Anthropic API | Claude Sonnet 4.6 | Pay-per-use |
| Upstash Redis | Order storage | Free tier (10K ops/day) |

**Estimated cost per customer:** ~$0.12–0.18 (2 batches × 2 calls × ~$0.04/call)
