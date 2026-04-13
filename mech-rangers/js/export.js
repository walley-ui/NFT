/* ═══════════════════════════════════════════════════════
   export.js — All Export · Download · IPFS Preview Logic
   Depends on: traits.js, generator.js, renderer.js
   ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   SHARED DOWNLOAD HELPER
───────────────────────────────────────────── */
function dlBlob(blob, filename) {
  const a = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  // Revoke shortly after to avoid memory leak
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ─────────────────────────────────────────────
   IPFS CID HELPER
───────────────────────────────────────────── */
function getImageCID() {
  return document.getElementById('imageCID')?.value || 'QmYOUR_IMAGE_CID';
}

/* ─────────────────────────────────────────────
   BUILD OPENSEA-READY METADATA OBJECT
───────────────────────────────────────────── */
function buildMetaObj(nft) {
  const cid = getImageCID();
  return {
    name: `Mech Rangers #${String(nft.id).padStart(4,'0')} — ${nft.name}`,
    description: `A unique Mech Ranger warrior from the 10,000-piece collection. ${
      nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)
    } tier. Serial #${nft.id}.`,
    image:         `ipfs://${cid}/${nft.id}.svg`,
    external_url:  `https://mechrangers.io/token/${nft.id}`,
    background_color: "050508",
    attributes: [
      ...Object.entries(nft.traits).map(([k, v]) => ({
        trait_type: TRAITS[k].name,
        value:      v.label,
      })),
      { trait_type: "Rarity", value: nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1) },
      { trait_type: "Score",  value: nft.score, display_type: "number" },
    ],
  };
}

/* ─────────────────────────────────────────────
   INDIVIDUAL SVG EXPORT
   Each file named by token ID: 1.svg, 2.svg …
   Browser-rate-limited via setTimeout chain.
───────────────────────────────────────────── */
function exportSVGsIndividually() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  toast(`Exporting ${allNFTs.length} SVGs individually…`, 'info');
  let i = 0;
  const next = () => {
    if (i >= allNFTs.length) return;
    const nft = allNFTs[i++];
    dlBlob(new Blob([renderSVG(nft, 1000)], { type: 'image/svg+xml' }), `${nft.id}.svg`);
    setTimeout(next, 60);   // 60ms gap avoids browser download throttle
  };
  next();
}

/* ─────────────────────────────────────────────
   INDIVIDUAL METADATA JSON EXPORT
   Each file named by token ID: 1.json, 2.json …
───────────────────────────────────────────── */
function exportMetadataIndividually() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  toast(`Exporting ${allNFTs.length} JSON metadata files…`, 'info');
  let i = 0;
  const next = () => {
    if (i >= allNFTs.length) return;
    const nft = allNFTs[i++];
    dlBlob(
      new Blob([JSON.stringify(buildMetaObj(nft), null, 2)], { type: 'application/json' }),
      `${nft.id}.json`
    );
    setTimeout(next, 60);
  };
  next();
}

/* ─────────────────────────────────────────────
   BATCH — ALL METADATA AS ONE JSON ARRAY
───────────────────────────────────────────── */
function exportAllMetaJSON() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  const data = allNFTs.map(buildMetaObj);
  dlBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    `mech-rangers-metadata-${allNFTs.length}.json`
  );
  toast(`Exported ${allNFTs.length} metadata records`, 'success');
}

/* ─────────────────────────────────────────────
   BATCH — SVG PACK (first 100 in one file)
───────────────────────────────────────────── */
function exportSVGpack() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  const content = allNFTs.slice(0, 100)
    .map(n => `<!-- #${n.id}: ${n.name} (${n.rarity}) -->\n${renderSVG(n, 500)}`)
    .join('\n\n');
  dlBlob(new Blob([content], { type: 'image/svg+xml' }), 'mech-rangers-svgs-first100.svg');
  toast('SVG pack (first 100) exported', 'success');
}

/* ─────────────────────────────────────────────
   CLIPBOARD — SINGLE SAMPLE JSON
───────────────────────────────────────────── */
function copyMetaSample() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  navigator.clipboard?.writeText(JSON.stringify(buildMetaObj(allNFTs[0]), null, 2));
  toast('Sample metadata copied to clipboard', 'success');
}

/* ─────────────────────────────────────────────
   LIVE PREVIEWS (shown in Export panel cards)
───────────────────────────────────────────── */
function updateSVGPreview() {
  const el = document.getElementById('svgPreview');
  if (!el || !allNFTs[0]) return;
  const n = allNFTs[0];
  el.textContent =
    `<!-- Token #${n.id} (${n.rarity}) -->\n` +
    `<svg ...>\n` +
    `  <!-- Background: ${n.traits.background.label} -->\n` +
    `  <!-- Suit:       ${n.traits.suit.label} -->\n` +
    `  <!-- Helmet:     ${n.traits.helmet.label} -->\n` +
    `  <!-- Weapon:     ${n.traits.weapon.label} -->\n` +
    `  <!-- Aura:       ${n.traits.aura.label} -->\n` +
    `  <!-- Badge:      ${n.traits.badge.label} -->\n` +
    `</svg>`;
}

function updateMetaPreview() {
  const el = document.getElementById('metaPreview');
  if (!el || !allNFTs[0]) return;
  const preview = JSON.stringify(buildMetaObj(allNFTs[0]), null, 2);
  el.textContent = preview.length > 380
    ? preview.substring(0, 380) + '…'
    : preview;
}
