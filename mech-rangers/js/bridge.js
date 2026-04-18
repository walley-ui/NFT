/* ═══════════════════════════════════════════════════════
     bridge.js — Phase 2: User Verification & Claiming
     Upgraded for X-Referrals + Roasting + Ethereum Mainnet
     Depends on: modal.js, app.js, export.js, roast.js
═══════════════════════════════════════════════════════ */

import { getRoast } from './roast.js';
import { createClient } from '@supabase/supabase-js';

// Securely pull environment variables via Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const _supabase = createClient(supabaseUrl, supabaseKey);

/* ── CONFIG (UPDATED FOR ETH MAINNET) ───────────────── */
const BRIDGE_CONFIG = {
  contractAddress: 'UPDATE_TO_MY_ACTUAL_CONTRACT_ADDRESS', 
  mintPriceEth: '0.00009', 
  chainId: 1, 
  chainName: 'Ethereum',
  rpcUrl: 'https://eth.llamarpc.com',
  openSeaBase: 'https://opensea.io/collection/mech-rangers-official', 
  // UPGRADE: Pointing to dual snapshots for 700 WL and 4,000 GTD
  wlSnapshotUrl: '/wl-tree.json',
  gtdSnapshotUrl: '/gtd-tree.json', 
  xAccount: 'MechRangersNFT'
};

/* ── STATE ──────────────────────────────────────────── */
let _userWallet = null;
let _assignedNFT = null;
let _wlSnapshot = null;
let _gtdSnapshot = null;

/* ── INIT (HITS THE BRIDGE ROOT) ───────────────────── */
export async function initBridge() {
  const root = document.getElementById('bridge-content');
  if (root) root.innerHTML = `<div id="bridgeRoot" class="wrap" style="margin-top:100px; max-width:500px"></div>`;
  
  try {
    // UPGRADE: Fetching dual roots for WL and GTD phases
    const [wlRes, gtdRes] = await Promise.all([
      fetch(`${BRIDGE_CONFIG.wlSnapshotUrl}?t=${Date.now()}`),
      fetch(`${BRIDGE_CONFIG.gtdSnapshotUrl}?t=${Date.now()}`)
    ]);

    if (wlRes.ok) _wlSnapshot = await wlRes.json();
    if (gtdRes.ok) _gtdSnapshot = await gtdRes.json();
    
    console.log("🛡️ Mech Rangers: Ethereum Phase Snapshots Loaded.");
  } catch (err) {
    console.error("⛔ Bridge Error:", err.message);
    bridgeShowStatus('error', 'SYSTEM OFFLINE: Snapshots missing in /public');
  }
  renderBridgeUI();
}

/* ── VERIFY ADDRESS (THE SEARCH) ────────────────────── */
export async function bridgeVerifyAddress() {
  const input = document.getElementById('bridgeWalletInput');
  const address = input?.value.trim().toLowerCase();

  if (!address || !address.startsWith('0x')) {
    bridgeShowStatus('warn', 'Enter a valid 0x wallet address, Rookie.');
    return;
  }

  _userWallet = address;
  
  if (!_wlSnapshot && !_gtdSnapshot) {
      bridgeShowStatus('error', 'Snapshot data unavailable.');
      return;
  }

  // Check both potential assignment trees
  const assignment = (_wlSnapshot ? _wlSnapshot[_userWallet] : null) || 
                     (_gtdSnapshot ? _gtdSnapshot[_userWallet] : null);

  const { data: dbUser } = await _supabase
    .from('recruits')
    .select('twitter_handle')
    .eq('wallet_address', _userWallet)
    .single();

  if (assignment) {
    // Allowance is now a flat 2 for the 10k collection move
    assignment.allowance = 2; 
    _assignedNFT = (typeof allNFTs !== 'undefined' && assignment.id) ? allNFTs.find(n => n.id === assignment.id) : null;
    renderWalletStatus(assignment, dbUser);
    if (typeof toast === 'function') toast("Clearance Confirmed!", "success");
  } else {
    renderWalletStatus(null, dbUser);
    if (typeof getRoast === 'function') {
        const roast = getRoast('rejected', 'parasite', { user: dbUser?.twitter_handle || 'Stranger' });
        bridgeShowStatus('error', roast.toUpperCase());
    }
  }
}

/* ── X (TWITTER) REFERRAL LOGIC ─────────────────────── */
export function shareToX() {
  const text = encodeURIComponent(`Checking my clearance for the @${BRIDGE_CONFIG.xAccount} drop on @Ethereum. \n\nForge your destiny here: `);
  const url = encodeURIComponent(window.location.origin);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  if (typeof toast === 'function') toast("Signal sent to the grid!", "info");
}

/* ── CONNECT WALLET ─────────────────────────────────── */
export async function bridgeConnect() {
  if (typeof window.ethereum === 'undefined') {
    bridgeShowStatus('warn', '🦊 Wallet not detected.');
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (parseInt(currentChainId, 16) !== BRIDGE_CONFIG.chainId) {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }], // Ethereum Mainnet
        });
    }
    document.getElementById('bridgeWalletInput').value = accounts[0];
    bridgeVerifyAddress();
  } catch (err) {
    bridgeShowStatus('error', `Connection failed: ${err.message}`);
  }
}

/* ── RENDER WALLET STATUS ────────────────────────────── */
async function renderWalletStatus(assignment, dbUser) {
  const panel = document.getElementById('bridgeWalletPanel');
  if (!panel) return;

  const handle = dbUser?.twitter_handle || "Operative";
  
  if (!assignment) {
    panel.innerHTML = `
      <div class="bridge-status not-listed" style="text-align:center; padding:20px; border:1px solid #ff1744; background: rgba(255,23,68,0.05)">
        <div class="bridge-title" style="color:#ff1744; font-family:'Bebas Neue'; font-size:1.5rem">ACCESS DENIED</div>
        <div class="bridge-msg" style="margin:10px 0; font-size:0.8rem; color:#6a6a9a">
          Wallet <code>${_userWallet.slice(0,8)}...</code> is not currently authorized.
        </div>
        <button class="btn btn-outline" onclick="shareToX()" style="width:100%; margin-bottom:10px">
          𝕏 REQUEST 
        </button>
        <button class="btn btn-outline" onclick="renderBridgeUI()" style="width:100%; border:none; font-size:0.7rem">← TRY ANOTHER</button>
      </div>`;
    return;
  }

  const tierColors = { mythic: '#ff3d00', legendary: '#ffc400', epic: '#b44fff' };
  const tierColor = tierColors[assignment.tier] || '#eeeef8';

  let welcomeRoast = "AUTHORIZED";
  if (typeof getRoast === 'function') {
      welcomeRoast = getRoast('welcome', assignment.tier || 'epic', { user: handle, count: 2 });
  }

  panel.innerHTML = `
    <div class="bridge-status whitelisted" style="text-align:center; border:1px solid ${tierColor}; padding:25px; background: rgba(0,0,0,0.4)">
      <div style="font-family:'Share Tech Mono'; color:${tierColor}; font-size:0.8rem; margin-bottom:15px; font-style:italic">"${welcomeRoast.toUpperCase()}"</div>
      <div class="bridge-tier" style="color:${tierColor}; font-family:'Bebas Neue'; font-size:2rem"> GRANTED</div>
      <div class="bridge-msg" style="margin:10px 0; font-size:0.9rem">Authorized for <strong>2 Unit(s)</strong> @ 0.00009 ETH</div>
      
      <div class="bridge-mint-row" style="margin-top:20px">
        <a href="${BRIDGE_CONFIG.openSeaBase}" target="_blank" class="btn btn-gen" style="display:block; width:100%; background:${tierColor}; color:#000; text-decoration:none; padding:15px; font-weight:bold; text-align:center">
          MINT ON OPENSEA
        </a>
      </div>

      <div class="bridge-trust-box" style="margin-top:15px; border: 1px solid ${tierColor}44; padding: 10px; font-size: 0.7rem; color:#6a6a9a">
        <p>Network: <strong>Ethereum Mainnet</strong> | Proof: Verified</p>
      </div>
      
      <button class="btn btn-outline" onclick="shareToX()" style="width:100%; margin-top:10px">
        𝕏 SHARE CLEARANCE
      </button>

      <button class="btn btn-outline" onclick="renderBridgeUI()" style="margin-top:15px; width:100%; border-color:transparent; font-size:0.7rem; opacity:0.5">DISCONNECT SIGNAL</button>
    </div>`;
}

/* ── VIEW ASSIGNED RANGER ───────────────────────────── */
export function viewMyRanger(id) {
  const nft = (typeof allNFTs !== 'undefined') ? allNFTs.find(n => n.id === id) : null;
  if (nft && typeof openModal === 'function') {
    openModal(nft);
  } else {
    if (typeof toast === 'function') toast("Ranger data not loaded.", "warn");
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
export function renderBridgeUI() {
  const root = document.getElementById('bridgeRoot');
  if (!root) return;
  root.innerHTML = `
    <div class="bridge-panel" style="background:#0c0807; padding:40px; border:1px solid #5d2a18; box-shadow: 0 0 30px rgba(0,0,0,0.5)">
      <div class="bridge-header" style="text-align:center; margin-bottom:20px">
        <div class="bridge-phase" style="color:#8b4513; font-family:'Share Tech Mono'; font-size:0.7rem; letter-spacing:2px">MECH RANGERS CHECKER</div>
        <div class="bridge-title-main" style="font-family:'Bebas Neue'; font-size:2.5rem; line-height:1; color:#eeeef8">CHECK YOUR<br><span style="color:#8b4513">MINT ELIGIBILITY</span></div>
      </div>
      <div id="bridgeStatus" style="display:none;padding:12px 0;font-family:'Share Tech Mono',monospace;font-size:.8rem;text-align:center"></div>
      
      <div id="bridgeWalletPanel">
        <div class="search-box">
          <input type="text" id="bridgeWalletInput" class="field-in" placeholder="0x..." style="width:100%; margin-bottom:10px; text-align:center; background:rgba(0,0,0,0.3); border-color:#252540">
          <button class="btn btn-gen" style="width:100%; background:#8b4513; border:none" onclick="bridgeVerifyAddress()">
            INITIATE SCAN
          </button>
        </div>
        <div class="divider" style="margin:20px 0; text-align:center; color:#3a3a5a; font-size:0.7rem">OR CONNECTION VIA</div>
        <button class="btn btn-outline" style="width:100%; font-size:0.9rem; border-style:dashed; color:#8b4513; border-color:#5d2a18" onclick="bridgeConnect()">
          🦊 CONNECT METAMASK
        </button>
      </div>
    </div>`;
}

window.bridgeVerifyAddress = bridgeVerifyAddress;
window.shareToX = shareToX;
window.bridgeConnect = bridgeConnect;
window.viewMyRanger = viewMyRanger;
window.renderBridgeUI = renderBridgeUI;
