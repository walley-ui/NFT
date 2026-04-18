/* ═══════════════════════════════════════════════════════
   admin.js — Restricted Generation Controls (UPGRADED)
   ONLY FOR ADMIN (ix_prinx)
   Connects to: generator.js (AdminAuth)
   Logic: Phase-Aware Sync (700 WL Free | 9,300 Paid)
   ═══════════════════════════════════════════════════════ */
const sharp = require('sharp'); 

const Admin = {
    isAuthenticated: false,

    // 1. Unlock the Generator Engine
    verifyAdmin(secret) {
        // Simple session unlock for ix_prinx
        if (secret === "PRINX_FORGE_2026") { 
            this.isAuthenticated = true;
            if (typeof AdminAuth !== 'undefined') {
                AdminAuth.verify();
                toast("Admin Identity Verified", "success");
                return true;
            }
        }
        toast("Access Denied", "error");
        return false;
    },

    // 2. The Master 10k Forge (Async-Optimized)
    async generateFinalCollection() {
        if (!AdminAuth.isAuthorized) {
            toast("Forge is Locked. Verify Admin first.", "warn");
            return;
        }

        if (allNFTs.length > 0) {
            if (!confirm("Overwrite existing 10k batch? This cannot be undone.")) return;
        }

        resetGeneratorState();
        isGenerating = true;
        
        // ALIGNED: Ethereum Mainnet Deployment Intent
        toast("Initiating Master Forge for Ethereum Mainnet...", "info");

        // Loop optimized for Node.js event loop
        for (let i = 0; i < 10000; i++) {
            const nft = generateNFT();
            if (nft) {
                allNFTs.push(nft);
                
                // Determine Mint Type for DB Sync (700 Free vs Rest Paid)
                const mintType = (i < 700) ? "WL_FREE" : "PAID";
                
                // --- PHOTO MAKER START ---
                // Render at 1000px for high-fidelity Ethereum marketplace standards
                const svgMarkup = renderSVG(nft, 1000); 
                const buffer = Buffer.from(svgMarkup);
                
                await sharp(buffer)
                    .png()
                    .toFile(`./output/images/${nft.id}.png`)
                    .catch(err => console.error(`Image fail #${nft.id}:`, err)); 
                // --- PHOTO MAKER END ---
                                                                
                this.syncToSupabase(nft, mintType);
            }
            
            // Log progress every 1000 units
            if (i % 1000 === 0 && i > 0) {
                console.log(`Forged: ${i}/10000`);
                toast(`Progress: ${i} Mechs secured for Ethereum Snapshot`, "info");
                // Delay to prevent UI freeze
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        isGenerating = false;
        if (typeof renderGallery === 'function') renderGallery(); 
        
        toast("10,000 Mech Rangers Forged for Ethereum!", "success");
    },

    // UPGRADE: Refactored to include Mint Type (Free vs Paid)
    async syncToSupabase(nft, mintType) {
        if (typeof supabase === 'undefined') return;

        // ALIGNED: Tracking the 3-Tier Rarity + the 700 Free WL Logic
        const { error } = await supabase
            .from('mechs')
            .upsert({
                id: nft.id,
                name: `Mech Ranger #${nft.id}`,
                rarity: nft.rarity, // Mythic, Legendary, or Epic
                traits: nft.traits || nft.attributes, 
                image_url: `ipfs://SET_IMAGE_CID_HERE/${nft.id}.png`,
                metadata_url: `ipfs://SET_METADATA_CID_HERE/${nft.id}.json`,
                network: "Ethereum",
                mint_category: mintType // "WL_FREE" or "PAID"
            });

        if (error) console.error(`DB Sync Error for #${nft.id}:`, error.message);
    },

    // 3. Export for the Mint Site Bridge (Dual Merkle Path)
    exportSystemSnapshot() {
        if (!this.isAuthenticated) {
            toast("Export Locked", "error");
            return;
        }
        
        if (allNFTs.length < 10000) {
            if (!confirm("Collection is incomplete (below 10k). Export anyway?"));
        }

        // SYNCED: Aligned with the multi-phase logic (Free WL Root vs GTD Paid Root)
        if (typeof generateSnapshot === 'function') {
            generateSnapshot(); 
            toast("Dual Roots (Free WL & GTD Paid) ready for Deployment", "success");
        } else {
            // Fallback to legacy if points.js isn't global
            if (typeof exportMerkleTreeData === 'function') {
                exportMerkleTreeData();
                toast("Exporting via legacy bridge logic...", "warn");
            } else {
                toast("Export module missing!", "error");
            }
        }
    }
};

// Auto-init admin check
console.log("Admin Module Loaded. System awaiting verification for Phase-Based Ethereum deployment.");
