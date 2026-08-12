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
