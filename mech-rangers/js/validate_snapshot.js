import fs from 'fs';
import path from 'path';

console.log("\n🔍 MECH RANGERS — FINAL DATA AUDIT");
console.log("════════════════════════════════════════");

const possiblePaths = [
    path.join(process.cwd(), 'tree.json'),
    path.join(process.cwd(), 'mech-rangers', 'tree.json'),
    path.join(process.cwd(), 'mech-rangers', 'public', 'tree.json'),
    path.join(process.cwd(), 'public', 'tree.json')
];

const TEST_WALLETS_PATH = path.join(process.cwd(), 'test_wallets.json');

async function runAudit() {
    let treePath = null;
    
    // Find the file
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            treePath = p;
            break;
        }
    }

    if (!treePath) {
        console.error("❌ ERROR: tree.json is missing from ALL expected locations.");
        console.log("Search locations checked:");
        possiblePaths.forEach(p => console.log(`  - ${p}`));
        process.exit(1);
    }

    console.log(`📍 FOUND DATA AT: ${treePath}`);
    
    const tree = JSON.parse(fs.readFileSync(treePath, 'utf8'));
    const testWallets = JSON.parse(fs.readFileSync(TEST_WALLETS_PATH, 'utf8'));

    console.log(`📊 Snapshot Size: ${Object.keys(tree).length} wallets`);
    
    let passes = 0;
    testWallets.forEach(persona => {
        const inputWallet = persona.wallet.toLowerCase();
        if (tree[inputWallet]) {
            console.log(`✅ MATCH: [${persona.role}] ${inputWallet}`);
            passes++;
        } else {
            console.log(`❌ MISMATCH: [${persona.role}] ${inputWallet}`);
        }
    });

    console.log(`\n🏁 AUDIT COMPLETE: ${passes}/${testWallets.length} Passed.`);
    
    if (passes === testWallets.length) {
        console.log("\n💡 SOLUTION FOR BRIDGE.JS:");
        console.log(`Since your file is at: ${treePath}`);
        console.log("Ensure your Bridge CONFIG uses:");
        console.log(`snapshotUrl: '/tree.json' (if in public) or './tree.json' (if in root)`);
    }
}

runAudit();
