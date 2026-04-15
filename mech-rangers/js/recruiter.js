/* ═══════════════════════════════════════════════════════
     recruiter.js — Phase 1: Recruitment & Whitelisting
     Handles wallet submission, X-verification, and Referrals
     Theme: Rust & Carbon (Reddish Brown Premium)
═══════════════════════════════════════════════════════ */

const RECRUIT_CONFIG = {
  twitterHandle: "MechRangersNFT",
  referralBonus: "Boosts Mythic Chance",
  targetNetwork: "Base Sepolia",
  accentColor: "#8b4513", // Reddish Brown
  rustColor: "#5d2a18"
};

let _recruitData = {
  wallet: null,
  twitter: null,
  referrals: 0,
  refCode: null,
  followed: false
};

/* ── INITIALIZE RECRUITMENT ─────────────────────────── */
function initRecruiter() {
  const root = document.getElementById('bridge-content');
  const saved = localStorage.getItem('mr_recruit_session');
  if (saved) {
    _recruitData = JSON.parse(saved);
    renderRecruitSuccess();
  } else {
    renderRecruitUI();
  }
}

/* ── BOT PREVENTION: VERIFY FOLLOW ─────────────────── */
function verifyFollow() {
  window.open(`https://twitter.com/intent/follow?screen_name=${RECRUIT_CONFIG.twitterHandle}`, '_blank');
  _recruitData.followed = true;
  const btn = document.getElementById('followBtn');
  const submitBtn = document.getElementById('submitBtn');
  if (btn) {
    btn.innerHTML = "✓ SIGNAL VERIFIED";
    btn.style.borderColor = "var(--green)";
    btn.style.color = "var(--green)";
  }
  if (submitBtn) submitBtn.disabled = false;
  toast("X-Link Established", "success");
}

/* ── SUBMIT DOSSIER ─────────────────────── */
async function submitRecruitment() {
  const wallet = document.getElementById('recWallet').value.trim();
  const twitter = document.getElementById('recTwitter').value.trim();

  if (!_recruitData.followed) {
    toast("Follow the project to enable signal", "error");
    return;
  }
  if (!wallet.startsWith('0x') || wallet.length < 40) {
    toast("Invalid Wallet Signal", "error");
    return;
  }
  if (!twitter.startsWith('@')) {
    toast("ID must start with @", "warn");
    return;
  }

  const code = btoa(wallet.slice(-6)).substring(0, 6).toUpperCase();
  
  _recruitData = {
    ..._recruitData,
    wallet: wallet,
    twitter: twitter,
    refCode: code
  };

  localStorage.setItem('mr_recruit_session', JSON.stringify(_recruitData));
  toast(" Submitted!", "success");
  renderRecruitSuccess();
}

/* ── RENDER UI: ENTRY FORM ─────────────────────────── */
function renderRecruitUI() {
  const root = document.getElementById('bridge-content');
  root.innerHTML = `
    <div class="bridge-panel recruit-panel" style="max-width:500px; margin: 80px auto; padding: 40px; border: 1px solid #5d2a18; background: #0c0807; box-shadow: 0 0 30px rgba(139,69,19,0.15); position:relative">
      

      <div class="bridge-header" style="text-align:center; margin-bottom:30px">
        <div style="color:#8b4513; font-family:'Share Tech Mono'; font-size:0.7rem; letter-spacing:3px; text-transform:uppercase">Mission: Recruitment Phase</div>
        <h2 style="font-family:'Bebas Neue'; font-size:3.5rem; line-height:0.9; color:#eeeef8">JOIN THE<br><span style="color:#8b4513">RESISTANCE</span></h2>
        <p style="font-size:0.8rem; color:#6a6a9a; margin-top:10px">WL your position.</p>
      </div>

      <div class="field-row" style="margin-bottom:15px">
        <label style="font-size:0.6rem; color:#8b4513; display:block; margin-bottom:5px; letter-spacing:1px">1. ESTABLISH X-CONNECTION</label>
        <button id="followBtn" class="btn btn-outline" style="width:100%; border-color:#5d2a18; color:#8b4513" onclick="verifyFollow()">FOLLOW @MECHRANGERSNFT</button>
      </div>

      <div class="field-row" style="margin-bottom:15px">
        <label style="font-size:0.6rem; color:#8b4513; display:block; margin-bottom:5px; letter-spacing:1px">2. SUBMIT WALLET FOR WL </label>
        <input type="text" id="recWallet" class="field-in" placeholder="0x..." style="width:100%; text-align:center; border-color:#252540; background:rgba(0,0,0,0.3)">
      </div>

      <div class="field-row" style="margin-bottom:20px">
        <label style="font-size:0.6rem; color:#8b4513; display:block; margin-bottom:5px; letter-spacing:1px">3.YOUR X-HANDLE</label>
        <input type="text" id="recTwitter" class="field-in" placeholder="@username" style="width:100%; text-align:center; border-color:#252540; background:rgba(0,0,0,0.3)">
      </div>

      <button id="submitBtn" class="btn btn-gen" style="width:100%; background:#8b4513; border:none; box-shadow: 0 4px 15px rgba(0,0,0,0.4)" onclick="submitRecruitment()" disabled>FORGE ENROLLMENT</button>
      
      <p style="text-align:center; font-size:0.6rem; color:#4a4a72; margin-top:15px; text-transform:uppercase; letter-spacing:1px">Verify you're not a bot</p>
    </div>
  `;
}

/* ── RENDER UI: SUCCESS & REFERRAL ─────────────────── */
function renderRecruitSuccess() {
  const root = document.getElementById('bridge-content');
  const refLink = `${window.location.origin}?ref=${_recruitData.refCode}`;
  
  root.innerHTML = `
    <div class="bridge-panel recruit-panel" style="max-width:500px; margin: 80px auto; padding: 40px; border: 1px solid #8b4513; background: #0c0807;">
      <div style="text-align:center; color:var(--green); font-family:'Share Tech Mono'; font-size:0.7rem; margin-bottom:10px">● SIGNAL SECURED</div>
      <h2 style="text-align:center; font-family:'Bebas Neue'; font-size:3rem; line-height:1; color:#eeeef8">RECRUITMENT<br><span style="color:#8b4513">CONFIRMED</span></h2>
      
      <div style="background:rgba(139,69,19,0.05); padding:20px; border:1px dashed #8b4513; margin:20px 0; text-align:center">
        <div style="font-size:0.6rem; color:#6a6a9a"> YOUR REF LINK</div>
        <div style="font-size:1.8rem; font-family:'Share Tech Mono'; color:#8b4513; letter-spacing:6px">${_recruitData.refCode}</div>
      </div>

      <div style="margin-bottom:20px">
        <p style="font-size:0.8rem; color:#eeeef8; text-align:center">Rangers recruited via your link increase your <span style="color:var(--gold)">Mythic Drop Chance</span>.</p>
        <div class="field-row" style="margin-top:15px">
           <input type="text" readonly value="${refLink}" style="width:100%; background:rgba(0,0,0,0.5); border:1px solid #1c1c30; color:#6a6a9a; font-size:0.7rem; padding:12px; text-align:center; font-family:'Share Tech Mono'">
        </div>
      </div>

      <button class="btn btn-outline" style="width:100%; margin-bottom:10px; border-color:#5d2a18; color:#8b4513" onclick="copyRef('${refLink}')">COPY LINK</button>
      <button class="btn btn-gen" style="width:100%; background:#8b4513; border:none" onclick="tweetRef('${refLink}')">𝕏 ANNOUNCE ON SOCIALS</button>
      
      <div style="text-align:center; margin-top:25px">
        <button onclick="localStorage.clear(); location.reload();" style="background:none; border:none; color:#ff1744; font-size:0.6rem; cursor:pointer; text-decoration:underline; opacity:0.5">PURGE DOSSIER</button>
      </div>
    </div>
  `;
}

function copyRef(link) {
  navigator.clipboard.writeText(link);
  toast("Signal Link Copied", "info");
}

function tweetRef(link) {
  const text = encodeURIComponent(`I've just joined the @MechRangersNFT on @Base. Enroll now to secure your unit: `);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`, '_blank');
}
