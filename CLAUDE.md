# SYGNEO — Master System Reference

> **Two-tier rule system:**
> - **IMMUTABLE** — production constraints that guarantee every seal can be engraved and stamped. Never relax.
> - **FLEXIBLE** — creative space where personalization lives. Sizes, counts, emphasis vary per family profile.

---

## Architecture

| Layer | File | Role |
|-------|------|------|
| Questionnaire | `app/lib/profiler-agent.ts` | 6 questions → family profile |
| Template library | `app/lib/seal-prompt.ts` | 12 circle + 12 square templates |
| Generation API | `app/api/generate-recraft/route.ts` | Selects 6 templates via profile hash → calls Claude |
| Rendering | `app/page.tsx` | Shows 12 seals per session (2 batches × 6) |
| Storage | `app/lib/db.ts` | Upstash Redis, prefix `sygneo:` |
| Admin | `app/admin/dashboard/` | Order management + production panel |

**Template selection:** `profileHash(origin, values)` shuffles all 12 → batch 0 gets indices 0–5, batch 1 gets indices 6–11. Zero overlap between batches. Different profile = different shuffle = different designs.

---

## ━━━ IMMUTABLE PRODUCTION RULES ━━━

> These rules exist because rubber/metal engraving is unforgiving.
> A stroke too thin collapses. Two lines too close merge into a blob.
> A shape outside the safe zone gets cut off by the die.
> **Never change these without a physical test on a real stamp.**

### SVG Canvas

```
viewBox="0 0 300 300"
<rect width="300" height="300" fill="white"/>   ← always first element
```

### Borders (exact — never modify)

```xml
Circle: <circle cx="150" cy="150" r="132" fill="none" stroke="black" stroke-width="12"/>
Square: <rect x="18" y="18" width="264" height="264" fill="none" stroke="black" stroke-width="12"/>
```

### Stroke Width

- **Minimum stroke-width="10"** on every decorative element
- The border uses stroke-width="12" (always)
- No exceptions — thinner lines vanish in rubber engraving

### Allowed SVG Elements

```
<circle>   rings and centered-only fill="black" dots
<rect>     squares, rectangles (rotate via transform="rotate(N 150 150)")
<line>     straight line segments
```

**`<path>`, `<polygon>`, `<polyline>`, `<ellipse>`, `<text>`, `<tspan>` are BANNED.**
Path curves cannot be reliably engraved at stamp scale.

### Fill Values

Only three values allowed: `fill="none"` · `fill="white"` · `fill="black"`
No grays, gradients, opacity, or named colors.

### Safe Zone (inner shapes must stay inside)

| Border | Safe zone |
|--------|-----------|
| Circle | All inner shapes within **r ≤ 105** from center (150,150) |
| Square | All inner shapes within **x: 33–267, y: 33–267** |

### Clear Zone (letter space — never intrude)

**No decorative element closer than r = 58 from center (150,150).**
The family initial lives here. Any element inside r=58 obscures the letter.

### Minimum Gap Between Elements

**22px minimum between any two parallel stroke centers** (not edges).
Closer than 22px = ink bleeds between lines on paper.

### Element Count

Maximum **6 decorative elements** inside the border per seal (not counting border or background rect).

### Geometry Integrity

- No shape may have corners or edges that extend beyond the safe zone
- Rotated rects: verify `halfDiagonal = (width/2)·√2 ≤ 105` for circle stamps
- All line endpoints must be within the safe zone

---

## ━━━ FORBIDDEN CONTENT ━━━

> Never remove a ban. These exist for legal, ethical, and brand-safety reasons.

| Forbidden | Reason |
|-----------|--------|
| Crosshair (lines crossing at center 150,150) | Gun sight |
| Bullseye (concentric rings + centered filled dot) | Weapon target |
| Triangle / pyramid | Masonic / conspiracy symbol |
| Star shapes (any) | Multiple offensive connotations |
| Eye / iris / lens shapes | Eye of Providence |
| Religious symbols (cross, crescent, Star of David, OM, ankh, etc.) | Offensive |
| National flags or emblems | Offensive / IP |
| Text, letters, numbers (inside inner design) | The initial is added separately |
| Animals, faces, figures, hands | Not geometric |
| X shapes (two diagonal lines crossing) | Cross / weapon sight |
| Off-center filled dots | Creates eye or target effect |
| Nationalist or hate symbols | Obvious |
| Scalloped / floral / organic curves | Not producible (also banned by path ban) |

---

## ━━━ FLEXIBLE PERSONALIZATION RULES ━━━

> This is where every seal becomes unique to its family.
> Claude must adapt within the ranges below — not ignore them, not exceed them.

### Template Selection

- 12 circle templates (C0–C11), 12 square templates (S0–S11)
- `profileHash(origin, values)` determines the shuffle order
- Same profile always → same 6 templates (deterministic, reproducible)
- Different profile → different shuffle → different combination

### Size Adaptation Ranges

| Element | Min | Default | Max |
|---------|-----|---------|-----|
| Ring radius | r=48 | r=78 | r=94 |
| Square inner width | w=88 | w=154 | w=224 |
| Diamond (rotated rect) half-diag | 54px | 72px | 105px |
| Tick/mark length | 12px | 18px | 28px |
| Tick count | 4 | 6–8 | 12 |
| Gap between concentric elements | 22px | 28px | 44px |

### Profile Adaptation Guide

| Profile signal | Design emphasis |
|----------------|-----------------|
| Ancient / complex origin | Larger outer r, denser elements, smaller gaps |
| New / modern / minimal origin | Smaller r, fewer elements, larger gaps |
| Strong values (Courage, Justice, Honor) | Bolder sizes, larger ticks/marks |
| Gentle values (Harmony, Wisdom, Creativity) | Refined proportions, smaller details |
| Past lineage | Tighter concentric spacing |
| Future / new lineage | Open spacing, lighter weight |
| Craftsman / Builder occupation | L-bracket or corner-mark templates |
| Scholar / Architect occupation | Precise nested squares / compass marks |

### Uniqueness Rule

All 6 designs in a batch must be visually distinct.
Before outputting: verify no two SVGs share the same element count at similar radii.
If two templates would produce near-identical results, differentiate by:
- Adjusting primary radius by ≥ 18px
- Changing element count (e.g. 6 ticks → 8 ticks)
- Switching between ring-dominant and line-dominant layout

---

## Template Inventory

### Circle Templates (C0–C11)

| ID | Name | Key elements |
|----|------|-------------|
| C0 | Single Ring | 1 ring, hero letter |
| C1 | Diamond Frame | 1 rotated rect, no ring |
| C2 | Double Ring | 2 concentric rings |
| C3 | Sunburst Spokes | 8 radial lines, no ring |
| C4 | Ring + Diamond | ring + rotated rect inside |
| C5 | Compass Marks | ring + 6 inward tick marks |
| C6 | Double Diamond | 2 nested rotated rects, no ring |
| C7 | Ring + Outer Ticks | ring + 8 outward ticks |
| C8 | Ring + Upright Square | ring + non-rotated square inside |
| C9 | Ring + L-Brackets | ring + 4 corner L-shapes inside |
| C10 | Cardinal Accents | ring + 4 perpendicular marks at N/E/S/W |
| C11 | Ring + X Marks | ring + 4 diagonal inward marks |

### Square Templates (S0–S11)

| ID | Name | Key elements |
|----|------|-------------|
| S0 | Single Square | 1 square, hero letter |
| S1 | Diamond Frame | 1 rotated rect, no square |
| S2 | Double Square | 2 nested squares |
| S3 | Sunburst Spokes | 8 radial lines, no square |
| S4 | Square + Ring | square + inner ring |
| S5 | Heritage Brackets | square + 4 corner L-brackets |
| S6 | Triple Squares | 3 nested squares |
| S7 | Square + Ticks | square + 8 tick marks |
| S8 | Square + Diamond | square + rotated rect inside |
| S9 | Cross Marks | square + 4 midpoint marks |
| S10 | Open Cross | square + 4 cross arms with center gap |
| S11 | Diagonal Corners | square + 4 diagonal inward marks |

---

## Code Validation (route.ts) — Auto-fallback Triggers

| Check | What triggers fallback |
|-------|----------------------|
| Banned element | `<tspan>`, `<polygon>`, `<polyline>`, `<path>` |
| Wrong border | Circle batch without `<circle cx="150" cy="150" r="132"` |
| Wrong border | Square batch without `<rect x="18" y="18" width="264" height="264"` |
| Thin stroke | Any `stroke-width` < 6 |
| Out of bounds | Shape coordinates outside safe zone |

---

## Questionnaire (6 steps)

| Step | ID | Type | Notes |
|------|----|------|-------|
| 1 | `lineageStart` | select | Past / Present motivation |
| 2 | `origin` | dropdown | Up to 3 countries + free text |
| 3 | `occupation` | multiselect | Up to 3 + free text |
| 4 | `values` | multiselect | **Min 1**, max 3 |
| 5 | `language` | select | Script for the initial |
| 6 | `initial` | alphabet | Letter grid from selected script |

---

## Legal & Compliance (PERMANENT — never remove)

### GDPR & Privacy
- Lawful basis: contractual necessity (order fulfilment)
- Data minimisation: name, address, family profile, optional notes only
- No third-party sharing except courier
- No analytics, no advertising cookies
- Retention: 3 years maximum, then permanent deletion
- Data subject rights: access, rectification, erasure, portability — contact hello@sygneo.com
- Service not directed to under-16s

### Consent
- Confirmation modal requires explicit checkbox before `handleConfirm` can proceed
- Checkbox text covers: Terms, Privacy Policy, no-ink shipping, variable delivery

### Shipping Disclaimer (always visible)
- Stamp ships **without ink** — postal/export regulations
- No guaranteed delivery date
- Incorrect address = re-shipping cost on customer

### Security Headers (next.config.ts — never remove)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` — HTTPS enforced 2 years
- `Content-Security-Policy`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, mic, geolocation disabled

### Accessibility (WCAG 2.1 AA)
- `lang="en"` on `<html>`
- All interactive elements have accessible labels
- Form fields have associated `<label>` elements
- Keyboard navigation: all buttons/links natively focusable

---

## Cost Reference

| Event | Cost |
|-------|------|
| 1 batch (6 seals) | ~$0.08–0.12 |
| Full session (2 batches) | ~$0.20 max |
| Upstash Redis save | Free (free tier) |
