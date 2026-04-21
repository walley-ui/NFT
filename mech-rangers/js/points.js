/**
 * ═══════════════════════════════════════════════════════
 * points.js — Secure Snapshot & Merkle Engine (PRODUCTION)
 * Purpose: Locks 700 Free WL and 4300 GTD Paid into roots.
 * Logic: 
 * - ID <= 700: Phase 0 (Free WL) - Manual Team Entry
 * - ID 701 to 5000: Phase 1 (GTD Paid) - Public Recruits
 * - ID > 5000: Public FCFS (No Proof Required) - Remaining Supply
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
    console.log("\n📡 MECH RANGERS — DUAL ROOT GEN (700/4300 SPLIT)");
    console.log("══════════════════════════════════════════════");

    // FIX: Hard-coded Absolute Path to bypass process.cwd() mismatch
    const PUBLIC_DIR = '/workspaces/NFT/mech-rangers/public';
    console.log(`📍 FORCED TARGET DIRECTORY: ${PUBLIC_DIR}`);

    console.log("[1/4] Querying Recruits by Registration Order...");
    
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

    users.forEach((user) => {
        if (!user.wallet_address) return;
        const addr = user.wallet_address.toLowerCase().trim();
        if (seenWallets.has(addr)) return; 
        
        const checksumAddr = ethers.getAddress(addr);

        // LOGIC: Filter by explicit Database ID (1-700 WL | 701-5000 GTD)
        if (user.id <= 700) {
            wlList.push({
                wallet: checksumAddr,
                rank: user.id,
                allowance: 1 
            });
        } else if (user.id > 700 && user.id <= 5000) {
            gtdList.push({
                wallet: checksumAddr,
                rank: user.id,
                allowance: 2 
            });
        }
        // Users > 5000 are not added to trees as FCFS is open-access
        seenWallets.add(addr);
    });

    console.log(` -> Assigned ${wlList.length} to Phase 0 (Free WL)`);
    console.log(` -> Assigned ${gtdList.length} to Phase 1 (GTD Paid)`);

    // 4. GENERATE TREES
    console.log("[3/4] Building Dual Merkle Trees...");
    
    const wlLeaves = wlList.map(e => encodeLeaf(e.wallet));
    const gtdLeaves = gtdList.map(e => encodeLeaf(e.wallet));
    
    const wlTree = new MerkleTree(wlLeaves, keccak256, { sortPairs: true });
    const gtdTree = new MerkleTree(gtdLeaves, keccak256, { sortPairs: true });

    const wlRoot = wlTree.getHexRoot();
    const gtdRoot = gtdTree.getHexRoot();

    // 5. EXPORT RESULTS
    console.log("[4/4] Exporting JSON Snapshots...");
    
    const exportTree = (list, tree, filename) => {
        const output = {};
        list.forEach((entry) => {
            const leaf = encodeLeaf(entry.wallet);
            output[entry.wallet.toLowerCase()] = {
                checksummed: entry.wallet,
                rank: entry.rank,
                allowance: entry.allowance,
                proof: tree.getHexProof(leaf)
            };
        });
        
        if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
        
        const finalPath = path.join(PUBLIC_DIR, filename);
        fs.writeFileSync(finalPath, JSON.stringify(output, null, 2));
        console.log(` ✅ File Locked: ${finalPath}`);
    };

    exportTree(wlList, wlTree, 'wl-tree.json');
    exportTree(gtdList, gtdTree, 'gtd-tree.json');

    // Create a Certificate for Contract Deployment
    const certPath = '/workspaces/NFT/mech-rangers/merkle-roots.txt';
    const certContent = `
MECH RANGERS ETH MAINNET ROOTS
Generated: ${new Date().toISOString()}
------------------------------------------
PHASE 0 (FREE WL) ROOT  : ${wlRoot}
PHASE 1 (GTD PAID) ROOT : ${gtdRoot}
PHASE 2 (PUBLIC FCFS)  : OPEN ACCESS (TOTAL SUPPLY 10K)
------------------------------------------
`;
    fs.writeFileSync(certPath, certContent);

    console.log("\n SNAPSHOT SUCCESSFUL");
    console.log(`WL ROOT: ${wlRoot}`);
    console.log(`GTD ROOT: ${gtdRoot}`);
    console.log("════════════════════════════════════════\n");
}

generateSnapshot().catch(err => {
    console.error(" FATAL ERROR:", err);
    process.exit(1);
});
