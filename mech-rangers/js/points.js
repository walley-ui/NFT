/**
 * ═══════════════════════════════════════════════════════
 * points.js — Secure Snapshot & Merkle Engine (UPGRADED)
 * Purpose: Locks the 700 Free WL and 9,300 GTD Paid into roots.
 * Logic: Sequential Sort (First 700 = WL_ROOT | Rest = GTD_ROOT)
 * ═══════════════════════════════════════════════════════ */

import { createClient } from '@supabase/supabase-js';
import { MerkleTree } from 'merkletreejs';
import { ethers } from 'ethers';
import keccak256 from 'keccak256';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// ── UPGRADED ENV LOADER ────────────────────────────────
const envPath = path.resolve(process.cwd(), 'mech-rangers', '.env');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ CRITICAL ERROR: Missing .env credentials.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * LEAF ENCODER (SOLIDITY COMPATIBLE)
 * keccak256(abi.encodePacked(address))
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
    console.log("\n📡 MECH RANGERS — DUAL ROOT GEN (700/9300 SPLIT)");
    console.log("══════════════════════════════════════════════");

    console.log("[1/4] Querying Recruits by Registration Order...");
    
    // Fetching and ordering by ID (First come, first served)
    const { data: users, error } = await supabase
        .from('recruits')
        .select('id, wallet_address, registered_at')
        .order('id', { ascending: true });

    if (error) {
        console.error("❌ Database Error:", error.message);
        return;
    }

    console.log(`[2/4] Processing ${users.length} Operatives...`);

    const wlList = [];
    const gtdList = [];
    const seenWallets = new Set(); 

    users.forEach((user, index) => {
        if (!user.wallet_address) return;
        const addr = user.wallet_address.toLowerCase();
        if (seenWallets.has(addr)) return; 
        
        const entry = {
            wallet: ethers.getAddress(addr),
            rank: user.id
        };

        // SEQUENTIAL LOGIC: First 700 get the WL_ROOT (Free Mint)
        // Everything after 700 gets GTD_ROOT (Paid Mint)
        if (wlList.length < 700) {
            wlList.push(entry);
        } else {
            gtdList.push(entry);
        }
        seenWallets.add(addr);
    });

    console.log(` -> Assigned ${wlList.length} to Phase 0 (Free WL)`);
    console.log(` -> Assigned ${gtdList.length} to Phase 1 (GTD Paid)`);

    // 4. GENERATE TREES
    console.log("[3/4] Building Dual Merkle Trees...");
    
    const wlLeaves = wlList.map(e => encodeLeaf(e.wallet));
    const gtdLeaves = gtdList.map(e => encodeLeaf(e.wallet));
    
    // sortPairs: true is mandatory for OpenZeppelin MerkleProof.sol compatibility
    const wlTree = new MerkleTree(wlLeaves, keccak256, { sortPairs: true });
    const gtdTree = new MerkleTree(gtdLeaves, keccak256, { sortPairs: true });

    const wlRoot = wlTree.getHexRoot();
    const gtdRoot = gtdTree.getHexRoot();

    // 5. EXPORT RESULTS
    console.log("[4/4] Exporting JSON Snapshots to /public...");
    
    const exportTree = (list, tree, filename) => {
        const output = {};
        list.forEach((entry) => {
            // Robust check: re-encode leaf per entry to ensure proof integrity
            const leaf = encodeLeaf(entry.wallet);
            output[entry.wallet.toLowerCase()] = {
                checksummed: entry.wallet,
                rank: entry.rank,
                proof: tree.getHexProof(leaf)
            };
        });
        
        const publicDir = path.join(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
        fs.writeFileSync(path.join(publicDir, filename), JSON.stringify(output, null, 2));
        console.log(` ✅ Generated: ${filename}`);
    };

    exportTree(wlList, wlTree, 'wl-tree.json');
    exportTree(gtdList, gtdTree, 'gtd-tree.json');

    // Create a Certificate for Contract Deployment
    const certPath = path.join(process.cwd(), 'merkle-roots.txt');
    const certContent = `
MECH RANGERS ETH MAINNET ROOTS
Generated: ${new Date().toISOString()}
------------------------------------------
PHASE 0 (FREE WL) ROOT: ${wlRoot}
PHASE 1 (GTD PAID) ROOT: ${gtdRoot}
------------------------------------------
INSTRUCTIONS: 
1. Open MechRangers.sol
2. Update the Merkle Root variables:
   _wlRoot = "${wlRoot}";
   _gtdRoot = "${gtdRoot}";
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
