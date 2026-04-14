/* ═══════════════════════════════════════════════════════
   traits.js — All trait definitions + name pools
   No logic here — pure data only.
   ═══════════════════════════════════════════════════════ */

const TRAITS = {
  background: {
    name: "Background",
    options: [
      { val:"void",      label:"Void",          color:["#050508","#0a0a14"], weight:20, tier: "Common" },
      { val:"urban",     label:"Urban Ruin",     color:["#0d1520","#1a2814"], weight:18, tier: "Common" },
      { val:"plasma",    label:"Plasma Storm",   color:["#0a0520","#1e0a2e"], weight:15, tier: "Uncommon" },
      { val:"volcanic",  label:"Volcanic",       color:["#1e0600","#0e000e"], weight:12, tier: "Uncommon" },
      { val:"cyber",     label:"Cyber Grid",     color:["#000a14","#001422"], weight:12, tier: "Rare" },
      { val:"arctic",    label:"Arctic",         color:["#050d14","#0a1420"], weight:10, tier: "Rare" },
      { val:"dimension", label:"Dimension Rift", color:["#0e001e","#001e1e"], weight:8,  tier: "Epic" },
      { val:"golden",    label:"Golden Age",     color:["#140900","#1e0d00"], weight:5,  tier: "Legendary" },
      { val:"cosmic",    label:"Cosmic Void",    color:["#08001e","#1e0032"], weight:2,  tier: "mythic" },
    ]
  },

  suit: {
    name: "Suit",
    options: [
      { val:"ranger_red",    label:"Crimson Ranger",  primary:"#cc0020", accent:"#ff2040", weight:14, tier: "Common" },
      { val:"ranger_blue",   label:"Cobalt Ranger",   primary:"#003ccc", accent:"#2060ff", weight:14, tier: "Common" },
      { val:"ranger_black",  label:"Obsidian Ranger", primary:"#141428", accent:"#4444ff", weight:12, tier: "Uncommon" },
      { val:"ranger_green",  label:"Viper Ranger",    primary:"#00441e", accent:"#00ff60", weight:12, tier: "Uncommon" },
      { val:"ranger_yellow", label:"Nova Ranger",     primary:"#a07000", accent:"#ffcc00", weight:10, tier: "Rare" },
      { val:"ranger_pink",   label:"Sakura Ranger",   primary:"#880050", accent:"#ff44aa", weight:8,  tier: "Rare" },
      { val:"ranger_white",  label:"Phantom Ranger",  primary:"#242438", accent:"#ccccff", weight:7,  tier: "Epic" },
      { val:"ranger_silver", label:"Chrome Ranger",   primary:"#2c2c3c", accent:"#c0c0d0", weight:6,  tier: "Epic" },
      { val:"ranger_gold",   label:"Imperial Ranger", primary:"#503400", accent:"#ffd700", weight:4,  tier: "Legendary" },
      { val:"ranger_void",   label:"Void Ranger",     primary:"#050508", accent:"#ff00ff", weight:3,  tier: "Legendary" },
      { val:"ranger_cosmic", label:"Cosmic Ranger",   primary:"#08001e", accent:"#00ffff", weight:2,  tier: "mythic" },
    ]
  },

  helmet: {
    name: "Helmet",
    options: [
      { val:"standard",  label:"Standard",       weight:25, tier: "Common" },
      { val:"horned",    label:"Horned Beast",   weight:15, tier: "Uncommon" },
      { val:"visor",     label:"Wide Visor",     weight:15, tier: "Uncommon" },
      { val:"crown",     label:"Crown Guard",    weight:12, tier: "Rare" },
      { val:"dragon",    label:"Dragon Crest",   weight:10, tier: "Rare" },
      { val:"angular",   label:"Angular Blade",  weight:8,  tier: "Epic" },
      { val:"ancient",   label:"Ancient Mask",   weight:7,  tier: "Epic" },
      { val:"legendary", label:"Legendary Halo", weight:5,  tier: "Legendary" },
      { val:"oni",       label:"Oni Mask",       weight:3,  tier: "mythic" },
    ]
  },

  weapon: {
    name: "Weapon",
    options: [
      { val:"sword",     label:"Power Sword",    weight:20, tier: "Common" },
      { val:"blaster",   label:"Plasma Blaster", weight:18, tier: "Common" },
      { val:"lance",     label:"Thunder Lance",  weight:15, tier: "Uncommon" },
      { val:"shield",    label:"Titan Shield",   weight:14, tier: "Uncommon" },
      { val:"gauntlets", label:"Iron Gauntlets", weight:10, tier: "Rare" },
      { val:"twin",      label:"Twin Blades",    weight:8,  tier: "Epic" },
      { val:"cannon",    label:"Mega Cannon",    weight:7,  tier: "Epic" },
      { val:"staff",     label:"Zord Staff",     weight:5,  tier: "Legendary" },
      { val:"none",      label:"None",           weight:3,  tier: "Common" },
    ]
  },

  aura: {
    name: "Aura",
    options: [
      { val:"none",     label:"None",     color:"#000000", weight:35, glow: 0.0, tier: "Common" },
      { val:"electric", label:"Electric", color:"#00e5ff", weight:20, glow: 0.6, tier: "Uncommon" },
      { val:"fire",     label:"Fire",     color:"#ff6600", weight:15, glow: 0.7, tier: "Rare" },
      { val:"shadow",   label:"Shadow",   color:"#6600ff", weight:12, glow: 0.5, tier: "Rare" },
      { val:"holy",     label:"Holy",     color:"#ffffff", weight:8,  glow: 0.9, tier: "Epic" },
      { val:"plasma",   label:"Plasma",   color:"#ff00ff", weight:7,  glow: 0.8, tier: "Legendary" },
      { val:"cosmic",   label:"Cosmic",   color:"#00ffcc", weight:3,  glow: 1.0, tier: "mythic" },
    ]
  },

  badge: {
    name: "Chest Badge",
    options: [
      { val:"diamond",   label:"Diamond",   weight:20, tier: "Common" },
      { val:"star",      label:"Star",      weight:18, tier: "Common" },
      { val:"lightning", label:"Lightning", weight:15, tier: "Uncommon" },
      { val:"skull",     label:"Skull",     weight:12, tier: "Uncommon" },
      { val:"dragon",    label:"Dragon",    weight:10, tier: "Rare" },
      { val:"wings",     label:"Wings",     weight:8,  tier: "Epic" },
      { val:"eye",       label:"Eye",       weight:7,  tier: "Epic" },
      { val:"crown",     label:"Crown",     weight:6,  tier: "Legendary" },
      { val:"zord",      label:"Zord",      weight:4,  tier: "mythic" },
    ]
  }
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
