/* ═══════════════════════════════════════════════════════
   generator.js — NFT Generation Engine (ADMIN SECURED)
   UPGRADE: Strict 3-Tier Enforcement (Mythic | Legendary | Epic)
   Logic: Aligned for 10,000 unit Ethereum Mainnet Forge
   ═══════════════════════════════════════════════════════ */

/* ── NODE COMPATIBILITY LAYER ── */
if (typeof document === 'undefined') {
    global.document = {
        getElementById: (id) => ({
            value: {
                'cMaxMythic': 2000, 'cMaxLegendary': 3000, 'cMaxEpic': 5000, 
                'tLegendary': 22, 'tEpic': 14
            }[id] || 0
        })
    };
}

/* ── ADMIN AUTH GATE ── */
const AdminAuth = {
    isAuthorized: false,
    verify() {
        this.isAuthorized = true;
        console.log("Master Forge Authorization Granted.");
    }
};

/* ── DYNAMIC RARITY SYSTEM (STRICT 3-TIER) ── */
const SUPPLY_CAPS = {
  get mythic()    { return parseInt(document.getElementById('cMaxMythic')?.value || 2000); },
  get legendary() { return parseInt(document.getElementById('cMaxLegendary')?.value || 3000); },
  get epic()      { return parseInt(document.getElementById('cMaxEpic')?.value || 5000); }
};

const mintedCount = {
  mythic:    0,
  legendary: 0,
  epic:      0
};

/* ── GLOBAL STATE ── */
let allNFTs      = [];
let tokenCounter = 0;
let hashSet      = new Set();
let isGenerating = false;

/* ── RARITY SCORING (STRICT 3-TIER REWRITE) ── */
function calcRarity(traits) {
  const bgScore    = { void:1, urban:1, plasma:2, volcanic:2, cyber:3, arctic:3, dimension:4, golden:5, cosmic:6 };
  const helmScore  = { standard:1, horned:2, visor:2, crown:3, dragon:3, angular:3, ancient:4, legendary:5, oni:6 };
  const wpnScore   = { sword:1, blaster:1, lance:2, shield:2, gauntlets:2, twin:3, cannon:3, staff:4, none:1 };
  const auraScore  = { none:0, electric:2, fire:2, shadow:3, holy:4, plasma:4, cosmic:5 };
  const suitBonus  = { 
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

  const tLegendary = parseInt(document.getElementById('tLegendary')?.value) || 22;
  const tEpic      = parseInt(document.getElementById('tEpic')?.value)      || 14;

  if (score >= 22)         return "mythic"; 
  if (score >= tLegendary) return "legendary";
  return "epic"; 
}

/* ── BATCH FORGE (ADMIN ONLY) ── */
function massForge10k() {
    if (!AdminAuth.isAuthorized) {
        if (typeof toast === 'function') toast("Unauthorized Access: Generator Locked", "error");
        return;
    }
    
    resetGeneratorState();
    isGenerating = true;
    if (typeof toast === 'function') toast("Forging 10,000 Mech Rangers (3-Tier Mode)...", "info");

    while (allNFTs.length < 10000 && tokenCounter < 200000) {
        const nft = generateNFT();
        if (nft) allNFTs.push(nft);
    }
    
    isGenerating = false;
    if (typeof renderGallery === 'function') renderGallery(); 
    if (typeof toast === 'function') toast("Generation Complete: Mythic/Legendary/Epic Synced.", "success");
}

/* ── CORE GENERATOR ── */
function generateNFT(attempt = 0) {
  if (attempt > 500) return null; 

  tokenCounter++;
  const seed = ((Math.random() * 2147483647) | 0) ^ (tokenCounter * 31337);
  const roll = rng32(seed);

  const traits = {
    background: weightedPick(TRAITS.background.options, roll),
    suit:       weightedPick(TRAITS.suit.options,       roll),
    helmet:     weightedPick(TRAITS.helmet.options,     roll),
    weapon:     weightedPick(TRAITS.weapon.options,     roll),
    aura:       weightedPick(TRAITS.aura.options,       roll),
    badge:      weightedPick(TRAITS.badge.options,      roll),
  };

  let rarity = calcRarity(traits);

  // Fallback Logic: If a tier is full, overflow into the next available tier
  if (mintedCount[rarity] >= SUPPLY_CAPS[rarity]) {
    const sequence = ['epic', 'legendary', 'mythic'];
    rarity = sequence.find(t => mintedCount[t] < SUPPLY_CAPS[t]);
    
    if (!rarity) {
      tokenCounter--;
      return null; 
    }
  }
  
  const hash = Object.values(traits).map(t => t.val).join('-');
  if (hashSet.has(hash)) {
    tokenCounter--;
    return generateNFT(attempt + 1);
  }

  hashSet.add(hash);
  mintedCount[rarity]++;

  const roll2 = rng32(seed + 888);
  const name = NAMES[Math.floor(roll2() * NAMES.length)] + ' ' + SUFX[Math.floor(roll2() * SUFX.length)];
  const basePower = Math.floor(roll2() * 24) + 76;

  return {
    id:      allNFTs.length + 1, 
    name,
    seed,
    rarity,
    traits,
    score:   basePower,
    network: "Ethereum",
    submitted: false 
  };
}

/* ── RESET ── */
function resetGeneratorState() {
  allNFTs      = [];
  hashSet      = new Set();
  tokenCounter = 0;
  mintedCount.mythic = 0;
  mintedCount.legendary = 0;
  mintedCount.epic = 0;
  console.log("Admin: Factory Cleaned. 3-Tier Counters Reset.");
}

// Global Exports
window.AdminAuth = AdminAuth;
window.generateNFT = generateNFT;
window.resetGeneratorState = resetGeneratorState;
window.SUPPLY_CAPS = SUPPLY_CAPS;

if (typeof module !== 'undefined') {
    module.exports = { AdminAuth, massForge10k, generateNFT, resetGeneratorState, allNFTs, mintedCount };
}
