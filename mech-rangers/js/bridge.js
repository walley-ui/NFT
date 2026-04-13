/* ═══════════════════════════════════════════════════════
     bridge.js — Phase 2: OpenSea Direct Navigator
     Upgraded for high-trust user flow.
═══════════════════════════════════════════════════════ */

/* ── CONFIG ─────────────────────────────────────────── */
const BRIDGE_CONFIG = {
  contractAddress: 'YOUR_DEPLOYED_CONTRACT_ADDRESS',
  mintPriceEth: '0.05',
  chainId: 8453, 
  chainName: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  // Direct link to the OpenSea collection page for trust
  openSeaBase: 'https://opensea.io/collection/mech-rangers-official', 
  treeUrl: '/tree.json',
};

/* Minimal ABI — kept for background verification if needed */
const BRIDGE_ABI = [
  'function mint(uint256 quantity, uint256 maxAllowance, bytes32[] calldata merkleProof) external payable',
  'function walletMinted(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function MAX_SUPPLY() view returns (uint256)',
];

/* ── STATE ──────────────────────────────────────────── */
let _provider = null;
let _signer = null;
let _contract = null;
let _userWallet = null;
let _treeEntry = null;
let _tree = null;

/* ── INIT ───────────────────────────────────────────── */
async function bridgeInit() {
  try {
    const res = await fetch(BRIDGE_CONFIG.treeUrl);
    _tree = await res.json();
    console.log("Whitelist loaded. Navigator Ready.");
  } catch {
    bridgeShowStatus('error', '⛔ Could not load snapshot. Check internet.');
    return;
  }
  renderBridgeUI();
}

/* ── VERIFY WITHOUT CONNECTING ──────────────────────── */
// Users can just type their address to see their status
async function bridgeVerifyAddress() {
  const input = document.getElementById('bridgeWalletInput');
  const address = input?.value.trim().toLowerCase();

  if (!address || !address.startsWith('0x')) {
    bridgeShowStatus('warn', 'Enter a valid 0x wallet address.');
    return;
  }

  _userWallet = address;
  _treeEntry = _tree[_userWallet] || null;
  renderWalletStatus();
}

/* ── CONNECT WALLET (Optional Backup) ───────────────── */
async function bridgeConnect() {
  if (typeof window.ethereum === 'undefined') {
    bridgeShowStatus('warn', '🦊 Wallet not detected.');
    return;
  }
  try {
    _provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await _provider.send('eth_requestAccounts', []);
    _userWallet = accounts[0].toLowerCase();
    _treeEntry = _tree[_userWallet] || null;
    renderWalletStatus();
  } catch (err) {
    bridgeShowStatus('error', `Connection failed: ${err.message}`);
  }
}

/* ── RENDER WALLET STATUS ────────────────────────────── */
async function renderWalletStatus() {
  const panel = document.getElementById('bridgeWalletPanel');
  if (!panel) return;

  if (!_treeEntry) {
    panel.innerHTML = `
      <div class="bridge-status not-listed">
        <div class="bridge-title" style="color:var(--red)">PERMISSION DENIED</div>
        <div class="bridge-msg">Wallet <code>${_userWallet.slice(0,6)}...</code> was not found in the final snapshot.</div>
        <button class="btn btn-outline" onclick="renderBridgeUI()" style="margin-top:10px">← TRY ANOTHER</button>
      </div>`;
    return;
  }

  const tierColors = { 
    legendary: '#ffc400', epic: '#b44fff', rare: '#00e5ff', 
    uncommon: '#00e676', common: '#6a6a9a' 
  };
  const tierColor = tierColors[_treeEntry.tier] || '#fff';

  panel.innerHTML = `
    <div class="bridge-status whitelisted">
      <div class="bridge-tier" style="color:${tierColor}">★ ${_treeEntry.tier.toUpperCase()} RANGER</div>
      <div class="bridge-stats">
        <div class="bstat">
          <span class="bstat-val" style="color:${tierColor}">${_treeEntry.maxAllowance}</span>
          <span class="bstat-label">Mint Allocation</span>
        </div>
        <div class="bstat">
          <span class="bstat-val">${_treeEntry.referrals}</span>
          <span class="bstat-label">Points Secured</span>
        </div>
      </div>
      
      <div class="bridge-trust-box">
        <p>Your allocation is secured. To ensure 100% security, minting is performed directly via our verified OpenSea collection.</p>
      </div>

      <div class="bridge-mint-row">
        <a href="${BRIDGE_CONFIG.openSeaBase}" target="_blank" class="btn btn-gen" style="text-decoration:none; display:block; text-align:center;">
          ⚡ MINT ON OPENSEA
        </a>
      </div>
      <button class="btn btn-outline" onclick="renderBridgeUI()" style="margin-top:15px; width:100%; border-color:transparent; font-size:0.7rem">CHANGE WALLET</button>
    </div>`;
}

/* ── EXECUTE MINT (Legacy Support) ───────────────────── */
async function bridgeMint() {
  // We now redirect to OpenSea, but we keep this function to avoid breaking code references
  window.open(BRIDGE_CONFIG.openSeaBase, '_blank');
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

/* ── RENDER BRIDGE UI (Upgraded Search) ─────────────── */
function renderBridgeUI() {
  const root = document.getElementById('bridgeRoot');
  if (!root) return;
  root.innerHTML = `
    <div class="bridge-panel">
      <div class="bridge-header">
        <div class="bridge-phase">PHASE 2 — MINT IS LIVE</div>
        <div class="bridge-title-main">VERIFY YOUR<br><span style="color:var(--cyan)">SURVIVOR STATUS</span></div>
      </div>
      <div id="bridgeStatus" style="display:none;padding:12px 0;font-family:'Share Tech Mono',monospace;font-size:.8rem"></div>
      
      <div id="bridgeWalletPanel">
        <div class="search-box" style="margin-bottom:20px">
          <input type="text" id="bridgeWalletInput" class="field-in" placeholder="Enter Wallet Address (0x...)" style="width:100%; margin-bottom:10px; text-align:center">
          <button class="btn btn-gen" style="width:100%;" onclick="bridgeVerifyAddress()">
            SEARCH SNAPSHOT
          </button>
        </div>
        
        <div class="divider" style="margin:20px 0; text-align:center; color:var(--muted2); font-size:0.7rem">OR</div>
        
        <button class="btn btn-outline" style="width:100%; font-size:0.9rem; border-style:dashed" onclick="bridgeConnect()">
          🦊 AUTO-CONNECT METAMASK
        </button>
      </div>
    </div>`;
}
