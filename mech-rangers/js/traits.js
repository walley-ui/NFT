/* ═══════════════════════════════════════════════════════
   traits.js — All trait definitions + name pools
   No logic here — pure data only.
   Standardized for Level 0 Base Mainnet Launch
   ═══════════════════════════════════════════════════════ */

const TRAITS = {
  background: {
    name: "Background",
    options: [
      { val:"void",      label:"Void",          color:["#050508","#0a0a14"], weight:20, tier: "Common",  layer: 0 },
      { val:"urban",     label:"Urban Ruin",     color:["#0d1520","#1a2814"], weight:18, tier: "Common",  layer: 0 },
      { val:"plasma",    label:"Plasma Storm",   color:["#0a0520","#1e0a2e"], weight:15, tier: "Uncommon", layer: 0 },
      { val:"volcanic",  label:"Volcanic",       color:["#1e0600","#0e000e"], weight:12, tier: "Uncommon", layer: 0 },
      { val:"cyber",     label:"Cyber Grid",     color:["#000a14","#001422"], weight:12, tier: "Rare",     layer: 0 },
      { val:"arctic",    label:"Arctic",         color:["#050d14","#0a1420"], weight:10, tier: "Rare",     layer: 0 },
      { val:"dimension", label:"Dimension Rift", color:["#0e001e","#001e1e"], weight:8,  tier: "Epic",     layer: 0 },
      { val:"golden",    label:"Golden Age",     color:["#140900","#1e0d00"], weight:5,  tier: "Legendary",layer: 0 },
      { val:"cosmic",    label:"Cosmic Void",    color:["#08001e","#1e0032"], weight:2,  tier: "Mythic",    layer: 0 },
    ]
  },

  suit: {
    name: "Suit",
    options: [
      { val:"ranger_red",    label:"Crimson Ranger",  primary:"#cc0020", accent:"#ff2040", weight:14, tier: "Common",  layer: 2 },
      { val:"ranger_blue",   label:"Cobalt Ranger",   primary:"#003ccc", accent:"#2060ff", weight:14, tier: "Common",  layer: 2 },
      { val:"ranger_black",  label:"Obsidian Ranger", primary:"#141428", accent:"#4444ff", weight:12, tier: "Uncommon", layer: 2 },
      { val:"ranger_green",  label:"Viper Ranger",    primary:"#00441e", accent:"#00ff60", weight:12, tier: "Uncommon", layer: 2 },
      { val:"ranger_yellow", label:"Nova Ranger",     primary:"#a07000", accent:"#ffcc00", weight:10, tier: "Rare",     layer: 2 },
      { val:"ranger_pink",   label:"Sakura Ranger",   primary:"#880050", accent:"#ff44aa", weight:8,  tier: "Rare",     layer: 2 },
      { val:"ranger_white",  label:"Phantom Ranger",  primary:"#242438", accent:"#ccccff", weight:7,  tier: "Epic",     layer: 2 },
      { val:"ranger_silver", label:"Chrome Ranger",   primary:"#2c2c3c", accent:"#c0c0d0", weight:6,  tier: "Epic",     layer: 2 },
      { val:"ranger_gold",   label:"Imperial Ranger", primary:"#503400", accent:"#ffd700", weight:4,  tier: "Legendary",layer: 2 },
      { val:"ranger_void",   label:"Void Ranger",     primary:"#050508", accent:"#ff00ff", weight:3,  tier: "Legendary",layer: 2 },
      { val:"ranger_cosmic", label:"Cosmic Ranger",   primary:"#08001e", accent:"#00ffff", weight:2,  tier: "Mythic",    layer: 2 },
    ]
  },

  helmet: {
    name: "Helmet",
    options: [
      { val:"standard",  label:"Standard",       weight:25, tier: "Common",    layer: 5 },
      { val:"horned",    label:"Horned Beast",   weight:15, tier: "Uncommon",  layer: 5 },
      { val:"visor",     label:"Wide Visor",     weight:15, tier: "Uncommon",  layer: 5 },
      { val:"crown",     label:"Crown Guard",    weight:12, tier: "Rare",      layer: 5 },
      { val:"dragon",    label:"Dragon Crest",   weight:10, tier: "Rare",      layer: 5 },
      { val:"angular",   label:"Angular Blade",  weight:8,  tier: "Epic",      layer: 5 },
      { val:"ancient",   label:"Ancient Mask",   weight:7,  tier: "Epic",      layer: 5 },
      { val:"legendary", label:"Legendary Halo", weight:5,  tier: "Legendary", layer: 5 },
      { val:"oni",       label:"Oni Mask",       weight:3,  tier: "Mythic",    layer: 5 },
    ]
  },

  weapon: {
    name: "Weapon",
    options: [
      { val:"sword",     label:"Power Sword",    weight:20, tier: "Common",    layer: 4 },
      { val:"blaster",   label:"Plasma Blaster", weight:18, tier: "Common",    layer: 4 },
      { val:"lance",     label:"Thunder Lance",  weight:15, tier: "Uncommon",  layer: 4 },
      { val:"shield",    label:"Titan Shield",   weight:14, tier: "Uncommon",  layer: 4 },
      { val:"gauntlets", label:"Iron Gauntlets", weight:10, tier: "Rare",      layer: 4 },
      { val:"twin",      label:"Twin Blades",    weight:8,  tier: "Epic",      layer: 4 },
      { val:"cannon",    label:"Mega Cannon",    weight:7,  tier: "Epic",      layer: 4 },
      { val:"staff",     label:"Zord Staff",     weight:5,  tier: "Legendary", layer: 4 },
      { val:"none",      label:"None",           weight:3,  tier: "Common",    layer: 4 },
    ]
  },

  aura: {
    name: "Aura",
    options: [
      { val:"none",     label:"None",     color:"#000000", weight:35, glow: 0.0, tier: "Common",   layer: 1 },
      { val:"electric", label:"Electric", color:"#00e5ff", weight:20, glow: 0.6, tier: "Uncommon", layer: 1 },
      { val:"fire",     label:"Fire",     color:"#ff6600", weight:15, glow: 0.7, tier: "Rare",     layer: 1 },
      { val:"shadow",   label:"Shadow",   color:"#6600ff", weight:12, glow: 0.5, tier: "Rare",     layer: 1 },
      { val:"holy",     label:"Holy",     color:"#ffffff", weight:8,  glow: 0.9, tier: "Epic",     layer: 1 },
      { val:"plasma",   label:"Plasma",   color:"#ff00ff", weight:7,  glow: 0.8, tier: "Legendary",layer: 1 },
      { val:"cosmic",   label:"Cosmic",   color:"#00ffcc", weight:3,  glow: 1.0, tier: "Mythic",    layer: 1 },
    ]
  },

  badge: {
    name: "Chest Badge",
    options: [
      { val:"diamond",   label:"Diamond",   weight:20, tier: "Common",    layer: 3 },
      { val:"star",      label:"Star",      weight:18, tier: "Common",    layer: 3 },
      { val:"lightning", label:"Lightning", weight:15, tier: "Uncommon",  layer: 3 },
      { val:"skull",     label:"Skull",     weight:12, tier: "Uncommon",  layer: 3 },
      { val:"dragon",    label:"Dragon",    weight:10, tier: "Rare",      layer: 3 },
      { val:"wings",     label:"Wings",     weight:8,  tier: "Epic",      layer: 3 },
      { val:"eye",       label:"Eye",       weight:7,  tier: "Epic",      layer: 3 },
      { val:"crown",     label:"Crown",     weight:6,  tier: "Legendary", layer: 3 },
      { val:"zord",      label:"Zord",      weight:4,  tier: "Mythic",    layer: 3 },
    ]
  }
};

/* Config Global Object for rng.js consumption */
const MECH_CONFIG = {
  tiers: [
    { name: "Common",    multiplier: 1.0, weight: 50 },
    { name: "Uncommon",  multiplier: 1.2, weight: 25 },
    { name: "Rare",      multiplier: 1.5, weight: 12 },
    { name: "Epic",      multiplier: 2.0, weight: 7  },
    { name: "Legendary", multiplier: 3.0, weight: 4  },
    { name: "Mythic",    multiplier: 5.0, weight: 2  }
  ],
  minAtk: 10, maxAtk: 99,
  minDef: 10, maxDef: 99,
  themeColors: ["#ff0044", "#00ffcc", "#ffff00", "#ff00ff", "#00ccff", "#ffffff"],
  // Direct mapping for generateMechData
  suits: TRAITS.suit.options,
  backgrounds: TRAITS.background.options,
  auras: TRAITS.aura.options,
  weapons: TRAITS.weapon.options,
  badges: TRAITS.badge.options,
  helmets: TRAITS.helmet.options
};

/* Name pools */
const NAMES = [
  "Alpha","Beta","Gamma","Delta","Epsilon","Zeta","Theta","Sigma",
  "Omega","Nova","Titan","Apex","Nexus","Vortex","Phantom","Shadow",
  "Blaze","Storm","Volt","Iron","Steel","Chrome","Obsidian","Crimson",
  "Azure","Jade","Fury","Zenith","Kira","Rex"
];

const SUFX = [
  "Zero","Prime","X","Ultra","Hyper","Mega","Zord","Rex","Neo",
  "Core","Force","Strike","Blade","Edge","Wave","Mark","Surge",
  "Pulse","Drift","Arc"
];

/* ── NODE/BROWSER ALIGNMENT EXPORT ── */
if (typeof module !== 'undefined') {
    module.exports = { TRAITS, NAMES, SUFX, MECH_CONFIG };
}
