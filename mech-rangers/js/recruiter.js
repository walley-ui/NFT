/* ═══════════════════════════════════════════════════════
     recruiter.js — Phase 1: Recruitment & Whitelisting
     Handles wallet submission, X-verification, and Referrals
═══════════════════════════════════════════════════════ */

const RECRUIT_CONFIG = {
  twitterHandle: "@MechRangersNFT",
  referralBonus: "Boosts Mythic Chance",
  targetNetwork: "Base Sepolia"
};

let _recruitData = {
  wallet: null,
  twitter: null,
  referrals: 0,
  refCode: null
};

/* ── INITIALIZE RECRUITMENT ─────────────────────────── */
function initRecruiter() {
  const root = document.getElementById('bridge-content');
  // Check if we already have a saved session
  const saved = localStorage.getItem('mr_recruit_session');
  if (saved) {
    _recruitData = JSON.parse(saved);
    renderRecruitSuccess();
  } else {
    renderRecruitUI();
  }
}

/* ── SUBMIT DOSSIER (THE JOIN) ─────────────────────── */
async function submitRecruitment() {
  const wallet = document.getElementById('recWallet').value.trim();
  const twitter = document.getElementById('recTwitter').value.trim();

  if (!wallet.startsWith('0x') || wallet.length < 40) {
    toast("Invalid Wallet Signal", "error");
    return;
  }
  if (!twitter.startsWith('@')) {
    toast("ID must start with @", "warn");
    return;
  }

  // 1. Generate a unique referral code
  const code = btoa(wallet.slice(-6)).substring(0, 6).toUpperCase();
  
  _recruitData = {
    wallet: wallet,
    twitter: twitter,
    referrals: 0,
    refCode: code
  };

  // 2. Save locally (In production, you'd POST this to your database/Supabase)
  localStorage.setItem('mr_recruit_session', JSON.stringify(_recruitData));
  
  toast("Dossier Submitted!", "success");
  renderRecruitSuccess();
}

/* ── RENDER UI: ENTRY FORM ─────────────────────────── */
function renderRecruitUI() {
  const root = document.getElementById('bridge-content');
  root.innerHTML = `
    <div class="bridge-panel recruit-panel" style="max-width:500px; margin: 80px auto; padding: 40px; border: 1px solid var(--border); background: var(--surface);">
      <div class="bridge-header" style="text-align:center; margin-bottom:30px">
        <div style="color:var(--cyan); font-family:'Share Tech Mono'; font-size:0.7rem; letter-spacing:3px">OP: RECRUITMENT ACTIVE</div>
        <h2 style="font-family:'Bebas Neue'; font-size:3rem; line-height:0.9">JOIN THE<br><span style="color:var(--cyan)">RESISTANCE</span></h2>
        <p style="font-size:0.8rem; color:var(--muted); margin-top:10px">Submit your signal to be whitelisted for the Base deployment.</p>
      </div>

      <div class="field-row" style="margin-bottom:15px">
        <label style="font-size:0.65rem; color:var(--cyan); display:block; margin-bottom:5px">DEPLOYMENT WALLET (BASE)</label>
        <input type="text" id="recWallet" class="field-in" placeholder="0x..." style="width:100%; text-align:center">
      </div>

      <div class="field-row" style="margin-bottom:20px">
        <label style="font-size:0.65rem; color:var(--cyan); display:block; margin-bottom:5px">X (TWITTER) HANDLE</label>
        <input type="text" id="recTwitter" class="field-in" placeholder="@username" style="width:100%; text-align:center">
      </div>

      <button class="btn btn-gen" style="width:100%; margin-bottom:15px" onclick="submitRecruitment()">FORGE ENROLLMENT</button>
      
      <p style="text-align:center; font-size:0.6rem; color:var(--muted2)">By joining, you agree to follow @MechRangersNFT for mission updates.</p>
    </div>
  `;
}

/* ── RENDER UI: SUCCESS & REFERRAL ─────────────────── */
function renderRecruitSuccess() {
  const root = document.getElementById('bridge-content');
  const refLink = `${window.location.origin}?ref=${_recruitData.refCode}`;
  
  root.innerHTML = `
    <div class="bridge-panel recruit-panel" style="max-width:500px; margin: 80px auto; padding: 40px; border: 1px solid var(--cyan); background: var(--surface);">
      <div style="text-align:center; color:var(--green); font-family:'Share Tech Mono'; font-size:0.7rem; margin-bottom:10px">● SIGNAL SECURED</div>
      <h2 style="text-align:center; font-family:'Bebas Neue'; font-size:2.5rem; line-height:1">RECRUITMENT<br>CONFIRMED</h2>
      
      <div style="background:rgba(0,229,255,0.05); padding:20px; border:1px dashed var(--cyan); margin:20px 0; text-align:center">
        <div style="font-size:0.6rem; color:var(--muted)">YOUR REFERRAL CODE</div>
        <div style="font-size:1.5rem; font-family:'Share Tech Mono'; color:var(--cyan); letter-spacing:4px">${_recruitData.refCode}</div>
      </div>

      <div style="margin-bottom:20px">
        <p style="font-size:0.75rem; color:var(--text); text-align:center">Recruit fellow Rangers to increase your <span style="color:var(--gold)">Mythic Allocation</span>.</p>
        <div class="field-row" style="margin-top:10px">
           <input type="text" readonly value="${refLink}" style="width:100%; background:transparent; border:1px solid var(--border); color:var(--muted); font-size:0.65rem; padding:10px; text-align:center">
        </div>
      </div>

      <button class="btn btn-outline" style="width:100%; margin-bottom:10px" onclick="copyRef('${refLink}')">COPY LINK</button>
      <button class="btn btn-gen" style="width:100%" onclick="tweetRef('${refLink}')">𝕏 ANNOUNCE DEPLOYMENT</button>
      
      <div style="text-align:center; margin-top:20px">
        <button onclick="localStorage.clear(); location.reload();" style="background:none; border:none; color:var(--red); font-size:0.6rem; cursor:pointer; text-decoration:underline">RESET DOSSIER</button>
      </div>
    </div>
  `;
}

function copyRef(link) {
  navigator.clipboard.writeText(link);
  toast("Link Copied to Comms", "info");
}

function tweetRef(link) {
  const text = encodeURIComponent(`I've joined the Mech Rangers Resistance on @Base. Enroll here to secure your unit: `);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`, '_blank');
}
