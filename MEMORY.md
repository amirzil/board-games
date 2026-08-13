# Project Memory

## 2026-08-12 — Splendor visual/audio overhaul: SVG + synthesized sound over licensed assets

**Decided:** Rebuild Splendor's gem tokens, development cards, and noble
cards as original inline SVG (faceted gem-cut geometry, paper-grain card
texture, vector medallion) rather than sourcing artwork, and add sound via
a small synthesized Web Audio engine rather than licensed/recorded SFX
files. Sound triggers off a diff of the server-authoritative `GameState`
(not just local click handlers) so both players hear the table react to
each other's moves. Mute toggle in the turn bar, persisted to
`localStorage`.

**Why:** Splendor is a commercial licensed board game — reusing real
Splendor artwork or photographed chip/card assets would be an IP risk.
Staying in SVG/CSS + synthesized audio requires no asset sourcing or
licensing pipeline and keeps the client a single static bundle (no
`public/` assets folder needed).

**Rejected:**
- *CSS-only enhancement (gradients/shadows, no SVG rewrite)* — faster, but
  flat gradients can't produce real facet/light-plane variation, which is
  the actual "lifelike gem" payoff.
- *Full production (licensed art + recorded SFX + drag physics)* — highest
  fidelity ceiling, but introduces external asset licensing as a
  dependency and was deferred until we see whether the SVG+synth approach
  isn't enough. Kept as the fallback option if the current pass reads as
  insufficient.

**How to apply:** If further visual work is requested on Splendor, extend
the existing `GemFace` component (shared facet artwork used by both the
gem bank tokens and the card mini-icons) rather than introducing a second
gem-rendering approach. If sound needs richer texture than oscillator/
noise synthesis can provide, that's the trigger to revisit the "Full
Production" option this decision deferred.

Branch: `splendor-tactile-refresh`, PR #1.

## 2026-08-13 — Card layout matched to the real game; art stays original

**Decided:** Rebuild `DevelopmentCard` and add a real `CardBack` so cards
match the real Splendor card *structure* — full-bleed illustration with
points/gem-icon overlaid and cost chips stacked bottom-left (front), and a
tier-colored back with an emblem + dot count for deck piles (previously
just a bordered count box) — using original vintage-engraving-style
vignettes (`CardArt`): duotone silhouette scenes keyed to tier (bust
portraits / trade scenes / grand architecture) and tinted per gem color,
variant chosen deterministically from the card's id.

**Why:** The user compared the app directly against a photo of the real
physical cards and it read as schematic. The layout/composition (picture
area + corner stats + stacked cost chips; tier-coded back with dots) is a
generic trading-card convention, not protectable expression, so it can be
matched exactly. The specific photographed portraits/scenes on the real
cards can't be — original art was required there.

**Rejected** (see the 3-option menu offered to the user):
- *Trade-good motif icons* (flat woodcut-style resource icons instead of
  people/scenes) — sidesteps portraiture entirely but reads less like the
  reference photo's "old print" feel.
- *Abstract atmosphere only* (gradient/grain wash, no figures) — fastest,
  zero resemblance risk, but too far from "looks like the real cards."
- User picked vintage engraving vignettes as the closest match to the
  reference while staying original.

**How to apply:** New tier/category or color added to the game → extend
`CardArt`'s `PALETTE`/`SCENES` tables rather than starting a new art
system. If two variants per category starts feeling repetitive across a
full 40-card tier, that's the point to add a third variant rather than
switch approaches.

Branch: `splendor-card-art`.
