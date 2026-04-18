const fs = require('fs');
const path = require('path');
const vm = require('vm');

/* ─── 1. BROWSER MOCKING ─── */
const mockDom = {
    getElementById: (id) => ({
        value: {
            'cMaxMythic': 20, 'cMaxLegendary': 100, 'cMaxEpic': 900, 
            'cMaxRare': 2000, 'cMaxUncommon': 3000, 'cMaxCommon': 3980,
            'tLegendary': 18, 'tEpic': 13, 'tRare': 9, 'tUncommon': 5
        }[id] || 0,
        style: {},
        textContent: ""
    }),
    createElement: () => ({ style: {}, setAttribute: () => {} }),
    querySelectorAll: () => []
};

// Create a Sandbox that mimics a Browser Window
const context = {
    console,
    document: mockDom,
    window: {},
    global: {},
    Math,
    Object,
    Array,
    String,
    Number,
    Set,
    Map,
    parseInt,
    parseFloat,
    setTimeout
};
context.window = context;
vm.createContext(context);

/* ─── 2. SCRIPT LOADER (VM MODE) ─── */
function load(file) {
    const fullPath = path.resolve(__dirname, file);
    const code = fs.readFileSync(fullPath, 'utf8');
    // Run in the shared context so all files see each other's variables
    vm.runInContext(code, context);
    console.log(`✅ Loaded: ${file}`);
}

/* ─── 3. THE HEAVY LIFTING ─── */
console.log("🛠️  Initializing Forge Engine...");

try {
    load('js/traits.js');
    load('js/rng.js');
    load('js/renderer.js');
    load('js/generator.js');

    console.log("🎲 Minting Mech Ranger...");
    
    // Unlock and Generate using the VM context
    vm.runInContext('if(typeof AdminAuth !== "undefined") AdminAuth.verify();', context);
    const nft = vm.runInContext('generateNFT();', context);

    if (nft) {
        console.log(`✨ Forged: ${nft.name} [${nft.rarity.toUpperCase()}]`);
        
        // Call renderSVG from the VM context
        const svgData = vm.runInContext(`renderSVG(${JSON.stringify(nft)}, 800);`, context);
        
        const fileName = `forge_output_${nft.id}.svg`;
        fs.writeFileSync(fileName, svgData);
        
        console.log(`\n🚀 PHYSICAL OUTPUT CREATED: ${fileName}`);
    } else {
        console.error("❌ Generation failed.");
    }

} catch (err) {
    console.error("💥 Execution Error:", err.message);
}
