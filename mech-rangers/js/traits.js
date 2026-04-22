/* ═══════════════════════════════════════════════════════
   traits.js — Cinematic Rebrand (Production Data)
   Purpose: Defines the high-fidelity visual traits for
   the hyper-realistic 3D Ranger ecosystem.
   ═══════════════════════════════════════════════════════ */

const TRAITS = {
  background: {
    name: "Environment",
    options: [
      { val:"shipyard",   label:"Industrial Shipyard", color:["#2c2c2c","#1a1a1a"], weight:25, tier: "Epic",      layer: 0 },
      { val:"hangar",     label:"Tech Hangar",        color:["#1a202c","#0d1117"], weight:20, tier: "Epic",      layer: 0 },
      { val:"rain_neon",  label:"Neon Rain Alley",    color:["#050505","#1e0032"], weight:15, tier: "Legendary", layer: 0 },
      { val:"wasteland",  label:"Gritty Wasteland",   color:["#3d2b1f","#1a120b"], weight:12, tier: "Legendary", layer: 0 },
      { val:"orbital",    label:"Orbital Station",    color:["#000a14","#001422"], weight:10, tier: "Legendary", layer: 0 },
      { val:"foundry",    label:"Molten Foundry",     color:["#1e0600","#0e000e"], weight:8,  tier: "Mythic",    layer: 0 },
      { val:"cyber_grid", label:"Digital Void",       color:["#00ffcc","#000000"], weight:5,  tier: "Mythic",    layer: 0 },
      { val:"gold_vault", label:"Imperial Treasury",  color:["#140900","#1e0d00"], weight:3,  tier: "Mythic",    layer: 0 },
      { val:"zero_g",     label:"Deep Space",         color:["#08001e","#1e0032"], weight:2,  tier: "Mythic",    layer: 0 },
    ]
  },

  suit: {
    name: "Armor Material",
    options: [
      { val:"brushed_silver", label:"Brushed Silver-White", primary:"#e0e0e0", accent:"#ffffff", weight:18, tier: "Epic",      layer: 2 },
      { val:"gunmetal",       label:"Matte Gunmetal",      primary:"#2c2c2c", accent:"#4a4a4a", weight:17, tier: "Epic",      layer: 2 },
      { val:"obsidian_pro",   label:"Obsidian Plate",      primary:"#0a0a0a", accent:"#1a1a1a", weight:15, tier: "Epic",      layer: 2 },
      { val:"cobalt_alloy",   label:"Cobalt Alloy",        primary:"#001a4d", accent:"#0044ff", weight:12, tier: "Legendary", layer: 2 },
      { val:"desert_camo",    label:"Sand-Blasted Tan",    primary:"#a68d7a", accent:"#5e4b3c", weight:10, tier: "Legendary", layer: 2 },
      { val:"stealth_hex",    label:"Stealth Hex-Carbon",  primary:"#121212", accent:"#00ffcc", weight:8,  tier: "Legendary", layer: 2 },
      { val:"damaged_steel",  label:"Battle-Worn Steel",   primary:"#707070", accent:"#ff4400", weight:7,  tier: "Mythic",    layer: 2 },
      { val:"chrome_mirror",  label:"Liquid Chrome",       primary:"#f0f0f0", accent:"#ffffff", weight:6,  tier: "Mythic",    layer: 2 },
      { val:"imperial_gold",  label:"Gilded Imperial",     primary:"#503400", accent:"#ffd700", weight:4,  tier: "Mythic",    layer: 2 },
      { val:"void_matter",    label:"Anti-Matter Black",   primary:"#000000", accent:"#ff00ff", weight:2,  tier: "Mythic",    layer: 2 },
      { val:"star_forged",    label:"Star-Forged Ceramic", primary:"#ffffff", accent:"#00ffff", weight:1,  tier: "Mythic",    layer: 2 },
    ]
  },

  helmet: {
    name: "Head Unit",
    options: [
      { val:"ranger_v1",    label:"Ranger Core V1",    weight:35, tier: "Epic",      layer: 5 },
      { val:"tactical_vis", label:"Tactical Visor",    weight:20, tier: "Epic",      layer: 5 },
      { val:"heavy_plate",  label:"Heavy Juggernaut",  weight:15, tier: "Legendary", layer: 5 },
      { val:"scout_eye",    label:"Scout Mono-Eye",    weight:10, tier: "Legendary", layer: 5 },
      { val:"dragon_fin",   label:"Aero Dragon Fin",   weight:7,  tier: "Legendary", layer: 5 },
      { val:"shard_crown",  label:"Glass Shard Crown", weight:5,  tier: "Mythic",    layer: 5 },
      { val:"ancient_god",  label:"Ancient Mech God",  weight:4,  tier: "Mythic",    layer: 5 },
      { val:"halo_sys",     label:"Neural Halo",       weight:3,  tier: "Mythic",    layer: 5 },
      { val:"samurai_x",    label:"X-Samurai Mask",    weight:1,  tier: "Mythic",    layer: 5 },
    ]
  },

  weapon: {
    name: "Primary Armament",
    options: [
      { val:"energy_sword", label:"Plasma Edge Sword", weight:20, tier: "Epic",      layer: 4 },
      { val:"railgun",      label:"Portable Railgun",   weight:18, tier: "Epic",      layer: 4 },
      { val:"arc_lance",    label:"Arc Lightning Spear",weight:15, tier: "Legendary", layer: 4 },
      { val:"riot_shield",  label:"Kinetic Shield",     weight:14, tier: "Legendary", layer: 4 },
      { val:"power_fists",  label:"Hydraulic Fists",    weight:10, tier: "Legendary", layer: 4 },
      { val:"twin_daggers", label:"Sonic Twin Daggers", weight:8,  tier: "Mythic",    layer: 4 },
      { val:"vortex_cannon",label:"Singularity Cannon", weight:7,  tier: "Mythic",    layer: 4 },
      { val:"gravity_ham",  label:"Gravity Hammer",     weight:5,  tier: "Mythic",    layer: 4 },
      { val:"none",         label:"Unarmed Combat",     weight:3,  tier: "Epic",      layer: 4 },
    ]
  },

  aura: {
    name: "Visual FX",
    options: [
      { val:"none",      label:"Clear Visibility", color:"#000000", weight:50, glow: 0.0, tier: "Epic",      layer: 1 },
      { val:"smoke",     label:"Industrial Smoke", color:"#333333", weight:20, glow: 0.2, tier: "Legendary", layer: 1 },
      { val:"sparks",    label:"Electric Sparks",  color:"#00e5ff", weight:12, glow: 0.6, tier: "Legendary", layer: 1 },
      { val:"heat_haze", label:"Heat Distortion",  color:"#ff6600", weight:8,  glow: 0.4, tier: "Mythic",    layer: 1 },
      { val:"glitch",    label:"Digital Glitch",   color:"#ffffff", weight:5,  glow: 0.7, tier: "Mythic",    layer: 1 },
      { val:"energy_off",label:"Energy Overflow",  color:"#ff00ff", weight:3,  glow: 0.9, tier: "Mythic",    layer: 1 },
      { val:"nebula",    label:"Nebula Cloud",     color:"#00ffcc", weight:2,  glow: 1.0, tier: "Mythic",    layer: 1 },
    ]
  },

  badge: {
    name: "Core Badge",
    options: [
      { val:"v_core",     label:"V-Core",          weight:25, tier: "Epic",      layer: 3 },
      { val:"triangle",   label:"Delta Hub",       weight:20, tier: "Epic",      layer: 3 },
      { val:"lightning",  label:"Bolt Reactor",    weight:15, tier: "Legendary", layer: 3 },
      { val:"skull_tech", label:"Tech Skull",      weight:12, tier: "Legendary", layer: 3 },
      { val:"dragon_sig", label:"Dragon Sigil",    weight:10, tier: "Legendary", layer: 3 },
      { val:"wings_aero", label:"Aero Wings",      weight:8,  tier: "Mythic",    layer: 3 },
      { val:"eye_sensor", label:"Neural Eye",      weight:5,  tier: "Mythic",    layer: 3 },
      { val:"crown_unit", label:"Imperial Crown",  weight:3,  tier: "Mythic",    layer: 3 },
      { val:"omega",      label:"Omega Protocol",  weight:2,  tier: "Mythic",    layer: 3 },
    ]
  }
};

const MECH_CONFIG = {
  tiers: [
    { name: "Epic",      multiplier: 1.0, weight: 50 }, 
    { name: "Legendary", multiplier: 2.0, weight: 30 }, 
    { name: "Mythic",    multiplier: 5.0, weight: 20 }  
  ],
  minAtk: 25, maxAtk: 99, // Buffed base stats for cinematic feel
  minDef: 25, maxDef: 99,
  themeColors: ["#ffffff", "#2c2c2c", "#00ffcc", "#ff00ff", "#0044ff", "#ffd700"],
  suits: TRAITS.suit.options,
  backgrounds: TRAITS.background.options,
  auras: TRAITS.aura.options,
  weapons: TRAITS.weapon.options,
  badges: TRAITS.badge.options,
  helmets: TRAITS.helmet.options
};

const NAMES = ["Aegis","Saber","Goliath","Vanguard","Interceptor","Sentinel","Reaper","Ronin","Specter","Paladin"];
const SUFX = ["Prime","X","Mk-II","Nova","Alpha","Sentinel","Drift","Core","Zero","Protocol"];

if (typeof module !== 'undefined') {
    module.exports = { TRAITS, NAMES, SUFX, MECH_CONFIG };
}
