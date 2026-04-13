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
            if (nft) allNFTs.push(nft);
            
            // Log progress every 1000 units
            if (i % 1000 === 0 && i > 0) {
                console.log(`Forged: ${i}/10000`);
            }
        }

        isGenerating = false;
        if (typeof renderGallery === 'function') renderGallery(); 
        
        toast("10,000 Mech Rangers Forged Successfully!", "success");
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
