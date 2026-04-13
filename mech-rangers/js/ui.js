/* ═══════════════════════════════════════════════════════
   ui.js — Grid · Cards · Stats · Filters · Tabs · Toasts
   Depends on: traits.js, generator.js, renderer.js
   ═══════════════════════════════════════════════════════ */

/* ── ACTIVE FILTER STATE ── */
let activeFilter = 'all';

/* ─────────────────────────────────────────────
   TOASTS
───────────────────────────────────────────── */
function toast(msg, type = 'info') {
  const wrap = document.getElementById('toastWrap');
  const el   = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-dot"></div>${msg}`;
  wrap.appendChild(el);
  
  // Upgrade: Use requestAnimationFrame for smoother entry
  requestAnimationFrame(() => el.style.opacity = '1');
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }, 3500);
}

/* ─────────────────────────────────────────────
   TRAIT DOT COLOUR
   Maps a trait's tier metadata or weight bucket → colour string.
───────────────────────────────────────────── */
function dotColor(traitKey, val) {
  const palette = {
    legendary: '#ffc400', // Gold
    mythic:    '#ff00ff', // Neon Pink/Purple
    epic:      '#b44fff', // Purple
    rare:      '#00e5ff', // Cyan
    uncommon:  '#00e676', // Green
    common:    '#4a4a72', // Slate
  };
  
  const opt = TRAITS[traitKey]?.options.find(o => o.val === val);
  if (!opt) return palette.common;

  // Upgrade: Prioritize explicit Tier metadata from traits.js
  if (opt.tier) return palette[opt.tier.toLowerCase()] || palette.common;

  // Fallback: Original weight-based logic
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
   STATS BAR
───────────────────────────────────────────── */
function updateStats() {
  document.getElementById('sTot').textContent  = allNFTs.length.toLocaleString();
  document.getElementById('sLeg').textContent  = mintedCount.legendary;
  document.getElementById('sEpic').textContent = mintedCount.epic;
  document.getElementById('sUniq').textContent = hashSet.size.toLocaleString();
  document.getElementById('bbCount').textContent = allNFTs.length;
  document.getElementById('bbLeg').textContent   = mintedCount.legendary;

  // Cap pill fill (background gradient as fill indicator)
  const TIERS = ['legendary','epic','rare','uncommon','common'];
  TIERS.forEach(r => {
    const countEl = document.getElementById('cnt-' + r);
    if (countEl) countEl.textContent = mintedCount[r];
    
    const pct = (mintedCount[r] / SUPPLY_CAPS[r] * 100).toFixed(1);
    const capEl = document.getElementById('cap-' + r);
    if (capEl) {
       capEl.style.background = `linear-gradient(90deg, rgba(255,255,255,.08) ${pct}%, transparent ${pct}%)`;
       capEl.setAttribute('title', `${pct}% of ${r} supply minted`);
    }
  });

  if (allNFTs.length > 0) {
    document.getElementById('bottomBar').classList.add('show');
    document.getElementById('filterRow').style.display = 'flex';
    // Refresh previews if export panel is visible
    if (typeof updateSVGPreview === 'function') updateSVGPreview();
    if (typeof updateMetaPreview === 'function') updateMetaPreview();
    if (typeof updateMintSim === 'function') updateMintSim();
  }

  updateRarityBar();
}

/* ─────────────────────────────────────────────
   RARITY BREAKDOWN BAR (below progress)
───────────────────────────────────────────── */
function updateRarityBar() {
  const t = allNFTs.length || 1;
  ['legendary','epic','rare','uncommon','common'].forEach(r => {
    const el = document.getElementById('prb-' + r);
    if (el) {
       // Upgrade: Add CSS transitions to the width change
       el.style.transition = 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
       el.style.width = (mintedCount[r] / t * 100).toFixed(2) + '%';
    }
  });
}

/* ─────────────────────────────────────────────
   NFT GRID
───────────────────────────────────────────── */
function renderGrid() {
  const grid   = document.getElementById('grid');
  grid.innerHTML = '';

  const toShow = activeFilter === 'all'
    ? allNFTs
    : allNFTs.filter(n => n.rarity === activeFilter);

  if (!toShow.length) {
    grid.innerHTML = `
      <div class="empty">
        <h2 style="letter-spacing: 5px; color: var(--muted2)">NO ${activeFilter.toUpperCase()} MECHS</h2>
        <p>Forge more units to deploy the ${activeFilter} tier</p>
      </div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  // Show latest 240 to keep DOM lightweight
  toShow.slice(-240).reverse().forEach(n => frag.appendChild(createCard(n)));
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
  
  // Lazy-build heavier panels only when visited
  if (idx === 1) buildRarityEngine();
  if (idx === 3 && typeof buildContractCode === 'function') buildContractCode();
}

/* ─────────────────────────────────────────────
   GENERATE ACTIONS
───────────────────────────────────────────── */
function genOne() {
  if (allNFTs.length >= 10000) { toast('10,000 limit reached!', 'warn'); return; }
  const nft = generateNFT();
  if (!nft) { toast('All rarity tiers capped!', 'warn'); return; }
  allNFTs.push(nft);
  updateStats();
  const grid = document.getElementById('grid');
  if (grid.querySelector('.empty')) grid.innerHTML = '';
  if (activeFilter === 'all' || activeFilter === nft.rarity) {
     grid.prepend(createCard(nft));
  }
}

function genBatch() {
  if (window.isGenerating) return;
  const batchInput = document.getElementById('batchN');
  const n = Math.min(
    parseInt(batchInput.value) || 24,
    200,
    10000 - allNFTs.length
  );
  if (n <= 0) { toast('At maximum supply!', 'warn'); return; }
  let added = 0;
  for (let i = 0; i < n; i++) {
    if (allNFTs.length >= 10000) break;
    const nft = generateNFT();
    if (!nft) break;
    allNFTs.push(nft);
    added++;
  }
  if (added) toast(`${added} mechs forged!`, 'success');
  updateStats();
  renderGrid();
}

function genAll() {
  if (window.isGenerating) return;
  window.isGenerating = true;
  const rem = 10000 - allNFTs.length;
  if (!rem) { window.isGenerating = false; toast('Collection complete!', 'warn'); return; }

  document.getElementById('progWrap').classList.add('on');
  let done  = 0;
  const batchSize = 400;

  const tick = () => {
    const n = Math.min(batchSize, rem - done);
    for (let i = 0; i < n; i++) {
      if (allNFTs.length >= 10000) break;
      const nft = generateNFT();
      if (!nft) break;
      allNFTs.push(nft);
      done++;
    }

    const pct = (allNFTs.length / 10000 * 100).toFixed(1);
    document.getElementById('progFill').style.width = pct + '%';
    document.getElementById('progTxt').textContent  =
      `FORGING... ${allNFTs.length.toLocaleString()} / 10,000 (${pct}%) — ` +
      `LEG:${mintedCount.legendary} EPIC:${mintedCount.epic} RARE:${mintedCount.rare}`;
    
    updateStats();

    if (allNFTs.length < 10000 && done < rem) {
      requestAnimationFrame(tick);
    } else {
      window.isGenerating = false;
      renderGrid();
      document.getElementById('progTxt').textContent =
        `✓ COLLECTION COMPLETE — ${allNFTs.length.toLocaleString()} MECHS FORGED`;
      toast('10K collection complete! 🔥', 'success');
      setTimeout(() => document.getElementById('progWrap').classList.remove('on'), 4000);
    }
  };

  requestAnimationFrame(tick);
}

function clearAll() {
  if (!confirm('DANGER: Clear all generated NFTs? This cannot be undone.')) return;
  if (typeof resetGeneratorState === 'function') resetGeneratorState();
  
  document.getElementById('grid').innerHTML = `
    <div class="empty">
      <h2>NO MECHS DEPLOYED</h2>
      <p>Hit GENERATE BATCH to forge your warriors</p>
    </div>`;
    
  document.getElementById('bottomBar').classList.remove('show');
  document.getElementById('filterRow').style.display = 'none';
  updateStats();
  toast('Collection wiped from local memory', 'info');
}

/* ─────────────────────────────────────────────
   RARITY ENGINE PANEL (Panel 2)
───────────────────────────────────────────── */
function buildRarityEngine() {
  const grid = document.getElementById('rarityEngineGrid');
  if(!grid) return;

  const TIERS = [
    { key:'legendary', label:'LEGENDARY', col:'var(--gold)',   cap:100,  pct:'1%'  },
    { key:'epic',      label:'EPIC',      col:'var(--purple)', cap:900,  pct:'9%'  },
    { key:'rare',      label:'RARE',      col:'var(--cyan)',   cap:2000, pct:'20%' },
    { key:'uncommon',  label:'UNCOMMON',  col:'var(--green)',  cap:3000, pct:'30%' },
    { key:'common',    label:'COMMON',    col:'var(--muted2)', cap:4000, pct:'40%' },
  ];

  grid.innerHTML = TIERS.map(t => `
    <div class="rarity-card ${t.key}">
      <div class="rc-header">
        <div class="rc-name">
          <div class="rc-dot" style="background:${t.col}; box-shadow: 0 0 10px ${t.col}"></div>
          ${t.label}
        </div>
        <div class="rc-count">${mintedCount[t.key]} / ${t.cap}</div>
      </div>
      <div class="rc-bar-bg">
        <div class="rc-bar-fill" style="width:${(mintedCount[t.key]/t.cap*100).toFixed(1)}%; background:${t.col}"></div>
      </div>
      <div class="rc-stats">
        <div class="rc-stat">Hard Cap: <strong>${t.cap.toLocaleString()}</strong></div>
        <div class="rc-stat">% of Supply: <strong>${t.pct}</strong></div>
        <div class="rc-stat">Minted: <strong>${mintedCount[t.key]}</strong></div>
        <div class="rc-stat">Remaining: <strong>${t.cap - mintedCount[t.key]}</strong></div>
      </div>
    </div>`).join('');

  // Trait weight tables
  const wrap = document.getElementById('traitTablesWrap');
  if(!wrap) return;

  wrap.innerHTML = Object.entries(TRAITS).map(([key, trait]) => {
    const maxW   = Math.max(...trait.options.map(o => o.weight));
    const totalW = trait.options.reduce((a, o) => a + o.weight, 0);
    return `
      <div class="trait-table-container" style="margin-bottom:32px; border-left: 2px solid rgba(255,255,255,0.05); padding-left: 15px">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:4px;color:var(--cyan);margin-bottom:12px">
          ${trait.name.toUpperCase()}
        </div>
        <table class="trait-table">
          <thead>
            <tr>
              <th>Trait Option</th>
              <th>Weight</th>
              <th>Chance</th>
              <th>Distribution</th>
            </tr>
          </thead>
          <tbody>
            ${trait.options.map(o => `
              <tr class="tier-${(o.tier || 'common').toLowerCase()}">
                <td>${o.label}</td>
                <td><span style="font-family:'Share Tech Mono',monospace;color:var(--cyan)">${o.weight}</span></td>
                <td style="font-family:'Share Tech Mono',monospace;color:var(--muted2)">${(o.weight/totalW*100).toFixed(1)}%</td>
                <td><span class="trait-w-bar" style="width:${(o.weight/maxW*120).toFixed(0)}px; background: ${dotColor(key, o.val)}"></span></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }).join('');
}
