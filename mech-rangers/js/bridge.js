/* ═══════════════════════════════════════════════════════
     bridge.js — Phase 2: User Verification & Registration
     Upgraded for: Supabase Ingestion & Sequential Phase Logic
     Logic: 1-700 (Free WL) | 701+ (GTD) | Database Tracked
     Depends on: modal.js, app.js, export.js, roast.js
═══════════════════════════════════════════════════════ */

import { getRoast } from './roast.js';
import { createClient } from '@supabase/supabase-js';

// Securely pull environment variables via Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const _supabase = createClient(supabaseUrl, supabaseKey);

/* ── CONFIG (UPDATED FOR DATA INGESTION) ────────────── */
const BRIDGE_CONFIG = {
  contractAddress: 'UPDATE_TO_MY_ACTUAL_CONTRACT_ADDRESS', 
  chainId: 1, 
  chainName: 'Ethereum',
  rpcUrl: 'https://eth.llamarpc.com',
  openSeaBase: 'https://opensea.io/collection/mech-rangers-official', 
  // Snapshots kept for local validation fallback
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
    const [wlRes, gtdRes] = await Promise.all([
      fetch(`${BRIDGE_CONFIG.wlSnapshotUrl}?t=${Date.now()}`),
      fetch(`${BRIDGE_CONFIG.gtdSnapshotUrl}?t=${Date.now()}`)
    ]);

    if (wlRes.ok) _wlSnapshot = await wlRes.json();
    if (gtdRes.ok) _gtdSnapshot = await gtdRes.json();
    
    console.log("🛡️ Mech Rangers: Registration Snapshots Primed.");
  } catch (err) {
    console.error("⛔ Bridge Error:", err.message);
    bridgeShowStatus('error', 'GRID OFFLINE: Local data missing.');
  }
  renderBridgeUI();
}

/* ── SUBMIT & VERIFY (SUPABASE INGESTION) ───────────── */
export async function bridgeVerifyAddress() {
  const input = document.getElementById('bridgeWalletInput');
  const address = input?.value.trim().toLowerCase();

  if (!address || !address.startsWith('0x')) {
    bridgeShowStatus('warn', 'Enter a valid 0x wallet address, Rookie.');
    return;
  }

  _userWallet = address;
  bridgeShowStatus('info', 'Scanning grid for wallet data...');

  try {
    // 1. Check if record already exists
    let { data: existing, error: fetchError } = await _supabase
      .from('recruits')
      .select('*')
      .eq('wallet_address', _userWallet)
      .single();

    if (!existing) {
      // 2. Register New Entry (Ingestion)
      const { data: newEntry, error: insertError } = await _supabase
        .from('recruits')
        .insert([{ 
            wallet_address: _userWallet,
            registered_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      existing = newEntry;
      if (typeof toast === 'function') toast("Address Secured to Database", "success");
    }

    // 3. Determine Phase based on Database ID (Cap Logic)
    // Assignment Logic: 1-700 = FREE_WL, 701+ = GTD
    const rank = existing.id; 
    const assignment = {
      tier: (rank <= 700) ? 'mythic' : 'epic',
      phase: (rank <= 700) ? 'FREE WL MINT' : 'GTD PAID MINT',
      allowance: 2
    };

    renderWalletStatus(assignment, existing);
    
  } catch (err) {
    console.error("⛔ Database Error:", err.message);
    bridgeShowStatus('error', 'SIGNAL LOST: Database sync failed.');
  }
}

/* ── X (TWITTER) REFERRAL LOGIC ─────────────────────── */
export function shareToX(phase = "CLEARANCE") {
  const text = encodeURIComponent(`My wallet is secured for the @${BRIDGE_CONFIG.xAccount} drop on @Ethereum. \n\nClearance Level: ${phase}\n\nRegister your wallet: `);
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
  const tierColors = { mythic: '#ff3d00', legendary: '#ffc400', epic: '#b44fff' };
  const statusColor = (assignment.phase === 'FREE WL MINT') ? '#00e676' : '#ffc400';

  let welcomeRoast = "AUTHORIZED FOR DEPLOYMENT";
  if (typeof getRoast === 'function') {
      welcomeRoast = getRoast('welcome', assignment.tier || 'epic', { user: handle, count: 2 });
  }

  panel.innerHTML = `
    <div class="bridge-status whitelisted" style="text-align:center; border:1px solid ${statusColor}; padding:25px; background: rgba(0,0,0,0.6)">
      <div style="font-family:'Share Tech Mono'; color:${statusColor}; font-size:0.8rem; margin-bottom:15px; font-style:italic">"${welcomeRoast.toUpperCase()}"</div>
      <div class="bridge-tier" style="color:${statusColor}; font-family:'Bebas Neue'; font-size:2rem">${assignment.phase}</div>
      <div class="bridge-msg" style="margin:10px 0; font-size:0.9rem; color:#fff">Allocation Secured: <strong>2 Unit(s)</strong></div>
      
      <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:4px; margin: 20px 0; border: 1px solid #252540">
        <div style="font-size:0.6rem; color:#6a6a9a; text-transform:uppercase">Registered Wallet</div>
        <div style="font-size:0.75rem; color:#eeeef8; font-family:'Share Tech Mono'"><code>${_userWallet}</code></div>
      </div>

      <button class="btn btn-gen" onclick="shareToX('${assignment.phase}')" style="width:100%; background:${statusColor}; color:#000; font-weight:bold; margin-bottom:10px; border:none; padding:15px">
        𝕏 BROADCAST CLEARANCE
      </button>

      <div class="bridge-trust-box" style="margin-top:15px; border: 1px solid ${statusColor}44; padding: 10px; font-size: 0.7rem; color:#6a6a9a">
        <p>Network: <strong>Ethereum Mainnet</strong> | Registry: Secured</p>
      </div>

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
        <div class="bridge-phase" style="color:#8b4513; font-family:'Share Tech Mono'; font-size:0.7rem; letter-spacing:2px">REGISTRATION TERMINAL</div>
        <div class="bridge-title-main" style="font-family:'Bebas Neue'; font-size:2.5rem; line-height:1; color:#eeeef8">SECURE YOUR<br><span style="color:#8b4513">MINT SLOT</span></div>
      </div>
      <div id="bridgeStatus" style="display:none;padding:12px 0;font-family:'Share Tech Mono',monospace;font-size:.8rem;text-align:center"></div>
      
      <div id="bridgeWalletPanel">
        <div class="search-box">
          <input type="text" id="bridgeWalletInput" class="field-in" placeholder="0x..." style="width:100%; margin-bottom:10px; text-align:center; background:rgba(0,0,0,0.3); border-color:#252540; font-family:'Share Tech Mono'">
          <button class="btn btn-gen" style="width:100%; background:#8b4513; border:none; padding:15px" onclick="bridgeVerifyAddress()">
            SUBMIT TO DATABASE
          </button>
        </div>
        <div class="divider" style="margin:20px 0; text-align:center; color:#3a3a5a; font-size:0.7rem">OR AUTO-LINK</div>
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
