/* ═══════════════════════════════════════════════════════
   generator.js — NFT Generation Engine
   Depends on: traits.js, rng.js
   ═══════════════════════════════════════════════════════ */

/* ── HARD-CAP RARITY SYSTEM ── */
const SUPPLY_CAPS = {
  legendary: 100,
  epic:      900,
  rare:      2000,
  uncommon:  3000,
  common:    4000,
};

/* Live minted-per-tier counters (mutated as NFTs are generated) */
const mintedCount = {
  legendary: 0,
  epic:      0,
  rare:      0,
  uncommon:  0,
  common:    0,
};

/* ── GLOBAL STATE ── */
let allNFTs      = [];   // all generated NFT objects
let tokenCounter = 0;    // next token ID
let hashSet      = new Set();  // uniqueness check: trait combo hashes
let isGenerating = false;      // batch-gen lock flag

/* ── RARITY SCORING ── */
/**
 * Derives rarity tier from a trait combination.
 * Scores each trait layer then maps total to a tier string.
 * @param {Object} traits - selected trait values
 * @returns {string}  "legendary" | "epic" | "rare" | "uncommon" | "common"
 */
function calcRarity(traits) {
  const bgScore = {
    void:1, urban:1, plasma:2, volcanic:2,
    cyber:3, arctic:3, dimension:4, golden:5
  };
  const helmScore = {
    standard:1, horned:2, visor:2, crown:3,
    dragon:3, angular:3, ancient:4, legendary:5, oni:5
  };
  const wpnScore = {
    sword:1, blaster:1, lance:2, shield:2,
    gauntlets:2, twin:3, cannon:3, staff:4, none:1
  };
  const auraScore = {
    none:0, electric:2, fire:2, shadow:3,
    holy:4, plasma:4, cosmic:5
  };
  const suitBonus = {
    ranger_cosmic:5, ranger_void:5, ranger_gold:4,
    ranger_silver:3, ranger_white:3
  };

  const score =
    (bgScore[traits.background.val]  || 1) +
    (helmScore[traits.helmet.val]    || 1) +
    (wpnScore[traits.weapon.val]     || 1) +
    (auraScore[traits.aura.val]      || 0) +
    (suitBonus[traits.suit.val]      || 1);

  if (score >= 18) return "legendary";
  if (score >= 13) return "epic";
  if (score >= 9)  return "rare";
  if (score >= 5)  return "uncommon";
  return "common";
}

/* ── CORE GENERATOR ── */
/**
 * Generates one NFT with a seeded random trait combo.
 * Enforces hard-cap rarity and combo uniqueness.
 * Recursively rerolls (up to 300 attempts) if a cap is hit or duplicate found.
 * @param {number} [attempt=0]
 * @returns {Object|null}  NFT data object, or null if all caps exhausted
 */
function generateNFT(attempt = 0) {
  if (attempt > 300) return null; // safety — all tiers likely capped

  tokenCounter++;

  // Fresh seed every call; XOR with counter for spread
  const seed = ((Math.random() * 2147483647) | 0) ^ (tokenCounter * 31337);
  const rng  = rng32(seed);

  // Roll all 6 trait layers
  const traits = {
    background: weightedPick(TRAITS.background.options, rng),
    suit:       weightedPick(TRAITS.suit.options,       rng),
    helmet:     weightedPick(TRAITS.helmet.options,     rng),
    weapon:     weightedPick(TRAITS.weapon.options,     rng),
    aura:       weightedPick(TRAITS.aura.options,       rng),
    badge:      weightedPick(TRAITS.badge.options,      rng),
  };

  // Derive rarity from trait combination
  const rarity = calcRarity(traits);

  /* ── HARD-CAP ENFORCEMENT ──
     If this rarity tier is already full → reroll.
     No legendary can ever exceed 100, etc. */
  if (mintedCount[rarity] >= SUPPLY_CAPS[rarity]) {
    tokenCounter--;
    return generateNFT(attempt + 1);
  }

  // Uniqueness check: same trait combo = same visual → reroll
  const hash = Object.values(traits).map(t => t.val).join('-');
  if (hashSet.has(hash) && hashSet.size < 9500) {
    tokenCounter--;
    return generateNFT(attempt + 1);
  }

  // Commit this NFT
  hashSet.add(hash);
  mintedCount[rarity]++;

  // Generate name from pools using secondary RNG
  const rng2 = rng32(seed + 99);
  const name =
    NAMES[Math.floor(rng2() * NAMES.length)] + ' ' +
    SUFX [Math.floor(rng2() * SUFX.length)];

  return {
    id:     tokenCounter,
    name,
    seed,
    rarity,
    traits,
    score:  Math.floor(rng2() * 24) + 76,
  };
}

/* ── RESET ── */
/**
 * Resets all generation state back to zero.
 * Call this when the user hits Clear.
 */
function resetGeneratorState() {
  allNFTs      = [];
  hashSet      = new Set();
  tokenCounter = 0;
  Object.keys(mintedCount).forEach(k => mintedCount[k] = 0);
}
