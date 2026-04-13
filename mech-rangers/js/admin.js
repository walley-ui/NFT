/* ═══════════════════════════════════════════════════════
   admin.js — Restricted Generation Controls
   ONLY FOR ADMIN (ix_prinx)
   ═══════════════════════════════════════════════════════ */

const Admin = {
    isAuthenticated: false,

    // The Master 10k Forge
    generateFinalCollection() {
        if (allNFTs.length > 0) {
            if (!confirm("Overwrite existing 10k batch?")) return;
        }

        resetGeneratorState();
        isGenerating = true;
        
        toast("Forging 10,000 Units on Base...", "info");

        // Generate the full set
        for (let i = 0; i < 10000; i++) {
            const nft = generateNFT();
            if (nft) allNFTs.push(nft);
        }

        isGenerating = false;
        renderGallery(); // Update your admin view
        toast("10,000 Mech Rangers Forged Successfully!", "success");
    },

    // Export for the Mint Site Bridge
    exportSystemSnapshot() {
        exportMerkleTreeData(); // Uses the upgraded export.js logic
        toast("Snapshot ready for Bridge deployment", "success");
    }
};
