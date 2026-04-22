/* ═══════════════════════════════════════════════════════
   modal.js — Cinematic Modal UI
   Purpose: High-fidelity preview for Mech Rangers NFTs.
   Logic: Aligned for 700 Free WL (Limit 1) / 9,300 Paid (Limit 2).
   ═══════════════════════════════════════════════════════ */

let activeModal = null;

function openModal(nft) {
  activeModal = nft;

  // Render high-res cinematic preview (1000px scale)
  const svgMarkup = renderSVG(nft, 1000);
  const artWrap = document.getElementById('mArtWrap');
  if (artWrap) {
    artWrap.innerHTML = svgMarkup.replace('<svg ', '<svg class="modal-art-render" ');
  }

  const nameEl = document.getElementById('mName');
  if (nameEl) nameEl.textContent = nft.name.toUpperCase();

  // PREMIUM CINEMATIC PALETTE
  const rarCol = {
    mythic:    '#ffd700', // Imperial Gold
    legendary: '#00ffcc', // Cyber Mint
    epic:      '#ffffff'  // Pure Chrome
  };

  const isFreeUnit = nft.id <= 700;
  const unitLimit  = isFreeUnit ? "1 (ORIGIN)" : "2 (RECRUIT)";

  const metaEl = document.getElementById('mMeta');
  if (metaEl) {
    metaEl.innerHTML = 
      '<span class="rarity-badge" style="color:' + (rarCol[nft.rarity] || '#fff') + '; border: 1px solid ' + (rarCol[nft.rarity] || '#fff') + '">' + nft.rarity.toUpperCase() + '</span>' +
      '<span class="id-badge" onclick="copyToClipboard(\'' + nft.id + '\')">UNIT #' + String(nft.id).padStart(4,'0') + '</span>' +
      '<span>LOGIC SCORE: ' + nft.score + '</span>' +
      '<span class="limit-badge">MINT LIMIT: ' + unitLimit + '</span>' +
      '<span class="eth-badge">MAINNET 721</span>';
  }

  const traitKeys = ['background','suit','helmet','weapon','aura','badge'];
  const traitsGrid = document.getElementById('mTraits');
  if (traitsGrid) {
    traitsGrid.innerHTML = traitKeys.map(function(k) {
      const v = nft.traits[k];
      if (!v) return ''; 
      const catName = TRAITS[k]?.name || k;
      return (
        '<div class="trait-card">' +
          '<div class="trait-label">' + catName.toUpperCase() + '</div>' +
          '<div class="trait-value">' + (v.label || v.val) + '</div>' +
          '<div class="trait-percent">' + (v.weight || '5') + '% Rarity</div>' +
        '</div>'
      );
    }).join('');
  }

  const m = document.getElementById('modal');
  if (m) m.className = 'modal-rebrand ' + nft.rarity;

  const overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.add('open');
}

function closeModal(e) {
  const overlayEl = document.getElementById('overlay');
  if (!e || e.target === overlayEl || e.currentTarget.tagName === 'BUTTON') {
    if (overlayEl) overlayEl.classList.remove('open');
    activeModal = null; 
  }
}

/* ─────────────────────────────────────────────
   NFT DATA EXPORTS
───────────────────────────────────────────── */
function exportSingleSVG() {
  if (!activeModal) return;
  const svg = renderSVG(activeModal, 2000); // Ultra-high-res export
  if (typeof dlBlob === 'function') {
    dlBlob(new Blob([svg], { type: 'image/svg+xml' }), 'MECH_' + activeModal.id + '.svg');
  }
}

function exportSingleMeta() {
  if (!activeModal) return;
  if (typeof buildMetaObj === 'function' && typeof dlBlob === 'function') {
    const meta = buildMetaObj(activeModal);
    dlBlob(new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' }), 'MECH_' + activeModal.id + '.json');
  }
}

function copyToClipboard(txt) {
    navigator.clipboard.writeText(txt);
    if (typeof toast === 'function') toast('ID ' + txt + ' copied to buffer', 'info');
}
