/* ════───────────────────────────────────────────────────────────────────
     recruiter.js — Phase 1: Recruitment & Whitelisting
     Upgraded for: Sequential Registry (1-700 Free WL Logic)
     Theme: Rust & Carbon (Reddish Brown Premium)
════─────────────────────────────────────────────────────────────────── */

import { createClient } from '@supabase/supabase-js';
import { getRoast } from './roast.js';

// Securely pull environment variables via Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const _supabase = createClient(supabaseUrl, supabaseKey);

const RECRUIT_CONFIG = {
  twitterHandle: "MechRangersNFT",
  referralBonus: "Awareness Signal",
  targetNetwork: "Ethereum Mainnet",
  accentColor: "#8b4513", 
  rustColor: "#5d2a18",
  // ── SOCIAL TASKS: UPDATE LINKS FOR NEW MISSIONS HERE ──
  tasks: {
    twitter: {
      like: "https://x.com/intent/like?tweet_id=YOUR_TWEET_ID",
      repost: "https://x.com/intent/retweet?tweet_id=YOUR_TWEET_ID",
      quote: "https://x.com/intent/tweet?text=Joining%20the%20Resistance&url=YOUR_TWEET_URL"
    },
    discord: "COMING SOON, STAY TUNED" 
  }
};

let _recruitData = {
  wallet: null,
  twitter: null,
  referrals: 0,
  refCode: null,
  followed: false,
  rank: null
};

/* ── INITIALIZE RECRUITMENT ─────────────────────────── */
export async function initRecruiter() {
  const root = document.getElementById('bridge-content');
  const saved = localStorage.getItem('mr_recruit_session');
  
  if (root) {
      if (saved) {
        _recruitData = JSON.parse(saved);
        await syncReferralStats(); 
        renderRecruitSuccess();
      } else {
        renderRecruitUI();
      }
  }
}

/* ── BOT PREVENTION: VERIFY FOLLOW ─────────────────── */
export function verifyFollow() {
  const btn = document.getElementById('followBtn');
  const submitBtn = document.getElementById('submitBtn');
  
  window.open(`https://x.com/${RECRUIT_CONFIG.twitterHandle}`, '_blank');
  
  let seconds = 5;
  if (btn) {
      btn.disabled = true;
      btn.style.opacity = "0.7";
      
      const timer = setInterval(() => {
        btn.innerHTML = `SCANNING... ${seconds}S`;
        seconds--;
        
        if (seconds < 0) {
          clearInterval(timer);
          _recruitData.followed = true;
          btn.disabled = false;
          btn.style.opacity = "1";
          btn.innerHTML = "✓ CONNECTION VERIFIED";
          btn.style.borderColor = "#00e676";
          btn.style.color = "#00e676";
          
          if (submitBtn) submitBtn.disabled = false;
          if (typeof toast === 'function') toast("X-Link Established", "success");
        }
      }, 1000);
  }
}

/* ── SUBMIT DOSSIER (UPGRADED FOR SEQUENTIAL) ──────── */
export async function submitRecruitment() {
  const wallet = document.getElementById('recWallet').value.trim().toLowerCase();
  const twitter = document.getElementById('recTwitter').value.trim();
  const referrer = new URLSearchParams(window.location.search).get('ref');

  if (!_recruitData.followed) {
    if (typeof toast === 'function') toast("Follow on X first", "error");
    return;
  }
  if (!wallet.startsWith('0x') || wallet.length !== 42) {
    if (typeof toast === 'function') toast("Invalid Wallet Address", "error");
    return;
  }
  if (!twitter.startsWith('@')) {
    if (typeof toast === 'function') toast("Handle must start with @", "warn");
    return;
  }

  const code = wallet.slice(-4).toUpperCase() + Math.random().toString(36).substring(2, 4).toUpperCase();
  
  const { data: newEntry, error } = await _supabase
    .from('recruits')
    .insert([{
      wallet_address: wallet,
      twitter_handle: twitter,
      referral_code: code,
      referred_by: referrer, 
      has_followed: true
    }])
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') toast("Address already in !", "warn");
    else toast(" Offline", "error");
    return;
  }

  if (referrer) {
    _supabase.from('referrals').insert([{
        referrer_wallet: referrer,
        recruit_wallet: wallet
    }]);
  }

  _recruitData = { 
    wallet, 
    twitter, 
    refCode: code, 
    referrals: 0, 
    followed: true,
    rank: newEntry.id 
  };

  localStorage.setItem('mr_recruit_session', JSON.stringify(_recruitData));
  if (typeof toast === 'function') toast("Invites Confirmed!", "success");
  renderRecruitSuccess();
}

/* ── SYNC REFERRAL STATS ─────────────────────────── */
async function syncReferralStats() {
  if (!_recruitData.refCode) return;
  const { count, error } = await _supabase
    .from('recruits')
    .select('*', { count: 'exact', head: true })
    .eq('referred_by', _recruitData.refCode);

  if (!error) _recruitData.referrals = count;
}

/* ── RENDER UI: ENTRY FORM ─────────────────────────── */
export function renderRecruitUI() {
  const root = document.getElementById('bridge-content');
  if(!root) return;
  
  root.innerHTML = `
    <div class="bridge-panel recruit-panel" style="max-width:500px; margin: 80px auto; padding: 40px; border: 1px solid #5d2a18; background: #0c0807; box-shadow: 0 0 30px rgba(139,69,19,0.15); position:relative">
      <div class="bridge-header" style="text-align:center; margin-bottom:30px">
        <div style="color:#8b4513; font-family:'Share Tech Mono'; font-size:0.7rem; letter-spacing:3px; text-transform:uppercase">Mission: Recruitment Phase</div>
        <h2 style="font-family:'Bebas Neue'; font-size:3.5rem; line-height:0.9; color:#eeeef8">JOIN THE<br><span style="color:#8b4513">RESISTANCE</span></h2>
        <p style="font-size:0.8rem; color:#6a6a9a; margin-top:10px">Secure your WL for the 10,000 unit drop on Ethereum.</p>
      </div>

      <div style="margin: 20px 0; padding: 20px; border: 1px solid #5d2a18; background: rgba(0,0,0,0.4);">
        <div style="font-family:'Bebas Neue'; color:#8b4513; font-size:1.2rem; letter-spacing:2px; margin-bottom:15px; text-align:center">PRE-ENROLLMENT TASKS</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:15px">
          <button class="btn" style="font-size:0.6rem; padding:8px; background:#1da1f222; border:1px solid #1da1f2; color:#1da1f2; cursor:pointer" onclick="window.open('${RECRUIT_CONFIG.tasks.twitter.like}','_blank')">LIKE</button>
          <button class="btn" style="font-size:0.6rem; padding:8px; background:#1da1f222; border:1px solid #1da1f2; color:#1da1f2; cursor:pointer" onclick="window.open('${RECRUIT_CONFIG.tasks.twitter.repost}','_blank')">REPOST</button>
          <button class="btn" style="font-size:0.6rem; padding:8px; background:#1da1f222; border:1px solid #1da1f2; color:#1da1f2; cursor:pointer" onclick="window.open('${RECRUIT_CONFIG.tasks.twitter.quote}','_blank')">QUOTE</button>
        </div>
        <div style="text-align:center; font-family:'Share Tech Mono'; font-size:0.6rem; color:#6a6a9a; border-top:1px solid #5d2a18; padding-top:10px">
          DISCORD: <span style="color:#ff1744">${RECRUIT_CONFIG.tasks.discord}</span>
        </div>
      </div>

      <div class="field-row" style="margin-bottom:15px">
        <label style="font-size:0.6rem; color:#8b4513; display:block; margin-bottom:5px; letter-spacing:1px">1. ESTABLISH X-CONNECTION</label>
        <button id="followBtn" class="btn btn-outline" style="width:100%; border-color:#5d2a18; color:#8b4513; background:transparent; cursor:pointer" onclick="verifyFollow()">FOLLOW @MECHRANGERSNFT</button>
      </div>
      <div class="field-row" style="margin-bottom:15px">
        <label style="font-size:0.6rem; color:#8b4513; display:block; margin-bottom:5px; letter-spacing:1px">2. WALLET ADDRESS</label>
        <input type="text" id="recWallet" class="field-in" placeholder="0x..." style="width:100%; text-align:center; border-color:#252540; background:rgba(0,0,0,0.3); font-family:'Share Tech Mono'; color:#fff; padding:10px">
      </div>
      <div class="field-row" style="margin-bottom:20px">
        <label style="font-size:0.6rem; color:#8b4513; display:block; margin-bottom:5px; letter-spacing:1px">3. X-HANDLE</label>
        <input type="text" id="recTwitter" class="field-in" placeholder="@username" style="width:100%; text-align:center; border-color:#252540; background:rgba(0,0,0,0.3); color:#fff; padding:10px">
      </div>
      <button id="submitBtn" class="btn btn-gen" style="width:100%; background:#8b4513; border:none; padding:15px; cursor:pointer; color:#fff; font-family:'Bebas Neue'; font-size:1.2rem" onclick="submitRecruitment()" disabled>ENROLL IN GRID</button>
    </div>
  `;
}

/* ── RENDER UI: SUCCESS (UPGRADED STATUS) ──────────── */
export function renderRecruitSuccess() {
  const root = document.getElementById('bridge-content');
  if(!root) return;
  const refLink = `${window.location.origin}?ref=${_recruitData.refCode}`;

  const isFreeWL = (_recruitData.rank && _recruitData.rank <= 700);
  const phaseLabel = isFreeWL ? "FREE WL MINT" : "GTD PAID MINT";
  const allocationUnits = isFreeWL ? 1 : 2;
  const labelColor = isFreeWL ? "#00e676" : "#8b4513";

  let currentRoast = "LINK CONFIRMED...";
  let tier = _recruitData.referrals > 50 ? 'legendary' : (_recruitData.referrals > 10 ? 'threat' : 'parasite');

  if (typeof getRoast === 'function') {
      currentRoast = getRoast('welcome', tier, { 
        user: _recruitData.twitter || "Operative", 
        count: _recruitData.referrals 
      });
  }
  
  root.innerHTML = `
    <div class="bridge-panel recruit-panel" style="max-width:500px; margin: 80px auto; padding: 40px; border: 1px solid #8b4513; background: #0c0807;">
      <h2 style="text-align:center; font-family:'Bebas Neue'; font-size:3rem; line-height:1; color:#eeeef8"> CLEARANCE<br><span style="color:${labelColor}">${phaseLabel}</span></h2>
      
      <div style="background:rgba(139,69,19,0.08); padding:25px; border:1px solid #8b4513; margin:25px 0; text-align:center;">
        <div style="margin-bottom:20px; border-bottom:1px solid rgba(139,69,19,0.3); padding-bottom:15px">
            <div style="font-size:1.1rem; font-family:'Share Tech Mono'; color:#ffab91; font-style:italic;">"${currentRoast.toUpperCase()}"</div>
        </div>
        <div style="font-size:0.6rem; color:#8b4513; letter-spacing:2px; margin-bottom:5px">ALLOCATION: ${allocationUnits} UNIT(S)</div>
        <div style="font-size:2rem; font-family:'Share Tech Mono'; color:#8b4513; letter-spacing:8px;">${_recruitData.refCode}</div>
        <div style="font-size:0.5rem; color:#6a6a9a; margin-top:10px">Rank: #${_recruitData.rank || 'Pending'}</div>
      </div>

      <div style="margin: 20px 0; padding: 20px; border: 1px solid #5d2a18; background: rgba(0,0,0,0.4);">
        <div style="font-family:'Bebas Neue'; color:#8b4513; font-size:1.2rem; letter-spacing:2px; margin-bottom:15px; text-align:center">SOCIAL MISSIONS</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:15px">
          <button class="btn" style="font-size:0.6rem; padding:8px; background:#1da1f222; border:1px solid #1da1f2; color:#1da1f2; cursor:pointer" onclick="window.open('${RECRUIT_CONFIG.tasks.twitter.like}','_blank')">LIKE</button>
          <button class="btn" style="font-size:0.6rem; padding:8px; background:#1da1f222; border:1px solid #1da1f2; color:#1da1f2; cursor:pointer" onclick="window.open('${RECRUIT_CONFIG.tasks.twitter.repost}','_blank')">REPOST</button>
          <button class="btn" style="font-size:0.6rem; padding:8px; background:#1da1f222; border:1px solid #1da1f2; color:#1da1f2; cursor:pointer" onclick="window.open('${RECRUIT_CONFIG.tasks.twitter.quote}','_blank')">QUOTE</button>
        </div>
      </div>

      <div class="field-row">
           <input type="text" readonly value="${refLink}" style="width:100%; background:rgba(0,0,0,0.5); border:1px solid #1c1c30; color:#6a6a9a; font-size:0.7rem; padding:12px; text-align:center;">
      </div>
      <button class="btn btn-outline" style="width:100%; margin: 10px 0; color:#8b4513; border-color:#5d2a18; background:transparent; padding:10px; cursor:pointer" onclick="copyRef('${refLink}')">COPY INVITE LINK</button>
      <button class="btn btn-gen" style="width:100%; background:#8b4513; border:none; padding:15px; cursor:pointer; color:#fff; font-family:'Bebas Neue'" onclick="tweetRef('${refLink}', '${phaseLabel}')">𝕏 SHARE TO X</button>
      
      <div style="margin-top:25px; font-size:0.6rem; color:#6a6a9a; text-align:center; font-family:'Share Tech Mono'">
        SUCCESSFUL RECRUITS: <span style="color:#8b4513">${_recruitData.referrals}</span> | MINT WILL BE ON: ETH
      </div>

      <div style="text-align:center; margin-top:25px">
        <button onclick="localStorage.clear(); location.reload();" style="color:#ff1744; font-size:0.6rem; cursor:pointer; background:none; border:none; opacity:0.5">RETURN HOME</button>
      </div>
    </div>
  `;
}

export function copyRef(link) {
  navigator.clipboard.writeText(link);
  if (typeof toast === 'function') toast("Invite Link Copied", "info");
}

export function tweetRef(link, phase) {
  const text = encodeURIComponent(`I've secured my WL for the @MechRangersNFT drop on Ethereum. \n\nStatus: ${phase}\n\nRegister here: `);
  window.open(`https://x.com/intent/tweet?text=${text}&url=${encodeURIComponent(link)}`, '_blank');
}

window.verifyFollow = verifyFollow;
window.submitRecruitment = submitRecruitment;
window.copyRef = copyRef;
window.tweetRef = tweetRef;
