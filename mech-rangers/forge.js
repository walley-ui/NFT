/* ═══════════════════════════════════════════════════════
   forge.js — The ESM Orchestrator
   Purpose: Modern ES Module bridge for the Genesis Forge.
   ═══════════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import our logic modules
import { generateMechData } from './js/rng.js';
import { MECH_TITAN_RENDERER } from './js/renderer.js';

// Setup __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
    tiers: [
        { name: "mythic", weight: 5, multiplier: 2 },
        { name: "legendary", weight: 15, multiplier: 1.5 },
        { name: "epic", weight: 80, multiplier: 1 }
    ],
    suits: [
        { val: "obsidian_pro", tier: "mythic", label: "Obsidian Pro", weight: 5, primary: "#111111", accent: "#38bdf8" },
        { val: "gunmetal", tier: "epic", label: "Gunmetal", weight: 80, primary: "#2a2d34", accent: "#38bdf8" }
    ],
    backgrounds: [{ val: "hangar", tier: "epic", label: "Industrial Hangar", weight: 100 }],
    auras: [{ val: "heat_haze", tier: "legendary", label: "Heat Haze", weight: 20 }],
    weapons: [{ val: "vortex_blade", tier: "mythic", label: "Vortex Blade", weight: 10 }],
    badges: [{ val: "standard", tier: "epic", label: "Standard Issue", weight: 100 }],
    helmets: [{ val: "heavy_plate", tier: "mythic", label: "Heavy Plate", weight: 10 }],
    themeColors: ["#38bdf8", "#ffffff", "#111111"],
    minAtk: 50, maxAtk: 100, minDef: 50, maxDef: 100
};

const forge = (count = 1) => {
    const outDir = path.join(__dirname, 'outputs');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    console.log(`\x1b[34m[OPTIMUM_OS]\x1b[0m Initializing Forge for ${count} units...`);

    for (let i = 0; i < count; i++) {
        const dna = `GENESIS_${Date.now()}_${i}_${Math.random()}`;
        
        try {
            // A. Generate Data
            const nftData = generateMechData(dna, CONFIG);
            
            // B. Render SVG
            const physicalSVG = MECH_TITAN_RENDERER.render(nftData);
            
            // C. Save File
            const filePath = path.join(outDir, `mech_${nftData.id}.svg`);
            fs.writeFileSync(filePath, physicalSVG);
            
            console.log(`\x1b[32m[RENDERED]\x1b[0m Unit #${nftData.id} -> outputs/mech_${nftData.id}.svg`);
        } catch (err) {
            console.error(`\x1b[31m[ERROR]\x1b[0m Forge failed on unit ${i}:`, err.message);
        }
    }
    console.log(`\x1b[36m[COMPLETE]\x1b[0m Check the 'outputs' folder.`);
};

forge(5); // Generates a small batch of 5 to test variety
