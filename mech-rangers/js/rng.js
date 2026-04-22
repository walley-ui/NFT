/* ═══════════════════════════════════════════════════════
   rng.js — Cinematic Single-Ranger Generator
   Purpose: Seeded RNG for high-fidelity 1-of-1 assets.
   Logic: Standardized for Ethereum Mainnet 10k Collection.
   ═══════════════════════════════════════════════════════ */

/**
 * Returns a seeded pseudo-random number generator (xorshift32).
 */
function rng32(seed) {
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
 * Picks one item from an array using weighted probability.
 */
function weightedPick(opts, rng) {
  if (!opts || opts.length === 0) return { val: "standard", weight: 1, label: "Standard" };
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
 * Fisher-Yates Shuffle.
 */
function shuffle(arr, rng) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function randInt(min, max, rng) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function dnaToSeed(dna) {
  if (typeof dna !== 'string') dna = String(dna);
  return dna.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
}

/**
 * CORE ASSEMBLY: Single Ranger Generation
 * Every DNA produces exactly one unique cinematic Ranger.
 */
function generateMechData(dna, config) {
  const seed = dnaToSeed(dna);
  const roll = rng32(seed);
  
  // 1. Determine Rarity Tier
  const tier = weightedPick(config.tiers, roll);
  
  // 2. Filter available traits by Tier (Force cinematic alignment)
  const filterByTier = (opts, targetTier) => {
    const filtered = opts.filter(o => o.tier === targetTier);
    return filtered.length > 0 ? filtered : opts;
  };

  const traits = {
    suit:       weightedPick(filterByTier(config.suits, tier.name), roll),
    background: weightedPick(filterByTier(config.backgrounds, tier.name), roll),
    aura:       weightedPick(filterByTier(config.auras, tier.name), roll),
    weapon:     weightedPick(filterByTier(config.weapons, tier.name), roll),
    badge:      weightedPick(filterByTier(config.badges, tier.name), roll),
    helmet:     weightedPick(filterByTier(config.helmets, tier.name), roll)
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

export { rng32, weightedPick, shuffle, randInt, dnaToSeed, generateMechData };
