/* ═══════════════════════════════════════════════════════
   ui.js — Grid · Cards · Stats · Filters · Tabs · Toasts
   Upgraded: Parallax Card Depth & Performance Ticking
   Depends on: traits.js, generator.js, renderer.js
   ═══════════════════════════════════════════════════════ */

/* ── ACTIVE FILTER STATE ── */
let activeFilter = 'all';

/* ─────────────────────────────────────────────
   TOASTS
───────────────────────────────────────────── */
function toast(msg, type = 'info') {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const el   = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-dot"></div>${msg}`;
  wrap.appendChild(el);
  
  requestAnimationFrame(() => el.style.opacity = '1');
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }, 3500);
}

/* ─────────────────────────────────────────────
   TRAIT DOT COLOUR
───────────────────────────────────────────── */
function dotColor(traitKey, val) {
  const palette = {
    legendary: '#ffc400', 
    mythic:    '#ff00ff', 
    epic:      '#b44fff', 
    rare:      '#00e5ff', 
    uncommon:  '#00e676', 
    common:    '#4a4a72', 
  };
  
  const opt = TRAITS[traitKey]?.options.find(o => o.val === val);
  if (!opt) return palette.common;
  if (opt.tier) return palette[opt.tier.toLowerCase()] || palette.common;
  if (opt.weight <= 3)  return palette.legendary;
  if (opt.weight <= 6)  return palette.epic;
  if (opt.weight <= 10) return palette.rare;
  if (opt.weight <= 15) return palette.uncommon;
  return palette.common;
}

/* ─────────────────────────────────────────────
   NFT CARD
───────────────────────────────────────────── */
function createCard(nft) {
  const svg  = renderSVG(nft, 260);
  const card = document.createElement('div');
  card.className     = `nft-card ${nft.rarity}`;
  card.setAttribute('data-tier', nft.rarity);
  card.style.animationDelay = `${(Math.random() * .25).toFixed(2)}s`;

  card.onmousemove = (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = ((x - xc) / xc) * 10;
    const dy = ((y - yc) / yc) * -10;
    card.style.transform = `perspective(600px) rotateY(${dx}deg) rotateX(${dy}deg) scale(1.02)`;
  };
  card.onmouseleave = () => {
    card.style.transform = `perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)`;
  };

  const dots = Object.entries(nft.traits)
    .map(([k, v]) =>
      `<div class="tdot"
         style="background:${dotColor(k, v.val)}; box-shadow: 0 0 5px ${dotColor(k, v.val)}88"
         title="${TRAITS[k]?.name}: ${v.label}">
       </div>`)
    .join('');

  card.innerHTML = `
    <div class="rbadge ${nft.rarity}">${nft.rarity.toUpperCase()}</div>
    <div class="tokbadge">#${String(nft.id).padStart(4,'0')}</div>
    <div class="card-art">${svg}</div>
    <div class="card-info">
      <div class="card-row">
        <div>
          <div class="card-name">${nft.name}</div>
          <div class="card-sub">${nft.traits.suit.label}</div>
        </div>
        <div class="card-score">${nft.score}</div>
      </div>
      <div class="tdots">${dots}</div>
    </div>`;

  card.onclick = () => openModal(nft);
  return card;
}

/* ─────────────────────────────────────────────
   STATS BAR (CORE SYNC)
───────────────────────────────────────────── */
function updateStats() {
  const count = allNFTs.length;
  const sTot = document.getElementById('sTot');
  if (sTot) sTot.textContent = count.toLocaleString();
  
  const sMyth = document.getElementById('sMyth');
  if (sMyth) sMyth.textContent = (mintedCount.mythic || 0).toLocaleString();

  const sLeg = document.getElementById('sLeg');
  if (sLeg) sLeg.textContent = (mintedCount.legendary || 0).toLocaleString();
  
  const sEpic = document.getElementById('sEpic');
  if (sEpic) sEpic.textContent = (mintedCount.epic || 0).toLocaleString();
  
  const sUniq = document.getElementById('sUniq');
  if (sUniq) sUniq.textContent = (typeof hashSet !== 'undefined' ? hashSet.size : count).toLocaleString();
  
  const bbCount = document.getElementById('bbCount');
  if (bbCount) bbCount.textContent = count.toLocaleString();
  
  const bbLeg = document.getElementById('bbLeg');
  if (bbLeg) bbLeg.textContent = (mintedCount.legendary || 0).toLocaleString();

  const TIERS = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
  TIERS.forEach(r => {
    const countVal = (mintedCount[r] || 0);
    const countEl = document.getElementById('cnt-' + r);
    if (countEl) countEl.textContent = countVal.toLocaleString();
    
    const cap = (typeof SUPPLY_CAPS !== 'undefined') ? SUPPLY_CAPS[r] : 2000;
    const pct = Math.min(100, (countVal / cap * 100)).toFixed(1);
    const capEl = document.getElementById('cap-' + r);
    if (capEl) {
       capEl.style.background = `linear-gradient(90deg, rgba(255,255,255,.08) ${pct}%, transparent ${pct}%)`;
    }
  });

  if (count > 0) {
    const bBar = document.getElementById('bottomBar');
    if (bBar) bBar.classList.add('show');
    const fRow = document.getElementById('filterRow');
    if (fRow) fRow.style.display = 'flex';
  }

  updateRarityBar();
}

/* ─────────────────────────────────────────────
   RARITY BREAKDOWN BAR
───────────────────────────────────────────── */
function updateRarityBar() {
  const t = allNFTs.length || 1;
 ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'].forEach(r => {
    const el = document.getElementById('prb-' + r);
    if (el) {
       el.style.width = ((mintedCount[r] || 0) / t * 100).toFixed(2) + '%';
    }
  });
}

/* ─────────────────────────────────────────────
   NFT GRID
───────────────────────────────────────────── */
function renderGrid(limit = 240) {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';

  const toShow = activeFilter === 'all'
    ? allNFTs
    : allNFTs.filter(n => n.rarity === activeFilter);

  if (!toShow.length) {
    grid.innerHTML = `<div class="empty"><h2>NO ${activeFilter.toUpperCase()} MECHS</h2></div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  toShow.slice(-limit).reverse().forEach(n => frag.appendChild(createCard(n)));
  grid.appendChild(frag);
}

/* ─────────────────────────────────────────────
   FILTER
───────────────────────────────────────────── */
function setFilter(f, btn) {
  activeFilter = f;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGrid();
}

/* ─────────────────────────────────────────────
   TABS
───────────────────────────────────────────── */
function switchTab(idx, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  const targetPanel = document.getElementById('panel' + idx);
  if (targetPanel) targetPanel.classList.add('active');
  btn.classList.add('active');
  if (idx === 1) buildRarityEngine();
}

/* ─────────────────────────────────────────────
   GENERATE ACTIONS
───────────────────────────────────────────── */
function genOne() {
  if (allNFTs.length >= 10000) return;
  const nft = generateNFT();
  if (!nft) return;
  allNFTs.push(nft);
  updateStats();
  renderGrid();
}

function genBatch() {
  if (window.isGenerating) return;
  const batchN = document.getElementById('batchN');
  const n = Math.min(parseInt(batchN ? batchN.value : 24) || 24, 200, 10000 - allNFTs.length);
  for (let i = 0; i < n; i++) {
    const nft = generateNFT();
    if (nft) allNFTs.push(nft);
  }
  updateStats();
  renderGrid();
}

function genAll() {
  if (window.isGenerating || allNFTs.length >= 10000) return;
  window.isGenerating = true;
  const targetSupply = 10000;
  const pWrap = document.getElementById('progWrap');
  if (pWrap) pWrap.classList.add('on');

  const tick = () => {
    let mintedInThisBatch = 0;
    while (mintedInThisBatch < 350 && allNFTs.length < targetSupply) {
      const nft = generateNFT();
      if (nft) {
        allNFTs.push(nft);
        mintedInThisBatch++;
      } else break;
    }

    const currentTotal = allNFTs.length;
    const pct = (currentTotal / targetSupply * 100).toFixed(1);
    
    const pFill = document.getElementById('progFill');
    if (pFill) pFill.style.width = pct + '%';
    
    const pTxt = document.getElementById('progTxt');
    if (pTxt) pTxt.textContent = `FORGING... ${currentTotal.toLocaleString()} / 10,000 (${pct}%)`;

    // SYNC EVERY TICK
    updateStats();

    // DOM rendering remains throttled for performance
    if (currentTotal % 500 === 0 || currentTotal >= targetSupply) {
      renderGrid(60); 
    }

    if (allNFTs.length < targetSupply && mintedInThisBatch > 0) {
      requestAnimationFrame(tick);
    } else {
      window.isGenerating = false;
      updateStats(); // FINAL SYNC
      renderGrid(240);  
      if (pTxt) pTxt.textContent = `✓ COLLECTION COMPLETE — ${allNFTs.length} MECHS FORGED`;
      setTimeout(() => { if (pWrap) pWrap.classList.remove('on'); }, 4000);
    }
  };
  requestAnimationFrame(tick);
}

function clearAll() {
  if (!confirm('DANGER: Wipe all?')) return;
  if (typeof resetGeneratorState === 'function') resetGeneratorState();
  allNFTs = [];
  Object.keys(mintedCount).forEach(k => mintedCount[k] = 0);
  if (typeof hashSet !== 'undefined') hashSet.clear();
  updateStats();
  renderGrid();
}

/* ─────────────────────────────────────────────
   RARITY ENGINE PANEL
───────────────────────────────────────────── */
function buildRarityEngine() {
  const grid = document.getElementById('rarityEngineGrid');
  if(!grid) return;
  const caps = (typeof SUPPLY_CAPS !== 'undefined') ? SUPPLY_CAPS : {
    mythic: 20, legendary: 100, epic: 900, rare: 2000, uncommon: 3000, common: 3880
  };
  const TIERS = [
    { key:'mythic', label:'MYTHIC', col:'var(--mythic)', cap:caps.mythic },
    { key:'legendary', label:'LEGENDARY', col:'var(--gold)', cap:caps.legendary },
    { key:'epic', label:'EPIC', col:'var(--purple)', cap:caps.epic },
    { key:'rare', label:'RARE', col:'var(--cyan)', cap:caps.rare },
    { key:'uncommon', label:'UNCOMMON', col:'var(--green)', cap:caps.uncommon },
    { key:'common', label:'COMMON', col:'var(--muted2)', cap:caps.common },
  ];
  grid.innerHTML = TIERS.map(t => `
    <div class="rarity-card ${t.key}">
      <div class="rc-header"><div class="rc-name">${t.label}</div><div class="rc-count">${mintedCount[t.key] || 0} / ${t.cap}</div></div>
      <div class="rc-bar-bg"><div class="rc-bar-fill" style="width:${((mintedCount[t.key]||0)/t.cap*100).toFixed(1)}%; background:${t.col}"></div></div>
    </div>`).join('');
}

/* ─────────────────────────────────────────────
   INITIALIZATION (PREVENTS AUTO-GENERATION)
───────────────────────────────────────────── */
function initDashboard() {
  console.log("Mech Rangers Admin Ready. Waiting for user input.");
  updateStats();
}

window.addEventListener('DOMContentLoaded', initDashboard);

/* ─────────────────────────────────────────────
   UPGRADE: ACTION FEED & VFX
───────────────────────────────────────────── */

/**
 * Logs UI events to a floating debug feed for Web3-style transparency.
 */
function logAction(msg, level = 'info') {
  const feed = document.getElementById('actionFeed') || createActionFeed();
  const entry = document.createElement('div');
  entry.className = `feed-entry ${level}`;
  entry.innerHTML = `<span class="timestamp">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
  feed.prepend(entry);
  if (feed.childNodes.length > 10) feed.lastChild.remove();
}

function createActionFeed() {
  const feed = document.createElement('div');
  feed.id = 'actionFeed';
  feed.style.cssText = `
    position: fixed; bottom: 80px; left: 20px; z-index: 9999;
    font-family: 'Courier New', monospace; font-size: 10px;
    color: rgba(255,255,255,0.4); pointer-events: none;
  `;
  document.body.appendChild(feed);
  return feed;
}

/**
 * ─── UPGRADE: MINTING OVERLAY ───
 * Adds a high-tech glassmorphism effect during batch generation.
 */
const originalGenAll = genAll;
genAll = function() {
  logAction("CRITICAL: FULL FORGE INITIATED", "warn");
  document.body.classList.add('forging-mode');
  originalGenAll();
};

/**
 * ─── UPGRADE: DYNAMIC TOOLTIPS ───
 * Injects attribute score breakdown into cards on hover.
 */
function injectScoreBreakdown(card, nft) {
  const breakdown = `ATK: ${nft.stats?.atk || '??'} | DEF: ${nft.stats?.def || '??'}`;
  card.setAttribute('title', breakdown);
}
