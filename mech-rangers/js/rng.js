/* ═══════════════════════════════════════════════════════
   rng.js — Seeded RNG · Weighted Picker
   Pure utility — no DOM, no state, no side effects.
   ═══════════════════════════════════════════════════════ */

/**
 * Returns a seeded pseudo-random number generator (xorshift32).
 * Always produces the same sequence for the same seed.
 * @param {number} seed
 * @returns {() => number}  function returning [0, 1)
 */
function rng32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >> 7;
    s ^= s << 17;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Picks one item from an array of options using weighted probability.
 * Each option must have a numeric `.weight` property.
 * @param {Array}    opts  - array of option objects
 * @param {Function} rng   - RNG function returning [0, 1)
 * @returns {Object}  selected option
 */
function weightedPick(opts, rng) {
  const total = opts.reduce((acc, o) => acc + o.weight, 0);
  let r = rng() * total;
  for (const o of opts) {
    r -= o.weight;
    if (r <= 0) return o;
  }
  return opts[opts.length - 1];
}
