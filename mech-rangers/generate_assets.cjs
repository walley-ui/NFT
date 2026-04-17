const fs = require('fs');
const path = require('path');

/* ─── MOCK BROWSER GLOBALS ─── */
global.document = {
    getElementById: (id) => ({ value: 10000 }) // Forces max caps for the forge
};
global.window = global;

function loadAndFix(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/^(const|let|var)\s+([a-zA-Z0-9_]+)\s*=/gm, 'global.$2 =');
    code = code.replace(/function\s+([a-zA-Z0-9_]+)/g, 'global.$1 = function');
    eval(code);
}

// Load the engine
loadAndFix('./js/rng.js');
loadAndFix('./js/traits.js');
loadAndFix('./js/generator.js');
loadAndFix('./js/renderer.js');

if (global.AdminAuth) global.AdminAuth.verify();

const IMG_DIR = './mech_images';
const JSON_DIR = './mech_metadata';
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
if (!fs.existsSync(JSON_DIR)) fs.mkdirSync(JSON_DIR, { recursive: true });

async function runForge() {
    console.log("🛠️  Forging 10k assets locally...");
    for (let i = 1; i <= 10000; i++) {
        const nft = global.generateNFT(); 
        if (!nft) break;

        // The Trigger: Generate actual SVG content
        const svgString = global.renderSVG(nft, 1000); 

        // 1. Save the Image (This is what you upload for the CID)
        fs.writeFileSync(path.join(IMG_DIR, `${i}.svg`), svgString);

        // 2. Save the Metadata (With Placeholder CID)
        const metadata = {
            name: `Mech Ranger #${i}`,
            description: "Premium Metal Edition Mech.",
            image: `ipfs://REPLACE_WITH_IMAGE_FOLDER_CID/${i}.svg`,
            attributes: Object.entries(nft.traits).map(([key, t]) => ({
                trait_type: key,
                value: t.label || t.val
            }))
        };
        fs.writeFileSync(path.join(JSON_DIR, `${i}.json`), JSON.stringify(metadata, null, 2));

        if (i % 1000 === 0) console.log(`✅ ${i} units forged.`);
    }
    console.log("\n🚀 LOCAL FORGE COMPLETE.");
    console.log("1. Inspect your images in /mech_images.");
    console.log("2. Upload the /mech_images folder to IPFS to get your CID.");
}

runForge();
