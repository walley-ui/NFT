/**
 * ═══════════════════════════════════════════════════════
 * points.js — Secure Snapshot & Merkle Engine
 * Purpose: Run this to lock the whitelist and generate the root.
 * Integrates: Supabase Leaderboard + Solidity-Matched Merkle Tree
 * ═══════════════════════════════════════════════════════
 */

const { createClient } = require('@supabase/supabase-js');
const { MerkleTree }   = require('merkletreejs');
const { ethers }       = require('ethers');
const keccak256        = require('keccak256');
const fs               = require('fs');
const path             = require('path');
require('dotenv').config();

// 1. SECURE CONFIGURATION
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ CRITICAL ERROR: Missing .env credentials.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. TIER & ALLOWANCE LOGIC (Aligned with Contract & Generator)
const TIER_THRESHOLDS = [
    { tier: 'mythic',    minPoints: 350, allowance: 20 },
    { tier: 'legendary', minPoints: 100, allowance: 10 },
    { tier: 'epic',      minPoints: 50,  allowance: 5  },
    { tier: 'rare',      minPoints: 20,  allowance: 3  },
    { tier: 'uncommon',  minPoints: 5,   allowance: 2  },
    { tier: 'common',    minPoints: 1,   allowance: 1  }
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
            [wallet.toLowerCase(), maxAllowance]
        ).slice(2),
        'hex'
    );
}

async function generateSnapshot() {
    console.log("📸 MECH RANGERS — SNAPSHOT ENGINE START");
    console.log("══════");

    // Pull from Supabase (assuming table 'referrals' with columns 'wallet_address' and 'points')
    console.log("[1/4] Querying Supabase Leaderboard...");
    const { data: users, error } = await supabase
        .from('referrals')
        .select('wallet_address, points, twitter_handle')
        .order('points', { ascending: false });

    if (error) {
        console.error("❌ Database Error:", error.message);
        return;
    }

    console.log(`[2/4] Processing ${users.length} unique wallets...`);

    const whitelist = [];
    const tierCounts = { mythic: 0, legendary: 0, epic: 0, rare: 0, uncommon: 0, common: 0 };

    // Map users to Whitelist objects
    users.forEach(user => {
        const tierData = getTierData(user.points);
        if (tierData.allowance > 0) {
            whitelist.push({
                wallet: user.wallet_address.toLowerCase(),
                allowance: tierData.allowance,
                tier: tierData.tier,
                points: user.points,
                twitter: user.twitter_handle || 'unknown'
            });
            tierCounts[tierData.tier]++;
        }
    });

    // 4. GENERATE TREE
    console.log("[3/4] Building Merkle Tree...");
    const leaves = whitelist.map(entry => encodeLeaf(entry.wallet, entry.allowance));
    const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const root = tree.getHexRoot();

    // 5. EXPORT RESULTS
    console.log("[4/4] Exporting tree.json & root certificate...");
    const treeOutput = {};
    whitelist.forEach((entry, index) => {
        treeOutput[entry.wallet] = {
            tier: entry.tier,
            allowance: entry.allowance,
            points: entry.points,
            twitter: entry.twitter,
            proof: tree.getHexProof(leaves[index])
        };
    });

    // Write Files
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

    fs.writeFileSync(path.join(publicDir, 'tree.json'), JSON.stringify(treeOutput, null, 2));
    
    const certPath = path.join(__dirname, 'merkle-root.txt');
    const certContent = `
MECH RANGERS SNAPSHOT CERTIFICATE
Generated: ${new Date().toISOString()}
------------------------------------------
FINAL MERKLE ROOT: ${root}
------------------------------------------
TIER BREAKDOWN:
Legendary: ${tierCounts.legendary}
Epic:      ${tierCounts.epic}
Rare:      ${tierCounts.rare}
Uncommon:  ${tierCounts.uncommon}
Common:    ${tierCounts.common}
TOTAL:     ${whitelist.length} Wallets
------------------------------------------
ACTION: Paste the ROOT into setMerkleRoot("${root}") on Base Mainnet.
`;
    fs.writeFileSync(certPath, certContent);

    console.log("\n✅ SNAPSHOT SUCCESSFUL");
    console.log(`ROOT: ${root}`);
    console.log(`Output: public/tree.json`);
    console.log("════════════════════════════════════════");
}

generateSnapshot().catch(err => {
    console.error("🔥 FATAL ERROR:", err);
    process.exit(1);
});
