import fs from 'fs';
import path from 'path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const bridgeFile = path.join(root, 'mech-rangers', 'js', 'bridge.js');

console.log("\n🛰️  VITE ENVIRONMENT ANALYZER");
console.log("════════════════════════════════════════");

if (fs.existsSync(publicDir)) {
    console.log("✅ Public Directory Found.");
    const files = fs.readdirSync(publicDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    console.log("📂 Files in Public:");
    jsonFiles.forEach(f => console.log(`   - ${f}  --> Serves at: /${f}`));
    
    if (jsonFiles.includes('wl-tree.json')) {
        console.log("\n📍 RESULT: Use absolute root paths.");
        console.log("   fetch('/wl-tree.json') is the correct Vite syntax.");
    }
} else {
    console.log("❌ Public Directory NOT found at root.");
}
console.log("════════════════════════════════════════\n");
