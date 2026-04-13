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
  document.getElementById('mArtWrap').innerHTML =
    svgMarkup.replace('<svg ', '<svg class="modal-art" ');

  // Name + meta strip
  document.getElementById('mName').textContent = nft.name;

  const rarCol = {
    legendary: 'var(--gold)',
    epic:      'var(--purple)',
    rare:      'var(--cyan)',
    uncommon:  'var(--green)',
    common:    'var(--muted2)',
  };

  // UPGRADE: Aligned with Base Mainnet Metadata standards
  document.getElementById('mMeta').innerHTML = 
    '<span style="color:' + rarCol[nft.rarity] + '">' + nft.rarity.toUpperCase() + '</span>' +
    '<span>#' + String(nft.id).padStart(4,'0') + '</span>' +
    '<span>Score: ' + nft.score + '</span>' +
    '<span>' + nft.traits.suit.label + '</span>' +
    '<span class="net-badge">BASE</span>';

  // Trait grid
  const traitKeys = ['background','suit','helmet','weapon','aura','badge'];
  document.getElementById('mTraits').innerHTML = traitKeys.map(function(k) {
    const v  = nft.traits[k];
    const wt = v.weight ? v.weight + 'w' : '';
    return (
      '<div class="trait-item">' +
        '<div class="trait-cat">' + TRAITS[k].name + '</div>' +
        '<div class="trait-val">' + v.label + '</div>' +
        '<div class="trait-rarity">' + wt + '</div>' +
      '</div>'
    );
  }).join('');

  // Rarity border on modal
  const m = document.getElementById('modal');
  m.className = 'modal ' + nft.rarity;

  document.getElementById('overlay').classList.add('open');
}

/* ─────────────────────────────────────────────
   CLOSE MODAL
───────────────────────────────────────────── */
function closeModal(e) {
  const isOverlayClick  = e && e.target === document.getElementById('overlay');
  const isButtonClick   = e && e.currentTarget && e.currentTarget.tagName === 'BUTTON';
  const isDirectCall    = !e;

  if (isDirectCall || isOverlayClick || isButtonClick) {
    document.getElementById('overlay').classList.remove('open');
  }
}

/* ─────────────────────────────────────────────
   SINGLE-TOKEN EXPORTS (from modal action bar)
───────────────────────────────────────────── */
function exportSingleSVG() {
  if (!activeModal) return;
  const svg = renderSVG(activeModal, 1000);
  dlBlob(new Blob([svg], { type: 'image/svg+xml' }), activeModal.id + '.svg');
  toast('SVG exported: ' + activeModal.id + '.svg', 'success');
}

function exportSingleMeta() {
  if (!activeModal) return;
  const meta = buildMetaObj(activeModal);
  dlBlob(new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' }), activeModal.id + '.json');
  toast('Metadata exported: ' + activeModal.id + '.json', 'success');
}

function copyTokenJSON() {
  if (!activeModal) return;
  navigator.clipboard?.writeText(JSON.stringify(buildMetaObj(activeModal), null, 2));
  toast('Metadata copied to clipboard', 'success');
}
