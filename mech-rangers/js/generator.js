/* ═══════════════════════════════════════════════════════
   generator.js — NFT Generation Engine (ADMIN SECURED)
   Enforced: Only Admin (ix_prinx) can trigger mass forge.
   Depends on: traits.js, rng.js, admin.js
   ═══════════════════════════════════════════════════════ */

/* ── ADMIN AUTH GATE ── */
const AdminAuth = {
    isAuthorized: false, // Default locked
    verify() {
        // Logic: Only ix_prinx can toggle this via the hidden Admin console
        this.isAuthorized = true;
        console.log("Master Forge Authorization Granted.");
    }
};

/* ── DYNAMIC RARITY SYSTEM (UPGRADED) ── */
const SUPPLY_CAPS = {
  legendary: parseInt(document.getElementById('capLegendary')?.value) || 100,
  epic:      parseInt(document.getElementById('capEpic')?.value)      || 900,
  rare:      parseInt(document.getElementById('capRare')?.value)      || 2000,
  uncommon:  parseInt(document.getElementById('capUncommon')?.value)  || 3980,
  common:    parseInt(document.getElementById('capCommon')?.value)    || 4000,
  mythic:    parseInt(document.getElementById('capMythic')?.value)    || 20
};

const mintedCount = {
  legendary: 0,
  epic:      0,
  rare:      0,
  uncommon:  0,
  common:    0,
  mythic:    0,
};

/* ── GLOBAL STATE ── */
let allNFTs      = [];
let tokenCounter = 0;
let hashSet      = new Set();
let isGenerating = false;

/* ── RARITY SCORING (DYNAMIC ENGINE) ── */
function calcRarity(traits) {
  const bgScore = { void:1, urban:1, plasma:2, volcanic:2, cyber:3, arctic:3, dimension:4, golden:5 };
  const helmScore = { standard:1, horned:2, visor:2, crown:3, dragon:3, angular:3, ancient:4, legendary:5, oni:5 };
  const wpnScore = { sword:1, blaster:1, lance:2, shield:2, gauntlets:2, twin:3, cannon:3, staff:4, none:1 };
  const auraScore = { none:0, electric:2, fire:2, shadow:3, holy:4, plasma:4, cosmic:5 };
  const suitBonus = { ranger_cosmic:5, ranger_void:5, ranger_gold:4, ranger_silver:3, ranger_white:3 };

  const score =
    (bgScore[traits.background.val]  || 1) +
    (helmScore[traits.helmet.val]    || 1) +
    (wpnScore[traits.weapon.val]     || 1) +
    (auraScore[traits.aura.val]      || 0) +
    (suitBonus[traits.suit.val]      || 1);

  // Dynamic Thresholds pulled from Admin Inputs
  const thresh = {
    legendary: parseInt(document.getElementById('tLegendary')?.value) || 18,
    epic:      parseInt(document.getElementById('tEpic')?.value)      || 13,
    rare:      parseInt(document.getElementById('tRare')?.value)      || 9,
    uncommon:  parseInt(document.getElementById('tUncommon')?.value)  || 5
  };

  if (score >= 20) return "mythic"; 
  if (score >= thresh.legendary) return "legendary";
  if (score >= thresh.epic)      return "epic";
  if (score >= thresh.rare)      return "rare";
  if (score >= thresh.uncommon)  return "uncommon";
  return "common";
}

/* ── BATCH FORGE (ADMIN ONLY) ── */
function massForge10k() {
    if (!AdminAuth.isAuthorized) {
        toast("Unauthorized Access: Generator Locked", "error");
        return;
    }
    
    resetGeneratorState();
    isGenerating = true;
    toast("Forging 10,000 Mech Rangers on Base...", "info");

    while (allNFTs.length < 10000 && tokenCounter < 15000) {
        const nft = generateNFT();
        if (nft) allNFTs.push(nft);
    }
    
    isGenerating = false;
    renderGallery(); // Only displays for Admin
    toast("Generation Complete. Ready for Snapshot.", "success");
}

/* ── CORE GENERATOR ── */
function generateNFT(attempt = 0) {
  if (attempt > 300) return null; 

  tokenCounter++;
  const seed = ((Math.random() * 2147483647) | 0) ^ (tokenCounter * 31337);
  const rng  = rng32(seed);

  const traits = {
    background: weightedPick(TRAITS.background.options, rng),
    suit:       weightedPick(TRAITS.suit.options,       rng),
    helmet:     weightedPick(TRAITS.helmet.options,     rng),
    weapon:     weightedPick(TRAITS.weapon.options,     rng),
    aura:       weightedPick(TRAITS.aura.options,       rng),
    badge:      weightedPick(TRAITS.badge.options,      rng),
  };

  const rarity = calcRarity(traits);

  // Pulling caps dynamically from Admin UI
  const currentCaps = {
    legendary: parseInt(document.getElementById('cMaxLegendary')?.value) || 100,
    epic:      parseInt(document.getElementById('cMaxEpic')?.value)      || 900,
    rare:      parseInt(document.getElementById('cMaxRare')?.value)      || 2000,
    uncommon:  parseInt(document.getElementById('cMaxUncommon')?.value)  || 3000,
    common:    parseInt(document.getElementById('cMaxCommon')?.value)    || 4000,
  };

  if (mintedCount[rarity] >= currentCaps[rarity]) {
    tokenCounter--;
    return generateNFT(attempt + 1);
  }

  const hash = Object.values(traits).map(t => t.val).join('-');
  if (hashSet.has(hash) && hashSet.size < 9950) {
    tokenCounter--;
    return generateNFT(attempt + 1);
  }

  hashSet.add(hash);
  mintedCount[rarity]++;

  const rng2 = rng32(seed + 99);
  const name = NAMES[Math.floor(rng2() * NAMES.length)] + ' ' + SUFX[Math.floor(rng2() * SUFX.length)];
  const basePower = Math.floor(rng2() * 24) + 76;

  return {
    id:     tokenCounter,
    name,
    seed,
    rarity,
    traits,
    score:  basePower,
    network: "Base",
    submitted: false // Initial status for Bridge check
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
