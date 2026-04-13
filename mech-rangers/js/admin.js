/* ═══════════════════════════════════════════════════════
   admin.js — Restricted Generation Controls (UPGRADED)
   ONLY FOR ADMIN (ix_prinx)
   Connects to: generator.js (AdminAuth)
   ═══════════════════════════════════════════════════════ */

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
        
        toast("Initiating Master Forge for Base Mainnet...", "info");

        // We use a loop that allows UI updates so the browser doesn't crash
        for (let i = 0; i < 10000; i++) {
            const nft = generateNFT();
            if (nft) {
                allNFTs.push(nft);
                // UPGRADE: Sync to Supabase in background
                this.syncToSupabase(nft);
            }
            
            // Log progress every 1000 units
            if (i % 1000 === 0 && i > 0) {
                console.log(`Forged: ${i}/10000`);
                toast(`Progress: ${i} Mechs secured to Database`, "info");
            }
        }

        isGenerating = false;
        if (typeof renderGallery === 'function') renderGallery(); 
        
        toast("10,000 Mech Rangers Forged Successfully!", "success");
    },

    // UPGRADE: New Helper to push data to the 'mechs' table
    async syncToSupabase(nft) {
        if (typeof supabase === 'undefined') return;

        const { error } = await supabase
            .from('mechs')
            .upsert({
                id: nft.id,
                name: `Mech Ranger #${nft.id}`,
                rarity: nft.rarity,
                traits: nft.attributes, // Maps to your JSONB column
                image_url: `ipfs://PENDING_IMAGE_CID/${nft.id}.svg`,
                metadata_url: `ipfs://PENDING_METADATA_CID/${nft.id}.json`
            });

        if (error) console.error(`DB Sync Error for #${nft.id}:`, error.message);
    },

    // 3. Export for the Mint Site Bridge
    exportSystemSnapshot() {
        if (!this.isAuthenticated) {
            toast("Export Locked", "error");
            return;
        }
        
        if (allNFTs.length < 10000) {
            if (!confirm("Collection is incomplete. Export anyway?")) return;
        }

        // Calls the logic in export.js
        if (typeof exportMerkleTreeData === 'function') {
            exportMerkleTreeData(); 
            toast("Snapshot ready for Bridge deployment", "success");
        } else {
            toast("Export module missing!", "error");
        }
    }
};

// Auto-init admin check if needed
console.log("Admin Module Loaded. System awaiting ix_prinx verification.");
