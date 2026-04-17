/* ═══════════════════════════════════════════════════════
     recruiter.js — Phase 1: Recruitment & Whitelisting
     Handles wallet submission, X-verification, and Referrals
     Theme: Rust & Carbon (Reddish Brown Premium)
═══════════════════════════════════════════════════════ */

const RECRUIT_CONFIG = {
  twitterHandle: "MechRangersNFT",
  referralBonus: "Boosts Mythic Chance",
  targetNetwork: "Base Mainnet",
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
  const btn = document.getElementById('followBtn');
  const submitBtn = document.getElementById('submitBtn');
  
  // Open the X link
  window.open(`https://x.com/MechRangersNFT`, '_blank');
  
  // Start countdown
  let seconds = 5;
  btn.disabled = true;
  btn.style.opacity = "0.7";
  
  const timer = setInterval(() => {
    btn.innerHTML = `VERIFYING... ${seconds}S`;
    seconds--;
    
    if (seconds < 0) {
      clearInterval(timer);
      _recruitData.followed = true;
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.innerHTML = " VERIFIED";
      btn.style.borderColor = "var(--green)";
      btn.style.color = "var(--green)";
      
      if (submitBtn) submitBtn.disabled = false;
      if (typeof toast === 'function') toast("X-Link Established", "success");
    }
  }, 1000);
}

/* ── SUBMIT DOSSIER ─────────────────────── */
async function submitRecruitment() {
  const wallet = document.getElementById('recWallet').value.trim();
  const twitter = document.getElementById('recTwitter').value.trim();

  if (!_recruitData.followed) {
    if (typeof toast === 'function') toast("Follow on X", "error");
    return;
  }
  if (!wallet.startsWith('0x') || wallet.length < 42) {
    if (typeof toast === 'function') toast("Invalid Wallet Signal", "error");
    return;
  }
  if (!twitter.startsWith('@')) {
    if (typeof toast === 'function') toast("ID must start with @", "warn");
    return;
  }

  // Generate a cleaner 6-digit alpha-numeric ref code
  const code = wallet.slice(-4).toUpperCase() + Math.random().toString(36).substring(2, 4).toUpperCase();
  
  _recruitData = {
    ..._recruitData,
    wallet: wallet,
    twitter: twitter,
    refCode: code
  };

  localStorage.setItem('mr_recruit_session', JSON.stringify(_recruitData));
  if (typeof toast === 'function') toast(" Submitted!", "success");
  renderRecruitSuccess();
}

/* ── RENDER UI: ENTRY FORM ─────────────────────────── */
function renderRecruitUI() {
  const root = document.getElementById('bridge-content');
  if(!root) return;
  
  root.innerHTML = `
    <div class="bridge-panel recruit-panel" style="max-width:500px; margin: 80px auto; padding: 40px; border: 1px solid #5d2a18; background: #0c0807; box-shadow: 0 0 30px rgba(139,69,19,0.15); position:relative">
      
      <div class="bridge-header" style="text-align:center; margin-bottom:30px">
        <div style="color:#8b4513; font-family:'Share Tech Mono'; font-size:0.7rem; letter-spacing:3px; text-transform:uppercase">Mission: Recruitment Phase</div>
        <h2 style="font-family:'Bebas Neue'; font-size:3.5rem; line-height:0.9; color:#eeeef8">JOIN THE<br><span style="color:#8b4513">RESISTANCE</span></h2>
        <p style="font-size:0.8rem; color:#6a6a9a; margin-top:10px">Secure your position on the MECH RANGERS Whitelist.</p>
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
        <label style="font-size:0.6rem; color:#8b4513; display:block; margin-bottom:5px; letter-spacing:1px">3. YOUR X-HANDLE</label>
        <input type="text" id="recTwitter" class="field-in" placeholder="@username" style="width:100%; text-align:center; border-color:#252540; background:rgba(0,0,0,0.3)">
      </div>

      <button id="submitBtn" class="btn btn-gen" style="width:100%; background:#8b4513; border:none; box-shadow: 0 4px 15px rgba(0,0,0,0.4)" onclick="submitRecruitment()" disabled>FORGE ENROLLMENT</button>
      
      <div style="margin-top:20px; padding:16px; border:1px dashed #1c1c30; background:rgba(93,42,24,0.05); text-align:center; border-radius:2px">
        <div style="font-size:0.55rem; color:#5d2a18; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px"> Discord Channel</div>
        <div style="font-family:'Bebas Neue'; font-size:1.4rem; color:#3a3a5a; letter-spacing:4px">COMING SOON</div>
        <div style="font-size:0.6rem; color:#4a4a72; margin-top:4px">Join when the gates open — stay tuned on X</div>
      </div>
      <p style="text-align:center; font-size:0.6rem; color:#4a4a72; margin-top:15px; text-transform:uppercase; letter-spacing:1px">Verification ensures integrity</p>
    </div>
  `;
}

/* ── RENDER UI: SUCCESS & REFERRAL ─────────────────── */
function renderRecruitSuccess() {
  const root = document.getElementById('bridge-content');
  if(!root) return;
  const refLink = `${window.location.origin}?ref=${_recruitData.refCode}`;

  // ROAST GENERATION
  let currentRoast = "SYSTEM ONLINE...";
  if (typeof getRoast === 'function') {
      currentRoast = getRoast('welcome', 'parasite', { 
        user: _recruitData.twitter || "Operative", 
        count: _recruitData.referrals 
      });
  }
  
  root.innerHTML = `
    <div class="bridge-panel recruit-panel" style="max-width:500px; margin: 80px auto; padding: 40px; border: 1px solid #8b4513; background: #0c0807;">
      <div style="text-align:center; color:var(--green); font-family:'Share Tech Mono'; font-size:0.7rem; margin-bottom:10px"> INVITATION</div>
      <h2 style="text-align:center; font-family:'Bebas Neue'; font-size:3rem; line-height:1; color:#eeeef8"> LINK<br><span style="color:#8b4513">CONFIRMED</span></h2>
      
      <div style="background:rgba(139,69,19,0.08); padding:25px; border:1px solid #8b4513; margin:25px 0; text-align:center; position:relative; overflow:hidden">
        
        <div style="margin-bottom:20px; border-bottom:1px solid rgba(139,69,19,0.3); padding-bottom:15px">
            <div style="font-size:0.55rem; color:#8b4513; letter-spacing:2px; margin-bottom:8px; text-transform:uppercase; font-weight:bold">[ AI_CORE_EVALUATION ]</div>
            <div style="font-size:1.1rem; font-family:'Share Tech Mono'; color:#ffab91; line-height:1.3; font-style:italic; text-shadow: 0 0 10px rgba(139,69,19,0.4)">
               "${currentRoast.toUpperCase()}"
            </div>
        </div>

        <div style="font-size:0.6rem; color:#6a6a9a; letter-spacing:1px; text-transform:uppercase">Your Invite Code</div>
        <div style="font-size:2rem; font-family:'Share Tech Mono'; color:#8b4513; letter-spacing:8px; font-weight:bold; margin-top:5px">${_recruitData.refCode}</div>
      </div>

      <div style="margin-bottom:20px">
        <p style="font-size:0.8rem; color:#eeeef8; text-align:center">Invites found via your link increase your <span style="color:var(--gold)">WL drop Chance</span>.</p>
        <div class="field-row" style="margin-top:15px">
           <input type="text" readonly value="${refLink}" style="width:100%; background:rgba(0,0,0,0.5); border:1px solid #1c1c30; color:#6a6a9a; font-size:0.7rem; padding:12px; text-align:center; font-family:'Share Tech Mono'">
        </div>
      </div>

      <button class="btn btn-outline" style="width:100%; margin-bottom:10px; border-color:#5d2a18; color:#8b4513" onclick="copyRef('${refLink}')">COPY LINK</button>
      <button class="btn btn-gen" style="width:100%; background:#8b4513; border:none" onclick="tweetRef('${refLink}')">𝕏 ANNOUNCE ON SOCIALS</button>
      
      <div style="margin-top:25px; border-top:1px solid #1c1c30; padding-top:20px">
        <div style="font-size:0.55rem; color:#8b4513; letter-spacing:2px; margin-bottom:12px; text-transform:uppercase">⬡ Operative Tasks</div>
        <div class="task-item" style="display:flex; align-items:center; gap:10px; margin-bottom:8px; font-size:0.7rem; color:#6a6a9a">
          <span style="color:var(--green)">✓</span> Follow @MechRangersNFT on X
        </div>
        <div class="task-item" style="display:flex; align-items:center; gap:10px; margin-bottom:8px; font-size:0.7rem; color:#6a6a9a">
          <span style="color:var(--green)">✓</span> Submit wallet to whitelist
        </div>
        <div class="task-item" style="display:flex; align-items:center; gap:10px; margin-bottom:8px; font-size:0.7rem; color:#4a4a72">
          <span style="color:#5d2a18">○</span> Recruit 1 operative via referral link
        </div>
        <div class="task-item" style="display:flex; align-items:center; gap:10px; margin-bottom:8px; font-size:0.7rem; color:#4a4a72">
          <span style="color:#5d2a18">○</span> Join Discord when live
        </div>
        <div class="task-item" style="display:flex; align-items:center; gap:10px; font-size:0.7rem; color:#4a4a72">
          <span style="color:#5d2a18">○</span> Share your invite on X to boost WL odds
        </div>
      </div>

      <div style="text-align:center; margin-top:25px">
        <button onclick="localStorage.clear(); location.reload();" style="background:none; border:none; color:#ff1744; font-size:0.6rem; cursor:pointer; text-decoration:underline; opacity:0.5">RETURN</button>
      </div>
    </div>
  `;
}

function copyRef(link) {
  navigator.clipboard.writeText(link);
  if (typeof toast === 'function') toast("Signal Link Copied", "info");
}

function tweetRef(link) {
  const text = encodeURIComponent(`I've joined the @MechRangersNFT resistance on @Base. Enroll now to secure your WL and boost your strength: `);
  window.open(`https://x.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`, '_blank');
}
