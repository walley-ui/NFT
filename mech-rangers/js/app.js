/* ═══════════════════════════════════════════════════════
   app.js — Core Controller (ADMIN vs PUBLIC)
   Handles: State Switching, Initialization, Global Toggles
   ═══════════════════════════════════════════════════════ */

/**
 * Main Initialization
 * Directs ix_prinx to Admin Forge or the Public to the Bridge
 */
function initApp() {
    // 1. Determine Identity
    // Logic: If admin.js is loaded and authenticated, enable Forge
    const isAdminMode = typeof Admin !== 'undefined';

    if (isAdminMode) {
        setupAdminEnvironment();
    } else {
        setupPublicBridge();
    }

    // 2. Global Event Listeners (Universal)
    setupUniversalListeners();
}

/**
 * ADMIN MODE: Forge & Collection Management
 */
function setupAdminEnvironment() {
    console.log("Welcome, Admin ix_prinx. Base Forge Status: ONLINE.");
    
    // UI Toggles
    const adminUI = document.getElementById('adminControls');
    const userUI  = document.getElementById('userInterface');
    
    if (adminUI) adminUI.style.display = 'block';
    if (userUI)  userUI.style.display  = 'none';

    // Initialize Admin-only components
    if (typeof updateContract === 'function') updateContract();
    
    // LEVEL 0 SYNC CHECK: Ensure rarity caps are ready for the 10k run
    const commonCap = document.getElementById('cMaxCommon');
    if (commonCap && commonCap.value !== "3980") {
        console.warn("Syncing Common Cap to 3980 for 10k total.");
        commonCap.value = "3980";
    }
    
    // Upgrade: Auto-trigger verification prompt for ix_prinx if not authenticated
    if (typeof Admin !== 'undefined' && !Admin.isAuthenticated) {
        console.log("System standby: Awaiting Admin Secret.");
    }
}

/**
 * PUBLIC MODE: Verification & Claiming
 */
function setupPublicBridge() {
    console.log("Public Bridge Mode Active. Awaiting Base Verification.");
    
    const adminUI = document.getElementById('adminControls');
    const userUI  = document.getElementById('userInterface');
    
    if (adminUI) adminUI.style.display = 'none';
    if (userUI)  userUI.style.display  = 'block';

    // Initialize the Post-Office logic (bridge.js)
    if (typeof Bridge !== 'undefined') {
        Bridge.init();
    } else {
        console.error("Bridge Module Missing: Users cannot verify claims.");
    }
}

/**
 * Common Listeners (Modals, Toasts, etc.)
 */
function setupUniversalListeners() {
    // Overlay click to close modals
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    // Escape key handling
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// Global Toast System (Used by Admin & User actions)
// Upgrade: Integrated fallback for dynamic ui.js toast system
function toast(msg, type = 'info') {
    const wrap = document.getElementById('toastWrap');
    if (wrap) {
        // Use the advanced dynamic toast system from ui.js if available
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `<div class="toast-dot"></div>${msg}`;
        wrap.appendChild(el);
        requestAnimationFrame(() => el.style.opacity = '1');
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 500);
        }, 3500);
        return;
    }

    const t = document.getElementById('toast');
    if (!t) return;
    
    t.textContent = msg;
    t.className = `toast show ${type}`;
    
    setTimeout(() => {
        t.className = 'toast';
    }, 3000);
}

// Start the app when the DOM is fully ready
document.addEventListener('DOMContentLoaded', initApp);
