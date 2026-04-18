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
const envPath = path.resolve(process.cwd(), 'mech-rangers', '.env');
dotenv.config({ path: envPath });

// 1. SECURE CONFIGURATION
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ CRITICAL ERROR: Missing .env credentials.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. TIER & ALLOWANCE LOGIC (ALIGNED TO 10K / 3-TIER)
// UPGRADE: All eligible users get a flat allowance of 2 for the ETH mint.
const TIER_THRESHOLDS = [
    { tier: 'mythic',    minPoints: 0, allowance: 2 },  
    { tier: 'legendary', minPoints: 0, allowance: 2 }, 
    { tier: 'epic',      minPoints: 0, allowance: 2 }
];

function getTierData(points) {
    // Referrals are for awareness only; everyone on the list is approved for 2.
    return { tier: 'verified', allowance: 2 };
}

/**
 * 3. LEAF ENCODER (STRICT ALIGNMENT)
 * Matches Solidity: keccak256(abi.encodePacked(address))
 * Note: Removed maxAllowance from leaf to match simplified ETH contract.
 */
function encodeLeaf(wallet) {
    return Buffer.from(
        ethers.solidityPackedKeccak256(
            ['address'],
            [ethers.getAddress(wallet)]
        ).slice(2),
        'hex'
    );
}

async function generateSnapshot() {
    console.log("\n📡 CONNECTION DIAGNOSTIC");
    console.log(`Target URL: ${SUPABASE_URL.substring(0, 18)}...`);
    console.log("════════════════════════════════════════");

    console.log("\n📸 MECH RANGERS — DUAL SNAPSHOT ENGINE START");
    console.log("════════════════════════════════════════");

    console.log("[1/4] Querying Operative Database...");
    
    // Fetching from recruits table
    const { data: users, error } = await supabase
        .from('recruits')
        .select('wallet_address, twitter_handle, referred_by, phase_type'); 

    if (error) {
        console.error("❌ Database Error:", error.message);
        return;
    }

    console.log(`[2/4] Sorting ${users.length} Operatives into WL and GTD...`);

    const wlList = [];
    const gtdList = [];
    const seenWallets = new Set(); 

    users.forEach(user => {
        if (!user.wallet_address) return;
        const addr = user.wallet_address.toLowerCase();
        if (seenWallets.has(addr)) return; 
        
        const entry = {
            wallet: ethers.getAddress(addr),
            allowance: 2,
            twitter: user.twitter_handle || 'unknown'
        };

        // phase_type logic determines which tree they enter
        if (user.phase_type === 'WL') {
            wlList.push(entry);
        } else {
            gtdList.push(entry); // Default to GTD (4,000 slots)
        }
        seenWallets.add(addr);
    });

    // 4. GENERATE TREES
    console.log("[3/4] Building Dual Merkle Trees (WL & GTD)...");
    
    const wlLeaves = wlList.map(e => encodeLeaf(e.wallet));
    const gtdLeaves = gtdList.map(e => encodeLeaf(e.wallet));
    
    const wlTree = new MerkleTree(wlLeaves, keccak256, { sortPairs: true });
    const gtdTree = new MerkleTree(gtdLeaves, keccak256, { sortPairs: true });

    const wlRoot = wlTree.getHexRoot();
    const gtdRoot = gtdTree.getHexRoot();

    // 5. EXPORT RESULTS
    console.log("[4/4] Exporting wl-tree.json & gtd-tree.json...");
    
    const exportTree = (list, tree, leaves, filename) => {
        const output = {};
        list.forEach((entry, index) => {
            output[entry.wallet.toLowerCase()] = {
                checksummed: entry.wallet,
                allowance: 2,
                proof: tree.getHexProof(leaves[index])
            };
        });
        
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        fs.writeFileSync(path.join(publicDir, filename), JSON.stringify(output, null, 2));
    };

    exportTree(wlList, wlTree, wlLeaves, 'wl-tree.json');
    exportTree(gtdList, gtdTree, gtdLeaves, 'gtd-tree.json');

    const certPath = path.join(process.cwd(), 'merkle-roots.txt');
    const certContent = `
MECH RANGERS ETH MAINNET SNAPSHOT
Generated: ${new Date().toISOString()}
------------------------------------------
PHASE 1 (WL) ROOT:  ${wlRoot} (${wlList.length} wallets)
PHASE 2 (GTD) ROOT: ${gtdRoot} (${gtdList.length} wallets)
------------------------------------------
ACTION: Use setRoots("${wlRoot}", "${gtdRoot}") in MechRangers.sol
`;
    fs.writeFileSync(certPath, certContent);

    console.log("\n SNAPSHOT SUCCESSFUL");
    console.log(`WL ROOT: ${wlRoot}`);
    console.log(`GTD ROOT: ${gtdRoot}`);
    console.log("════════════════════════════════════════\n");
}

generateSnapshot().catch(err => {
    console.error("🔥 FATAL ERROR:", err);
    process.exit(1);
});
