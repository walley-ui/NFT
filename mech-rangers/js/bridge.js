/* ═══════════════════════════════════════════════════════
     bridge.js — Phase 2: User Verification & Claiming
     Upgraded for X-Referrals + Roasting + Base Mainnet
     Depends on: modal.js, app.js, export.js
═══════════════════════════════════════════════════════ */

/* ── CONFIG ─────────────────────────────────────────── */
const BRIDGE_CONFIG = {
  contractAddress: 'UPDATE TO MY ACTUAL CONTRACT ADDRESS', 
  mintPriceEth: '0.05',
  chainId: 8453, 
  chainName: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  openSeaBase: 'https://opensea.io/collection/mech-rangers-official', 
  snapshotUrl: './mint-snapshot.json', 
  xAccount: 'MechRangersNFT'
};

/* ── STATE ──────────────────────────────────────────── */
let _userWallet = null;
let _assignedNFT = null;
let _snapshot = null;

/* ── INIT (HITS THE BRIDGE ROOT) ───────────────────── */
async function initBridge() {
  const root = document.getElementById('bridge-content');
  if (root) root.innerHTML = `<div id="bridgeRoot" class="wrap" style="margin-top:100px; max-width:500px"></div>`;
  
  try {
    const res = await fetch(BRIDGE_CONFIG.snapshotUrl);
    if (!res.ok) throw new Error("Snapshot not found");
    _snapshot = await res.json();
    console.log("Survivor Snapshot Loaded. Total Units:", _snapshot.generatedCount);
  } catch (err) {
    console.warn("⛔ No snapshot found. Admin must forge collection first.");
  }
  renderBridgeUI();
}

/* ── VERIFY ADDRESS (THE SEARCH) ────────────────────── */
async function bridgeVerifyAddress() {
  const input = document.getElementById('bridgeWalletInput');
  const address = input?.value.trim().toLowerCase();

  if (!address || !address.startsWith('0x')) {
    bridgeShowStatus('warn', 'Enter a valid 0x wallet address, Rookie.');
    return;
  }

  _userWallet = address;
  const assignment = _snapshot?.rangers?.find(r => r.holder === _userWallet);

  if (assignment) {
    _assignedNFT = (typeof allNFTs !== 'undefined') ? allNFTs.find(n => n.id === assignment.id) : null;
    renderWalletStatus(assignment);
    toast("Assignment Verified!", "success");
  } else {
    renderWalletStatus(null);
    // Trigger the Roast logic if the address is a civilian (not whitelisted)
    if (typeof triggerRoast === 'function') triggerRoast('rejected');
  }
}

/* ── X (TWITTER) REFERRAL LOGIC ─────────────────────── */
function shareToX() {
  const text = encodeURIComponent(`Checking my clearance for the @${BRIDGE_CONFIG.xAccount} drop on @Base. \n\nForge your destiny here: `);
  const url = encodeURIComponent(window.location.href);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  toast("Signal sent to the grid!", "info");
}

/* ── CONNECT WALLET ─────────────────────────────────── */
async function bridgeConnect() {
  if (typeof window.ethereum === 'undefined') {
    bridgeShowStatus('warn', '🦊 Wallet not detected.');
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (parseInt(currentChainId, 16) !== BRIDGE_CONFIG.chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x' + BRIDGE_CONFIG.chainId.toString(16) }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x' + BRIDGE_CONFIG.chainId.toString(16),
                        chainName: BRIDGE_CONFIG.chainName,
                        rpcUrls: [BRIDGE_CONFIG.rpcUrl],
                        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                        blockExplorerUrls: ["https://basescan.org"]
                    }]
                });
            }
        }
    }
    document.getElementById('bridgeWalletInput').value = accounts[0];
    bridgeVerifyAddress();
  } catch (err) {
    bridgeShowStatus('error', `Connection failed: ${err.message}`);
  }
}

/* ── RENDER WALLET STATUS ────────────────────────────── */
async function renderWalletStatus(assignment) {
  const panel = document.getElementById('bridgeWalletPanel');
  if (!panel) return;

  if (!assignment) {
    panel.innerHTML = `
      <div class="bridge-status not-listed" style="text-align:center; padding:20px; border:1px solid var(--red)">
        <div class="bridge-title" style="color:var(--red); font-family:'Bebas Neue'; font-size:1.5rem">ACCESS DENIED</div>
        <div class="bridge-msg" style="margin:10px 0; font-size:0.8rem; color:var(--muted)">
          Address <code>${_userWallet.slice(0,8)}...</code> isn't in the snapshot. You're a civilian in a war zone.
        </div>
        <button class="btn btn-outline" onclick="shareToX()" style="width:100%; margin-bottom:10px">
          𝕏 REQUEST REINFORCEMENTS
        </button>
        <button class="btn btn-outline" onclick="renderBridgeUI()" style="width:100%; border:none; font-size:0.7rem">← TRY ANOTHER</button>
      </div>`;
    return;
  }

  const tierColors = { legendary: '#ffc400', epic: '#b44fff', rare: '#00e5ff', uncommon: '#00e676', common: '#6a6a9a' };
  const tierColor = tierColors[assignment.tier] || '#fff';

  panel.innerHTML = `
    <div class="bridge-status whitelisted" style="text-align:center; border:1px solid ${tierColor}; padding:20px">
      <div class="bridge-tier" style="color:${tierColor}">★ ${assignment.tier.toUpperCase()} ASSIGNED</div>
      <div class="bridge-msg">Ranger Unit #${assignment.id} is reserved for you.</div>
      
      <div class="bridge-mint-row" style="margin-top:20px">
        <button class="btn btn-gen" style="width:100%" onclick="viewMyRanger(${assignment.id})">
          VIEW MY RANGER
        </button>
      </div>

      <div class="bridge-trust-box" style="margin-top:15px; border: 1px solid ${tierColor}44; padding: 10px; font-size: 0.75rem;">
        <p>Deployment: <strong>Base Mainnet</strong><br>Status: <strong>Ready to Claim Soon</strong></p>
      </div>
      
      <button class="btn btn-outline" onclick="shareToX()" style="width:100%; margin-top:10px">
        𝕏 SHARE CLEARANCE
      </button>

      <button class="btn btn-outline" onclick="renderBridgeUI()" style="margin-top:15px; width:100%; border-color:transparent; font-size:0.7rem">CHANGE WALLET</button>
    </div>`;
}

/* ── VIEW ASSIGNED RANGER ───────────────────────────── */
function viewMyRanger(id) {
  const nft = (typeof allNFTs !== 'undefined') ? allNFTs.find(n => n.id === id) : null;
  if (nft && typeof openModal === 'function') {
    openModal(nft);
  } else {
    toast("Ranger data not loaded. Please wait...", "warn");
  }
}

/* ── STATUS MESSAGE ─────────────────────────────────── */
function bridgeShowStatus(type, msg) {
  const el = document.getElementById('bridgeStatus');
  if (!el) return;
  const colors = { success: '#00e676', warn: '#ffc400', error: '#ff1744', info: '#00e5ff' };
  el.style.color = colors[type] || '#fff';
  el.style.display = 'block';
  el.textContent = msg;
}

/* ── RENDER BRIDGE UI ───────────────────────────────── */
function renderBridgeUI() {
  const root = document.getElementById('bridgeRoot');
  if (!root) return;
  root.innerHTML = `
    <div class="bridge-panel" style="background:var(--surface); padding:30px; border:1px solid var(--border)">
      <div class="bridge-header" style="text-align:center; margin-bottom:20px">
        <div class="bridge-phase" style="color:var(--cyan); font-family:'Share Tech Mono'; font-size:0.7rem; letter-spacing:2px">WL CHECKER</div>
        <div class="bridge-title-main" style="font-family:'Bebas Neue'; font-size:2.5rem; line-height:1">CHECK YOUR<br><span style="color:var(--cyan)">RANGER CLEARANCE</span></div>
      </div>
      <div id="bridgeStatus" style="display:none;padding:12px 0;font-family:'Share Tech Mono',monospace;font-size:.8rem;text-align:center"></div>
      
      <div id="bridgeWalletPanel">
        <div class="search-box">
          <input type="text" id="bridgeWalletInput" class="field-in" placeholder="0x..." style="width:100%; margin-bottom:10px; text-align:center">
          <button class="btn btn-gen" style="width:100%;" onclick="bridgeVerifyAddress()">
            CHECK WL
          </button>
        </div>
        
        <div class="divider" style="margin:20px 0; text-align:center; color:var(--muted2); font-size:0.7rem">OR</div>
        
        <button class="btn btn-outline" style="width:100%; font-size:0.9rem; border-style:dashed" onclick="bridgeConnect()">
          🦊 CONNECT WITH METAMASK
        </button>
      </div>
    </div>`;
}

/* ── COMPATIBILITY ── */
async function bridgeInit() { await initBridge(); }

window.addEventListener('DOMContentLoaded', initBridge);
