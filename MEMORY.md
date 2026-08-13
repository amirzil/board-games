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

## 2026-08-13 — Harmonies added as a third game, Phase 1 (engine + plain UI)

**Decided:** Build Harmonies following the exact pattern Spirit Island
established: `shared/src/harmonies/{h-types,h-data,h-engine,index}.ts`
(pure-function reducer, `applyHAction` — not `applyAction`, which collides
with Splendor's export from the shared barrel), `gameType: 'harmonies'` +
`hGameState` on `Room`, parallel `h_start_game`/`h_action` socket events,
`hGameStore.ts` client store, and `client/src/components/Harmonies/` with
`HLobbyScreen`/`HBoard`/`HGameOver`. Scoped as Phase 1 of 3 (engine
correctness with plain CSS; 3D-look board/chips and animal-card art are
later phases) per the user's explicit choice on how to pace this build.

**Why:** Harmonies didn't exist in the codebase at all — this needed a full
rules engine from scratch, not a visual pass on existing code. Matching
the established third-party-game-addition pattern (rather than inventing a
new one) keeps the codebase consistent and was verified against the actual
Spirit Island source before starting.

**Rules fidelity — what's confirmed vs. assumed** (cross-checked against
multiple public rules summaries, not the official rulebook PDF directly,
since it wasn't accessible):
- Confirmed with high confidence: central-board drafting (5 spaces × 3
  tokens), 6 token colors and their stacking rules (blue/yellow
  single-layer, grey-on-grey mountains height ≤3, green-on-brown trees
  height ≤3, red-on-{grey,brown,red} buildings height ≤2), scoring
  formulas for trees/mountains (1/3/7 by height), fields (flat 5/group,
  ≥2 contiguous), buildings (flat 5, needs ≥3 distinct adjacent colors),
  end-game triggers (pouch exhausted at refill, or ≤2 empty personal-board
  spaces) with round-completion wraparound.
- **Original/invented, not from the real game:** the personal board's
  hex-grid outline (a radius-2 hexagon, 19 cells — the real board's exact
  shape wasn't findable), the token pool's exact per-color counts, and the
  entire Animal Card roster (14 starter cards — names, habitat patterns,
  and point tracks are all made up; the real game's ~40+ cards and their
  specific patterns/art aren't available to reproduce).
- **Flagged as genuinely ambiguous** in `h-types.ts` next to
  `AnimalCardDef.track`: whether an animal card's score decays with each
  cube placed (implemented) or stays flat until full completion then
  drops to 0 (the alternative reading of "score the topmost uncovered
  slot" — this is the interpretation that would explain why over-matching
  a card is sometimes described as a trap). Worth verifying against a real
  rulebook copy if it matters.
- River scoring's exact low-end per-token rate (first 6 tokens) was also
  not confirmed; implemented as 1pt/token up to 6, 4pt/token beyond.

**Bug caught during verification, fixed same pass:** `endTurn` originally
only checked `pendingTokens.length === 0`, which is true both before
drafting AND after placing all 3 tokens — letting a player pass an entire
turn with zero actions. Added a `hasDraftedThisTurn` flag, reset per turn.
Caught by actually playing the game in-browser, not by code review.

**How to apply:** Card content and board shape are cheap to revise later —
they're plain data in `h-data.ts`, the engine doesn't hardcode assumptions
about either. If Phase 2/3 visual work reveals the 19-cell board reads too
small/large in practice, resize `PERSONAL_BOARD_CELLS`' radius there, not
in the engine.

Branch: `harmonies-engine`.
