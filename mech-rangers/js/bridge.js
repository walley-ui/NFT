/* ═══════════════════════════════════════════════════════
     bridge.js — Phase 2: User Eligibility Checker
     Logic: Advanced Snapshot Scan (Merkle & Case Insensitive)
     1-700: FREE WL (1 Unit) | 701+: GTD (2 Units)
     Theme: Rust & Carbon
═══════════════════════════════════════════════════════ */

import { getRoast } from './roast.js';

const BRIDGE_CONFIG = {
  contractAddress: 'UPDATE_TO_MY_ACTUAL_CONTRACT_ADDRESS', 
  chainId: 1, 
  chainName: 'Ethereum',
  openSeaBase: 'https://opensea.io/collection/mech-rangers-official', 
  wlSnapshotUrl: '/wl-tree.json', 
  gtdSnapshotUrl: '/gtd-tree.json',
  xAccount: 'MechRangersNFT',
  tasks: {
    twitter: {
      like: "https://x.com/intent/like?tweet_id=YOUR_TWEET_ID",
      repost: "https://x.com/intent/retweet?tweet_id=YOUR_TWEET_ID",
      quote: "https://x.com/intent/tweet?text=Joining%20the%20Resistance&url=YOUR_TWEET_URL"
    },
    discord: "STAY TUNED.... " 
  }
};

/* ── STATE ──────────────────────────────────────────── */
let _userWallet = null;
let _wlSnapshot = null;
let _gtdSnapshot = null;

/* ── INIT (PRE-LOAD SNAPSHOTS) ─────────────────────── */
export async function initBridge() {
  const root = document.getElementById('bridge-content');
  if (root) root.innerHTML = `<div id="bridgeRoot" class="wrap" style="margin-top:100px; max-width:500px"></div>`;
  
  try {
    const [wlRes, gtdRes] = await Promise.all([
      fetch(`${BRIDGE_CONFIG.wlSnapshotUrl}?t=${Date.now()}`),
      fetch(`${BRIDGE_CONFIG.gtdSnapshotUrl}?t=${Date.now()}`)
    ]);

    if (wlRes.ok && gtdRes.ok) {
      _wlSnapshot = await wlRes.json();
      _gtdSnapshot = await gtdRes.json();
      console.log(` Snapshots Primed from Path.`);
    } else {
      throw new Error(`Fetch failed: WL(${wlRes.status}) GTD(${gtdRes.status})`);
    }
  } catch (err) {
    console.error("⛔ Bridge Error:", err.message);
    bridgeShowStatus('error', 'GRID OFFLINE: Local data missing.');
  }
  
  renderBridgeUI();
}

/* ── DEEP SCAN HELPER ──────────────────────────────── */
function findInGrid(snapshot, address) {
  if (!snapshot) return null;
  const registry = snapshot.claims || snapshot;
  const target = address.toLowerCase().trim();
  if (registry[target]) return registry[target];
  const foundKey = Object.keys(registry).find(key => key.toLowerCase().trim() === target);
  return foundKey ? registry[foundKey] : null;
}

/* ── CHECK ELIGIBILITY (STRICT) ────────────────────── */
export async function bridgeVerifyAddress() {
  const input = document.getElementById('bridgeWalletInput');
  const address = input?.value.trim().toLowerCase();

  if (!address || !address.startsWith('0x')) {
    bridgeShowStatus('warn', 'Enter a valid 0x wallet address.');
    return;
  }

  _userWallet = address;
  bridgeShowStatus('info', 'scanning snapshot registry...');

  const wlEntry = findInGrid(_wlSnapshot, _userWallet);
  if (wlEntry) {
    renderWalletStatus({
      tier: 'mythic',
      phase: 'FREE WL MINT',
      allowance: wlEntry.allowance || 1, // Fallback to 1 for WL
      rank: wlEntry.rank || "1-700"
    });
    return;
  }

  const gtdEntry = findInGrid(_gtdSnapshot, _userWallet);
  if (gtdEntry) {
    renderWalletStatus({
      tier: 'epic',
      phase: 'GTD PAID MINT',
      allowance: gtdEntry.allowance || 2, // Fallback to 2 for GTD
      rank: gtdEntry.rank || "701+"
    });
    return;
  }

  renderAccessDenied();
}

/* ── RENDER: ACCESS DENIED ─────────────────────────── */
function renderAccessDenied() {
  const panel = document.getElementById('bridgeWalletPanel');
  if (!panel) return;
  panel.innerHTML = `
    <div class="bridge-status denied" style="text-align:center; border:1px solid #ff1744; padding:25px; background: rgba(20,0,0,0.8)">
      <div style="font-family:'Share Tech Mono'; color:#ff1744; font-size:0.8rem; margin-bottom:15px; letter-spacing:2px">ACCESS DENIED</div>
      <div style="color:#eeeef8; font-family:'Bebas Neue'; font-size:2rem; line-height:1">WALLET NOT FOUND<br>IN THE SNAPSHOT</div>
      <p style="font-size:0.75rem; color:#6a6a9a; margin: 15px 0">Wallet not in Snapshot.</p>
      <div style="background:rgba(255,255,255,0.03); padding:20px; border:1px solid #252540; margin: 20px 0; border-radius:4px">
        <button class="btn btn-gen" onclick="window.open('${BRIDGE_CONFIG.openSeaBase}','_blank')" style="width:100%; background:#ff1744; color:#fff; border:none; padding:15px; font-weight:bold; cursor:pointer">BUY ON OPENSEA</button>
      </div>
      <button class="btn btn-outline" onclick="renderBridgeUI()" style="width:100%; border-color:transparent; font-size:0.7rem; color:#6a6a9a; cursor:pointer">OR CHECK A DIFFERENT ADDRESS</button>
    </div>`;
}

/* ── RENDER: ELIGIBLE STATUS ───────────────────────── */
async function renderWalletStatus(assignment) {
  const panel = document.getElementById('bridgeWalletPanel');
  if (!panel) return;
  const color = (assignment.phase === ' WL MINT') ? '#00e676' : '#8b4513';
  let welcomeRoast = "AUTHORIZED";
  if (typeof getRoast === 'function') {
      welcomeRoast = getRoast('welcome', assignment.tier || 'epic', { user: "Operative", count: assignment.allowance });
  }
  panel.innerHTML = `
    <div class="bridge-status whitelisted" style="text-align:center; border:1px solid ${color}; padding:25px; background: rgba(0,0,0,0.6)">
      <div style="font-family:'Share Tech Mono'; color:${color}; font-size:0.8rem; margin-bottom:15px; font-style:italic">"${welcomeRoast.toUpperCase()}"</div>
      <div class="bridge-tier" style="color:${color}; font-family:'Bebas Neue'; font-size:2rem">MINT ALLOCATION</div>
      <div class="bridge-msg" style="margin:10px 0; font-size:0.9rem; color:#fff">Allocation: <strong>${assignment.allowance} Unit(s)</strong></div>
      <div style="background:rgba(255,255,255,0.05); padding:10px; border:1px solid #252540; margin: 20px 0">
        <div style="font-size:0.6rem; color:#6a6a9a; text-transform:uppercase">Verified Wallet</div>
        <div style="font-size:0.75rem; color:#eeeef8; font-family:'Share Tech Mono'"><code>${_userWallet}</code></div>
        <div style="font-size:0.55rem; color:#8b4513; margin-top:5px">Rank: #${assignment.rank}</div>
      </div>
      <div style="background:rgba(255,255,255,0.03); padding:20px; border:1px solid #252540; margin: 20px 0; border-radius:4px">
        <button class="btn btn-gen" onclick="window.open('${BRIDGE_CONFIG.openSeaBase}','_blank')" style="width:100%; background:${color}; color:${color === '#00e676' ? '#000' : '#fff'}; font-weight:bold; border:none; padding:15px; cursor:pointer">PROCEED TO MINT ON OPENSEA</button>
      </div>
      <button class="btn btn-outline" onclick="shareToX('${assignment.phase}')" style="width:100%; border-color:#5d2a18; color:#8b4513; font-size:0.7rem; cursor:pointer">𝕏 SHARE TO TWITTER</button>
      <button class="btn" onclick="renderBridgeUI()" style="margin-top:15px; background:none; border:none; color:#6a6a9a; cursor:pointer; font-size:0.6rem">DISCONNECT</button>
    </div>`;
}

export function shareToX(phase = "CLEARANCE") {
  const text = encodeURIComponent(`I got the WL for @${BRIDGE_CONFIG.xAccount} NFT drop chance on @Ethereum. \n\neligible for: ${phase}\n\nCheck if you got in: `);
  const url = encodeURIComponent(window.location.origin);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

export async function bridgeConnect() {
  if (typeof window.ethereum === 'undefined') {
    bridgeShowStatus('warn', 'Wallet not detected.');
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    document.getElementById('bridgeWalletInput').value = accounts[0];
    bridgeVerifyAddress();
  } catch (err) {
    bridgeShowStatus('error', 'Connection failed.');
  }
}

function bridgeShowStatus(type, msg) {
  const el = document.getElementById('bridgeStatus');
  if (!el) return;
  const colors = { success: '#00e676', warn: '#ffc400', error: '#ff1744', info: '#00e5ff' };
  el.style.color = colors[type] || '#fff';
  el.style.display = 'block';
  el.textContent = msg;
}

export function renderBridgeUI() {
  const root = document.getElementById('bridgeRoot');
  if (!root) return;
  root.innerHTML = `
    <div class="bridge-panel" style="background:#0c0807; padding:40px; border:1px solid #5d2a18; box-shadow: 0 0 30px rgba(0,0,0,0.5)">
      <div class="bridge-header" style="text-align:center; margin-bottom:20px">
        <div class="bridge-phase" style="color:#8b4513; font-family:'Share Tech Mono'; font-size:0.7rem; letter-spacing:2px">MECH RANGERS CHECKER</div>
        <div class="bridge-title-main" style="font-family:'Bebas Neue'; font-size:2.5rem; line-height:1; color:#eeeef8"> CHECK<br><span style="color:#8b4513">ELIGIBILITY</span></div>
      </div>
      <div id="bridgeStatus" style="display:none;padding:12px 0;font-family:'Share Tech Mono',monospace;font-size:.8rem;text-align:center"></div>
      <div id="bridgeWalletPanel">
        <div class="search-box">
          <input type="text" id="bridgeWalletInput" class="field-in" placeholder="0x..." style="width:100%; margin-bottom:10px; text-align:center; background:rgba(0,0,0,0.3); border:1px solid #333; color:#fff; font-family:'Share Tech Mono'; padding:10px">
          <button class="btn btn-gen" style="width:100%; background:#8b4513; border:none; padding:15px; cursor:pointer; color:#fff; font-family:'Bebas Neue'; font-size:1.2rem" onclick="bridgeVerifyAddress()">CHECK</button>
        </div>
        <div class="divider" style="margin:20px 0; text-align:center; color:#3a3a5a; font-size:0.7rem">OR</div>
        <button class="btn btn-outline" style="width:100%; font-size:0.9rem; border:1px dashed #5d2a18; color:#8b4513; background:transparent; padding:10px; cursor:pointer" onclick="bridgeConnect()">LINK WALLET</button>
      </div>
    </div>`;
}

window.bridgeVerifyAddress = bridgeVerifyAddress;
window.shareToX = shareToX;
window.bridgeConnect = bridgeConnect;
window.renderBridgeUI = renderBridgeUI;
