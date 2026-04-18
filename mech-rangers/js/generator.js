/* ═══════════════════════════════════════════════════════
   generator.js — NFT Generation Engine (ADMIN SECURED)
   
   Depends on: traits.js, rng.js, admin.js
   ═══════════════════════════════════════════════════════ */

/* ── NODE COMPATIBILITY LAYER ── */
if (typeof document === 'undefined') {
    global.document = {
        getElementById: (id) => ({
            value: {
                'cMaxMythic': 20, 'cMaxLegendary': 100, 'cMaxEpic': 900, 
                'cMaxRare': 2000, 'cMaxUncommon': 3000, 'cMaxCommon': 3980,
                'tLegendary': 18, 'tEpic': 13, 'tRare': 9, 'tUncommon': 5
            }[id] || 0
        })
    };
}

/* ── ADMIN AUTH GATE ── */
const AdminAuth = {
    isAuthorized: false, // Default locked
    verify() {
        this.isAuthorized = true;
        console.log("Master Forge Authorization Granted.");
    }
};

/* ── DYNAMIC RARITY SYSTEM (UPGRADED) ── */
const SUPPLY_CAPS = {
  get mythic()    { return parseInt(document.getElementById('cMaxMythic')?.value || document.getElementById('capMythic')?.value) || 20; },
  get legendary() { return parseInt(document.getElementById('cMaxLegendary')?.value || document.getElementById('capLegendary')?.value) || 100; },
  get epic()      { return parseInt(document.getElementById('cMaxEpic')?.value || document.getElementById('capEpic')?.value) || 900; },
  get rare()      { return parseInt(document.getElementById('cMaxRare')?.value || document.getElementById('capRare')?.value) || 2000; },
  get uncommon()  { return parseInt(document.getElementById('cMaxUncommon')?.value || document.getElementById('capUncommon')?.value) || 3000; },
  get common()    { return parseInt(document.getElementById('cMaxCommon')?.value || document.getElementById('capCommon')?.value) || 3980; }
};

const mintedCount = {
  mythic:    0,
  legendary: 0,
  epic:      0,
  rare:      0,
  uncommon:  0,
  common:    0,
};

/* ── GLOBAL STATE ── */
let allNFTs      = [];
let tokenCounter = 0;
let hashSet      = new Set();
let isGenerating = false;

/* ── RARITY SCORING (DYNAMIC ENGINE) ── */
function calcRarity(traits) {
  // ALIGNED WITH TRAITS.JS DATA
  const bgScore = { void:1, urban:1, plasma:2, volcanic:2, cyber:3, arctic:3, dimension:4, golden:5, cosmic:6 };
  const helmScore = { standard:1, horned:2, visor:2, crown:3, dragon:3, angular:3, ancient:4, legendary:5, oni:6 };
  const wpnScore = { sword:1, blaster:1, lance:2, shield:2, gauntlets:2, twin:3, cannon:3, staff:4, none:1 };
  const auraScore = { none:0, electric:2, fire:2, shadow:3, holy:4, plasma:4, cosmic:5 };
  const suitBonus = { 
    ranger_red:1, ranger_blue:1, ranger_black:2, ranger_green:2, 
    ranger_yellow:2, ranger_pink:2, ranger_white:3, ranger_silver:3, 
    ranger_gold:5, ranger_void:5, ranger_cosmic:6 
  };

  const score =
    (bgScore[traits.background.val]  || 1) +
    (helmScore[traits.helmet.val]    || 1) +
    (wpnScore[traits.weapon.val]     || 1) +
    (auraScore[traits.aura.val]      || 0) +
    (suitBonus[traits.suit.val]      || 1);

  const thresh = {
    legendary: parseInt(document.getElementById('tLegendary')?.value) || 18,
    epic:      parseInt(document.getElementById('tEpic')?.value)      || 13,
    rare:      parseInt(document.getElementById('tRare')?.value)      || 9,
    uncommon:  parseInt(document.getElementById('tUncommon')?.value)  || 5
  };

  if (score >= 22) return "mythic"; 
  if (score >= thresh.legendary) return "legendary";
  if (score >= thresh.epic)      return "epic";
  if (score >= thresh.rare)      return "rare";
  if (score >= thresh.uncommon)  return "uncommon";
  return "common";
}

/* ── BATCH FORGE (ADMIN ONLY) ── */
function massForge10k() {
    if (!AdminAuth.isAuthorized) {
        if (typeof toast === 'function') toast("Unauthorized Access: Generator Locked", "error");
        return;
    }
    
    resetGeneratorState();
    isGenerating = true;
    if (typeof toast === 'function') toast("Forging 10,000 Mech Rangers on Base...", "info");

    while (allNFTs.length < 10000 && tokenCounter < 60000) {
        const nft = generateNFT();
        if (nft) allNFTs.push(nft);
        else if (allNFTs.length >= 10000) break;
    }
    
    isGenerating = false;
    if (typeof renderGallery === 'function') renderGallery(); 
    if (typeof toast === 'function') toast("Generation Complete. Ready for Snapshot.", "success");
}

/* ── CORE GENERATOR ── */
function generateNFT(attempt = 0) {
  if (attempt > 500) return null; 

  tokenCounter++;
  // Utilizing rng32 with its built-in seed scrambler from rng.js
  const seed = ((Math.random() * 2147483647) | 0) ^ (tokenCounter * 31337);
  const roll  = rng32(seed);

  const traits = {
    background: weightedPick(TRAITS.background.options, roll),
    suit:       weightedPick(TRAITS.suit.options,       roll),
    helmet:     weightedPick(TRAITS.helmet.options,     roll),
    weapon:     weightedPick(TRAITS.weapon.options,     roll),
    aura:       weightedPick(TRAITS.aura.options,       roll),
    badge:      weightedPick(TRAITS.badge.options,      roll),
  };

  let rarity = calcRarity(traits);

  const currentCaps = {
    mythic:    SUPPLY_CAPS.mythic,
    legendary: SUPPLY_CAPS.legendary,
    epic:      SUPPLY_CAPS.epic,
    rare:      SUPPLY_CAPS.rare,
    uncommon:  SUPPLY_CAPS.uncommon,
    common:    SUPPLY_CAPS.common
  };

  if (mintedCount[rarity] >= (currentCaps[rarity] || 0)) {
    const sequence = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
    rarity = sequence.find(t => mintedCount[t] < currentCaps[t]);
    
    if (!rarity) {
      tokenCounter--;
      return null; 
    }
  }
  
  const hash = Object.values(traits).map(t => t.val).join('-');
  if (hashSet.has(hash) && hashSet.size < 9995) {
    tokenCounter--;
    return generateNFT(attempt + 1);
  }

  hashSet.add(hash);
  mintedCount[rarity]++;

  // Using secondary roll from the same utility
  const roll2 = rng32(seed + 888);
  const name = NAMES[Math.floor(roll2() * NAMES.length)] + ' ' + SUFX[Math.floor(roll2() * SUFX.length)];
  const basePower = Math.floor(roll2() * 24) + 76;

  return {
    id:     allNFTs.length + 1, 
    name,
    seed,
    rarity,
    traits,
    score:  basePower,
    network: "Base",
    submitted: false 
  };
}

/* ── RESET ── */
function resetGeneratorState() {
  allNFTs      = [];
  hashSet      = new Set();
  tokenCounter = 0;
  Object.keys(mintedCount).forEach(k => mintedCount[k] = 0);
  console.log("Admin: Factory Cleaned. Ready for New Epoch.");
}

// Global Exports
window.AdminAuth = AdminAuth;
window.generateNFT = generateNFT;
window.resetGeneratorState = resetGeneratorState;
window.SUPPLY_CAPS = SUPPLY_CAPS;

if (typeof module !== 'undefined') {
    module.exports = { AdminAuth, massForge10k, generateNFT, resetGeneratorState, allNFTs, mintedCount };
}
