/* ════════════
   rng.js — Seeded RNG · Weighted Picker
   Upgraded: MurmurHash-style Pre-Mix for Seed Independence
   Pure utility — no DOM, no state, no side effects.
   ════════════ */

/**
 * Returns a seeded pseudo-random number generator (xorshift32).
 * Always produces the same sequence for the same seed.
 * @param {number} seed
 * @returns {() => number}  function returning [0, 1)
 */
function rng32(seed) {
  // ─── UPGRADE: SEED SCRAMBLER ───
  // Prevents "Seed Clustering" where sequential seeds produce 
  // similar initial results. Uses a high-prime mixer.
  let s = (seed >>> 0) || 0xDEADBEEF;
  s = ((s ^ (s >>> 16)) * 0x45d9f3b) >>> 0;
  s = ((s ^ (s >>> 16)) * 0x45d9f3b) >>> 0;
  s = (s ^ (s >>> 16)) >>> 0;

  return () => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
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
  // ─── UPGRADE: SAFETY CHECK ───
  // Ensures the app doesn't go "blank" if data is missing.
  if (!opts || opts.length === 0) return { name: "default", weight: 1, label: "Standard", color: "#888" };

  const total = opts.reduce((acc, o) => acc + (o.weight || 0), 0);
  if (total <= 0) return opts[0];
  
  let r = rng() * total;
  for (const o of opts) {
    r -= o.weight;
    if (r <= 0) return o;
  }
  return opts[opts.length - 1];
}

/**
 * Upgraded Utility: Fisher-Yates Shuffle
 * Useful for secondary decorative elements in the renderer.
 * @param {Array} arr 
 * @param {Function} rng 
 * @returns {Array}
 */
function shuffle(arr, rng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * ─── UPGRADE: SEEDED RANGE ───
 * Returns a random integer between min and max (inclusive).
 */
function randInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * ─── UPGRADE: DNA TO SEED ───
 * Converts string-based identifiers (Wallet, Hash) into a numeric seed.
 */
function dnaToSeed(dna) {
  if (typeof dna !== 'string') dna = String(dna);
  return dna.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
}

/**
 * ─── UPGRADE: MECH ASSEMBLY (ETH Mainnet Optimized) ───
 * Generates a complete Mech attribute set from a single DNA source.
 */
function generateMechData(dna, config) {
  const seed = dnaToSeed(dna);
  const roll = rng32(seed);
  
  // 1. Resolve Global Rarity
  const tier = weightedPick(config.tiers, roll);
  
  // 2. Filter Traits by Tier (Upgrade: Tier-Locked Generation)
  // Ensures Mythic mechs get Mythic-tier parts.
  const filterByTier = (opts, targetTier) => {
    const filtered = opts.filter(o => o.tier === targetTier);
    return filtered.length > 0 ? filtered : opts; // Fallback to all if specific tier has no parts
  };

  const traits = {
    suit: weightedPick(filterByTier(config.suits, tier.name), roll),
    background: weightedPick(filterByTier(config.backgrounds, tier.name), roll),
    aura: weightedPick(filterByTier(config.auras, tier.name), roll),
    weapon: weightedPick(filterByTier(config.weapons, tier.name), roll),
    badge: weightedPick(filterByTier(config.badges, tier.name), roll),
    helmet: weightedPick(filterByTier(config.helmets, tier.name), roll)
  };

  return {
    id: Math.abs(seed % 10000), 
    seed: seed,
    dna: dna,
    tier: tier.name,
    multiplier: tier.multiplier,
    traits: traits, 
    stats: {
      atk: Math.floor(randInt(config.minAtk, config.maxAtk, roll) * tier.multiplier),
      def: Math.floor(randInt(config.minDef, config.maxDef, roll) * tier.multiplier),
      spd: randInt(1, 100, roll)
    },
    colors: shuffle(config.themeColors, roll).slice(0, 3)
  };
}

/* ── NODE/BROWSER ALIGNMENT EXPORT ── */
if (typeof module !== 'undefined') {
    module.exports = { rng32, weightedPick, shuffle, randInt, dnaToSeed, generateMechData };
}
