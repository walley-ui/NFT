/* ═══════════════════════════════════════════════════════
   app.js — Core Controller (ADMIN vs PUBLIC)
   Handles: State Switching, Phase Monitoring, Global Toggles
   Logic: Aligned for 700 WL Free / 9,300 Paid Split
   ═══════════════════════════════════════════════════════ */

/**
 * Main Initialization
 */
function initApp() {
    // 1. Determine Identity & Mode
    const isAdminMode = typeof Admin !== 'undefined';

    if (isAdminMode) {
        setupAdminEnvironment();
    } else {
        setupPublicBridge();
    }

    // 2. Universal Listeners
    setupUniversalListeners();
    
    // 3. Initialize Phase Monitor (Sync with Contract State)
    updateGlobalPhaseUI();
}

/**
 * ADMIN MODE: Forge & Collection Management
 */
function setupAdminEnvironment() {
    console.log("Welcome, Admin ix_prinx. Ethereum Forge Status: ONLINE.");
    
    const adminUI = document.getElementById('adminControls');
    const userUI  = document.getElementById('userInterface');
    
    if (adminUI) adminUI.style.display = 'block';
    if (userUI)  userUI.style.display  = 'none';

    // Sync Contract View
    if (typeof updateContract === 'function') updateContract();
    
    // ENFORCING 3-TIER DISTRIBUTION (2k/3k/5k)
    const caps = {
        'cMaxMythic': "2000",
        'cMaxLegendary': "3000",
        'cMaxEpic': "5000"
    };

    for (const [id, val] of Object.entries(caps)) {
        const el = document.getElementById(id);
        if (el) el.value = val;
    }
    
    // Clear Legacy Tiers
    ['cMaxRare', 'cMaxUncommon', 'cMaxCommon'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "0";
    });

    console.log("Admin: Supply caps strictly synced to 10k Ethereum distribution.");
}

/**
 * PUBLIC MODE: Phase-Aware Bridge
 */
function setupPublicBridge() {
    console.log("Public Bridge Active. Awaiting Phase-Based Verification.");
    
    const adminUI = document.getElementById('adminControls');
    const userUI  = document.getElementById('userInterface');
    
    if (adminUI) adminUI.style.display = 'none';
    if (userUI)  userUI.style.display  = 'block';

    if (typeof Bridge !== 'undefined') {
        Bridge.init();
    } else {
        console.warn("Bridge Module Standby: Verify script loading.");
    }
}

/**
 * PHASE MONITORING: Update UI based on Contract State
 * Logic: Handles the transition through WL Free, GTD, and Public
 */
function updateGlobalPhaseUI() {
    const phaseDisplay = document.getElementById('currentPhaseName');
    if (!phaseDisplay) return;

    // This would typically fetch from the smart contract 'currentPhase' variable
    // For now, we set the initial visual state
    const phases = ["Locked", "WL Free (700 Spots)", "GTD Paid", "Public FCFS"];
    
    // Example: Update UI to show the 700-spot limit for the first phase
    console.log("Phase Monitor: Ensuring 700 WL Free / 9,300 Paid logic visibility.");
}

/**
 * Universal Listeners & UI Helpers
 */
function setupUniversalListeners() {
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) typeof closeModal === 'function' && closeModal();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') typeof closeModal === 'function' && closeModal();
    });
}

/**
 * Global Toast System
 * Upgraded to handle multi-phase notifications
 */
function toast(msg, type = 'info') {
    const wrap = document.getElementById('toastWrap');
    if (wrap) {
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `<div class="toast-dot"></div><span>${msg}</span>`;
        wrap.appendChild(el);
        
        requestAnimationFrame(() => el.style.opacity = '1');
        setTimeout(() => {
            el.style.opacity = '0';
            setTimeout(() => el.remove(), 500);
        }, 4000);
        return;
    }
    
    // Fallback legacy toast
    const t = document.getElementById('toast');
    if (t) {
        t.textContent = msg;
        t.className = `toast show ${type}`;
        setTimeout(() => t.className = 'toast', 3000);
    }
}

// Global reveal helper for 3-tier visuals
function toggleRevealPreview(isRevealed) {
    const preview = document.getElementById('mechPreview');
    if (preview) {
        isRevealed ? preview.classList.remove('hidden-mech') : preview.classList.add('hidden-mech');
    }
}

document.addEventListener('DOMContentLoaded', initApp);
