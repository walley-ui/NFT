/* ═══════════════════════════════════════════════════════
   points.js — Secure Supabase Snapshot Engine
   ═══════════════════════════════════════════════════════ */
require('dotenv').config(); // Load environment variables
const { createClient } = require('@supabase/supabase-js');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');

// 1. SECURE CONFIGURATION
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("CRITICAL ERROR: Missing .env credentials. Snapshot aborted.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. TIER LOGIC (Same as Contract & UI)
function getAllowance(points) {
    if (points >= 100) return 10; // Legendary
    if (points >= 50)  return 5;  // Epic
    if (points >= 20)  return 3;  // Rare
    if (points >= 5)   return 2;  // Uncommon
    return 1;                     // Common / Parasite
}

async function generateSnapshot() {
    console.log("--- STARTING SECURE SNAPSHOT ---");

    const { data: users, error } = await supabase
        .from('referrals')
        .select('wallet_address, points');

    if (error) {
        console.error("Database Error:", error.message);
        return;
    }

    console.log(`Processing ${users.length} unique wallets...`);

    // 3. LEAF GENERATION (Matches Solidity ABI)
    const leaves = users.map(user => {
        const allowance = getAllowance(user.points);
        const wallet = user.wallet_address.toLowerCase().replace('0x', '');
        
        return keccak256(
            Buffer.concat([
                Buffer.from(wallet, 'hex'),
                Buffer.from(allowance.toString(16).padStart(64, '0'), 'hex')
            ])
        );
    });

    // 4. MERKLE TREE CONSTRUCTION
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    // 5. EXPORT FOR FRONTEND (Site B)
    const treeData = {};
    users.forEach((user, index) => {
        const allowance = getAllowance(user.points);
        treeData[user.wallet_address.toLowerCase()] = {
            allowance: allowance,
            proof: tree.getHexProof(leaves[index])
        };
    });

    fs.writeFileSync('./tree.json', JSON.stringify(treeData, null, 2));

    console.log("\n--- SNAPSHOT SUCCESSFUL ---");
    console.log("ROOT FOR CONTRACT:", root);
    console.log("tree.json generated for Site B.");
}

generateSnapshot();
