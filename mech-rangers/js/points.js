/**
 * ═══════════════════════════════════════════════════════
 * points.js — Secure Snapshot & Merkle Engine (ESM)
 * Purpose: Run this to lock the whitelist and generate the root.
 * Integrates: Supabase Leaderboard + Solidity-Matched Merkle Tree
 * ═══════════════════════════════════════════════════════ */

import { createClient } from '@supabase/supabase-js';
import { MerkleTree } from 'merkletreejs';
import { ethers } from 'ethers';
import keccak256 from 'keccak256';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// ── UPGRADED ENV LOADER (TARGETED PATH) ────────────────
// Explicitly pointing to the mech-rangers/.env file
const envPath = path.resolve(process.cwd(), 'mech-rangers', '.env');
dotenv.config({ path: envPath });

// 1. SECURE CONFIGURATION
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

// Support both standard and VITE-prefixed service keys
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ CRITICAL ERROR: Missing .env credentials.");
    console.log("Diagnostic Info:");
    console.log(" - Expected Env Path:", envPath);
    console.log(" - Current Work Dir:", process.cwd());
    console.log(" - URL Found:", SUPABASE_URL ? "YES" : "NO");
    console.log(" - KEY Found:", SUPABASE_KEY ? "YES" : "NO");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. TIER & ALLOWANCE LOGIC (Aligned with Contract & Level 0 Generator)
const TIER_THRESHOLDS = [
    { tier: 'mythic',    minPoints: 500, allowance: 5 },  
    { tier: 'legendary', minPoints: 250, allowance: 3 }, 
    { tier: 'epic',      minPoints: 100, allowance: 2 },  
    { tier: 'rare',      minPoints: 50,  allowance: 1 },  
    { tier: 'uncommon',  minPoints: 10,  allowance: 1 },  
    { tier: 'common',    minPoints: 1,   allowance: 1 }
];

function getTierData(points) {
    for (const t of TIER_THRESHOLDS) {
        if (points >= t.minPoints) return t;
    }
    return { tier: 'unranked', allowance: 0 };
}

/**
 * 3. LEAF ENCODER (STRICT ALIGNMENT)
 * Matches Solidity: keccak256(abi.encodePacked(address, uint256))
 */
function encodeLeaf(wallet, maxAllowance) {
    return Buffer.from(
        ethers.solidityPackedKeccak256(
            ['address', 'uint256'],
            [ethers.getAddress(wallet), maxAllowance]
        ).slice(2),
        'hex'
    );
}

async function generateSnapshot() {
    console.log("\n📸 MECH RANGERS — SNAPSHOT ENGINE START");
    console.log("════════════════════════════════════════");

    // Pull from both potential sources to ensure no data loss
    console.log("[1/4] Querying Supabase Resistance Records...");
    const { data: users, error } = await supabase
        .from('recruits')
        .select('wallet_address, twitter_handle, referred_by');

    // Also pull points if you have a separate leaderboard/referrals view
    const { data: pointsData } = await supabase
        .from('referrals')
        .select('referrer_wallet, count');

    if (error) {
        console.error("❌ Database Error:", error.message);
        return;
    }

    console.log(`[2/4] Processing ${users.length} Operatives...`);

    const whitelist = [];
    const tierCounts = { mythic: 0, legendary: 0, epic: 0, rare: 0, uncommon: 0, common: 0 };
    const seenWallets = new Set(); 

    users.forEach(user => {
        const addr = user.wallet_address.toLowerCase();
        if (seenWallets.has(addr)) return; 
        
        // Calculate points based on referrals found in the referrals table
        const userPoints = pointsData?.find(p => p.referrer_wallet.toLowerCase() === addr)?.count || 0;
        
        // Logic: Even if 0 points, they are 'common' if they registered (base allowance 1)
        const finalPoints = Math.max(userPoints, 1); 
        const tierData = getTierData(finalPoints);
        
        if (tierData.allowance > 0) {
            seenWallets.add(addr);
            whitelist.push({
                wallet: ethers.getAddress(addr), // Checksummed for safety
                allowance: tierData.allowance,
                tier: tierData.tier,
                points: finalPoints,
                twitter: user.twitter_handle || 'unknown'
            });
            tierCounts[tierData.tier]++;
        }
    });

    // 4. GENERATE TREE
    console.log("[3/4] Building Merkle Tree (Keccak256)...");
    const leaves = whitelist.map(entry => encodeLeaf(entry.wallet, entry.allowance));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    // 5. EXPORT RESULTS
    console.log("[4/4] Exporting tree.json & root certificate...");
    const treeOutput = {};
    whitelist.forEach((entry, index) => {
        treeOutput[entry.wallet.toLowerCase()] = {
            checksummed: entry.wallet,
            tier: entry.tier,
            allowance: entry.allowance,
            points: entry.points,
            twitter: entry.twitter,
            proof: tree.getHexProof(leaves[index])
        };
    });

    // Ensure directory exists using process.cwd() for mobile/terminal environments
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    // Save the Tree for the Bridge.js to read
    fs.writeFileSync(path.join(publicDir, 'tree.json'), JSON.stringify(treeOutput, null, 2));
    
    // Save detailed logs for ix_prinx
    fs.writeFileSync(path.join(publicDir, 'snapshot-logs.json'), JSON.stringify(whitelist, null, 2));

    const certPath = path.join(process.cwd(), 'merkle-root.txt');
    const certContent = `
MECH RANGERS SNAPSHOT CERTIFICATE
Generated: ${new Date().toISOString()}
------------------------------------------
FINAL MERKLE ROOT: ${root}
------------------------------------------
TIER BREAKDOWN:
Mythic:    ${tierCounts.mythic}
Legendary: ${tierCounts.legendary}
Epic:      ${tierCounts.epic}
Rare:      ${tierCounts.rare}
Uncommon:  ${tierCounts.uncommon}
Common:    ${tierCounts.common}
TOTAL:     ${whitelist.length} Wallets
------------------------------------------
ACTION: Paste the ROOT into your contract's setMerkleRoot function.
`;
    fs.writeFileSync(certPath, certContent);

    console.log("\n SNAPSHOT SUCCESSFUL");
    console.log(`ROOT: ${root}`);
    console.log(`Verified Wallets: ${whitelist.length}`);
    console.log("════════════════════════════════════════\n");
}

generateSnapshot().catch(err => {
    console.error("🔥 FATAL ERROR:", err);
    process.exit(1);
});
