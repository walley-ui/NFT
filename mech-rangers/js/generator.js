/* ═══════════════════════════════════════════════════════
   generator.js — Cinematic Forge Engine (ADMIN)
   UPGRADE: High-Fidelity 3-Tier Scoring & Rebrand Logic
   Logic: Aligned for 10,000 unit Ethereum Mainnet Forge
   ═══════════════════════════════════════════════════════ */

if (typeof document === 'undefined') {
    global.document = {
        getElementById: (id) => ({
            value: {
                'cMaxMythic': 2000, 'cMaxLegendary': 3000, 'cMaxEpic': 5000, 
                'tLegendary': 25, 'tEpic': 18
            }[id] || 0
        })
    };
}

const AdminAuth = {
    isAuthorized: false,
    verify() {
        this.isAuthorized = true;
        console.log("Master Forge Authorization Granted.");
    }
};

const SUPPLY_CAPS = {
  get mythic()    { return parseInt(document.getElementById('cMaxMythic')?.value || 2000); },
  get legendary() { return parseInt(document.getElementById('cMaxLegendary')?.value || 3000); },
  get epic()      { return parseInt(document.getElementById('cMaxEpic')?.value || 5000); }
};

const mintedCount = { mythic: 0, legendary: 0, epic: 0 };

let allNFTs      = [];
let tokenCounter = 0;
let hashSet      = new Set();
let isGenerating = false;

/* ── CINEMATIC RARITY SCORING (REBRANDED) ── */
function calcRarity(traits) {
  // Environment Weights
  const envScore = { shipyard:1, hangar:1, rain_neon:2, wasteland:2, orbital:3, foundry:3, cyber_grid:4, gold_vault:5, zero_g:6 };
  // Head Unit Weights
  const headScore = { ranger_v1:1, tactical_vis:2, heavy_plate:2, scout_eye:3, dragon_fin:3, shard_crown:4, ancient_god:5, halo_sys:5, samurai_x:6 };
  // Armament Weights
  const wpnScore = { energy_sword:2, railgun:2, arc_lance:3, riot_shield:3, power_fists:3, twin_daggers:4, vortex_cannon:5, gravity_ham:6, none:1 };
  // Visual FX Weights
  const vfxScore = { none:0, smoke:1, sparks:2, heat_haze:3, glitch:4, energy_off:5, nebula:6 };
  // Armor Material Weights
  const matScore = { 
    brushed_silver:1, gunmetal:1, obsidian_pro:2, cobalt_alloy:2, 
    desert_camo:3, stealth_hex:3, damaged_steel:4, chrome_mirror:5, 
    imperial_gold:6, void_matter:7, star_forged:8 
  };

  const totalScore =
    (envScore[traits.background.val] || 1) +
    (headScore[traits.helmet.val]    || 1) +
    (wpnScore[traits.weapon.val]     || 1) +
    (vfxScore[traits.aura.val]       || 0) +
    (matScore[traits.suit.val]       || 1);

  // Re-calibrated Thresholds for Cinematic Traits
  const tLegendary = parseInt(document.getElementById('tLegendary')?.value) || 25;
  const tEpic      = parseInt(document.getElementById('tEpic')?.value)      || 18;

  if (totalScore >= 25) return "mythic"; 
  if (totalScore >= tLegendary) return "legendary";
  return "epic"; 
}

function massForge10k() {
    if (!AdminAuth.isAuthorized) {
        if (typeof toast === 'function') toast("Forge Locked: Admin Required", "error");
        return;
    }
    
    resetGeneratorState();
    isGenerating = true;

    while (allNFTs.length < 10000 && tokenCounter < 500000) {
        const nft = generateNFT();
        if (nft) allNFTs.push(nft);
    }
    
    isGenerating = false;
    if (typeof renderGallery === 'function') renderGallery(); 
    if (typeof toast === 'function') toast("Cinematic Forge Complete.", "success");
}

function generateNFT(attempt = 0) {
  if (attempt > 1000) return null; 

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

  // Supply Cap Protection
  if (mintedCount[rarity] >= SUPPLY_CAPS[rarity]) {
    const sequence = ['epic', 'legendary', 'mythic'];
    rarity = sequence.find(t => mintedCount[t] < SUPPLY_CAPS[t]);
    if (!rarity) return null; 
  }
  
  const hash = Object.values(traits).map(t => t.val).join('|');
  if (hashSet.has(hash)) return generateNFT(attempt + 1);

  hashSet.add(hash);
  mintedCount[rarity]++;

  const roll2 = rng32(seed + 999);
  const name = NAMES[Math.floor(roll2() * NAMES.length)] + ' ' + SUFX[Math.floor(roll2() * SUFX.length)];
  
  return {
    id:      allNFTs.length + 1, 
    name:    name.toUpperCase(),
    seed,
    rarity,
    traits,
    score:   Math.floor(roll2() * 50) + 50,
    network: "Ethereum Mainnet",
    isOrigin: (allNFTs.length + 1) <= 700
  };
}

function resetGeneratorState() {
  allNFTs = [];
  hashSet = new Set();
  tokenCounter = 0;
  mintedCount.mythic = 0;
  mintedCount.legendary = 0;
  mintedCount.epic = 0;
}

window.AdminAuth = AdminAuth;
window.generateNFT = generateNFT;
window.resetGeneratorState = resetGeneratorState;

if (typeof module !== 'undefined') {
    module.exports = { AdminAuth, massForge10k, generateNFT, resetGeneratorState, allNFTs, mintedCount };
}
