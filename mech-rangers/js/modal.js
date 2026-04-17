/* ═══════════════════════════════════════════════════════
   modal.js — Modal Open · Close · Single-Token Exports
   Upgraded: Base Mainnet Sync & Terminal-Safe Strings
   Depends on: traits.js, renderer.js, export.js
   ═══════════════════════════════════════════════════════ */

/* Currently open NFT (used by single-token export buttons) */
let activeModal = null;

/* ─────────────────────────────────────────────
   OPEN MODAL
───────────────────────────────────────────── */
function openModal(nft) {
  activeModal = nft;

  // Re-render at larger size for modal view
  const svgMarkup = renderSVG(nft, 500);
  const artWrap = document.getElementById('mArtWrap');
  if (artWrap) {
    artWrap.innerHTML = svgMarkup.replace('<svg ', '<svg class="modal-art" ');
  }

  // Name + meta strip
  const nameEl = document.getElementById('mName');
  if (nameEl) nameEl.textContent = nft.name;

  const rarCol = {
    mythic:    '#ff0055',
    legendary: '#ffc400',
    epic:      '#b44fff',
    rare:      '#00e5ff',
    uncommon:  '#00e676',
    common:    '#6a6a9a',
  };

  // UPGRADE: Aligned with Base Mainnet Metadata standards
  const metaEl = document.getElementById('mMeta');
  if (metaEl) {
    metaEl.innerHTML = 
      '<span style="color:' + (rarCol[nft.rarity] || '#fff') + '">' + nft.rarity.toUpperCase() + '</span>' +
      '<span style="cursor:pointer" onclick="copyToClipboard(\'' + nft.id + '\')">#' + String(nft.id).padStart(4,'0') + '</span>' +
      '<span>Score: ' + nft.score + '</span>' +
      '<span>' + (nft.traits.suit?.label || 'Standard') + '</span>' +
      '<span class="net-badge">BASE</span>';
  }

  // Trait grid
  const traitKeys = ['background','suit','helmet','weapon','aura','badge'];
  const traitsGrid = document.getElementById('mTraits');
  if (traitsGrid) {
    traitsGrid.innerHTML = traitKeys.map(function(k) {
      const v  = nft.traits[k];
      if (!v) return ''; // Upgrade: Safety check for missing traits
      const wt = v.weight ? v.weight + 'w' : '';
      const catName = TRAITS[k]?.name || k;
      return (
        '<div class="trait-item">' +
          '<div class="trait-cat">' + catName + '</div>' +
          '<div class="trait-val">' + (v.label || v.val) + '</div>' +
          '<div class="trait-rarity">' + wt + '</div>' +
        '</div>'
      );
    }).join('');
  }

  // Rarity border on modal
  const m = document.getElementById('modal');
  if (m) m.className = 'modal ' + nft.rarity;

  const overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.add('open');
}

/* ─────────────────────────────────────────────
   CLOSE MODAL
───────────────────────────────────────────── */
function closeModal(e) {
  const overlayEl = document.getElementById('overlay');
  const isOverlayClick  = e && e.target === overlayEl;
  const isButtonClick   = e && e.currentTarget && e.currentTarget.tagName === 'BUTTON';
  const isDirectCall    = !e;

  if (isDirectCall || isOverlayClick || isButtonClick) {
    if (overlayEl) overlayEl.classList.remove('open');
    activeModal = null; // Upgrade: Clear active state on close
  }
}

/* ─────────────────────────────────────────────
   SINGLE-TOKEN EXPORTS (from modal action bar)
───────────────────────────────────────────── */
function exportSingleSVG() {
  if (!activeModal) return;
  const svg = renderSVG(activeModal, 1000);
  if (typeof dlBlob === 'function') {
    dlBlob(new Blob([svg], { type: 'image/svg+xml' }), activeModal.id + '.svg');
    if (typeof toast === 'function') toast('SVG exported: ' + activeModal.id + '.svg', 'success');
  }
}

function exportSingleMeta() {
  if (!activeModal) return;
  // Upgrade: Uses the buildMetaObj from export.js to ensure consistency
  if (typeof buildMetaObj === 'function' && typeof dlBlob === 'function') {
    const meta = buildMetaObj(activeModal);
    dlBlob(new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' }), activeModal.id + '.json');
    if (typeof toast === 'function') toast('Metadata exported: ' + activeModal.id + '.json', 'success');
  }
}

function copyTokenJSON() {
  if (!activeModal || !navigator.clipboard) return;
  if (typeof buildMetaObj === 'function') {
    const jsonStr = JSON.stringify(buildMetaObj(activeModal), null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      if (typeof toast === 'function') toast('Metadata copied to clipboard', 'success');
    });
  }
}

// Helper for quick ID copying
function copyToClipboard(txt) {
    navigator.clipboard.writeText(txt);
    if (typeof toast === 'function') toast('ID ' + txt + ' copied', 'info');
}
