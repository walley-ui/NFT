/* ═══════════
   export.js — All Export · Download · IPFS Preview Logic
   Upgraded for Base Mainnet + OpenSea Tier Alignment
   Depends on: traits.js, generator.js, renderer.js, JSZip
  ═══════════ */

/* ─────────
   SHARED DOWNLOAD HELPER
────────── */
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
  // LEVEL 0 RESET: Pulls only from the UI. No old CIDs allowed.
  // This ensures your metadata is always born with fresh, verified links.
  const inputEl = document.getElementById('imageCID');
  const rawCID = inputEl ? inputEl.value.trim() : "";
  
  // Safety fallback to prevent exporting "bafyundefined"
  return rawCID || "REPLACE_WITH_ACTUAL_IMAGE_CID";
}

/* ─────────────────────────────────────────────
   BUILD OPENSEA-READY METADATA OBJECT
───────────────────────────────────────────── */
function buildMetaObj(nft) {
  const cid = getImageCID();
  return {
    name: "Mech Ranger #" + String(nft.id).padStart(4,'0') + " — " + nft.name,
    description: "A unique Mech Ranger warrior from the 10,000-piece collection. Tier: " + 
      nft.rarity.toUpperCase() + ". Optimized for Base Mainnet.",
    // OpenSea standard for Base IPFS assets
    image: "ipfs://" + cid + "/" + nft.id + ".svg", // Refactored to .svg to match renderer
    external_url:  "https://mechrangers.io/token/" + nft.id,
    background_color: "050508",
    attributes: [
      ...Object.entries(nft.traits).map(([k, v]) => ({
        trait_type: TRAITS[k]?.name || k,
        value:      v.label || v.val,
      })),
      { trait_type: "Rarity Tier", value: nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1) },
      { trait_type: "Combat Score",  value: nft.score, display_type: "number" },
      { trait_type: "Network", value: "Base" }
    ],
  };
}

/* ─────────────────────────────────────────────
   PINATA MASTER BUNDLER (ROBUST BATCH)
   Upgrade: Packs 10k items into ONE ZIP to prevent 10k popups
───────────────────────────────────────────── */
async function exportPinataBundle() {
  if (!allNFTs.length) { toast('Generate Rangers first!', 'warn'); return; }
  
  // LEVEL 0 SAFETY CHECK
  const cid = getImageCID();
  if (cid === "REPLACE_WITH_ACTUAL_IMAGE_CID") {
    toast('STOP: Please upload your images to Pinata first and paste the CID in the dashboard.', 'error');
    return;
  }

  if (typeof JSZip === 'undefined') {
    toast('JSZip library missing! Add script tag to HTML.', 'error');
    return;
  }

  const zip = new JSZip();
  const metaFolder = zip.folder("metadata");
  const svgFolder = zip.folder("images");

  toast('Packing 10,000 Mechs... This may take a moment.', 'info');

  allNFTs.forEach(nft => {
    // Add JSON
    metaFolder.file(`${nft.id}.json`, JSON.stringify(buildMetaObj(nft), null, 2));
    // Add SVG
    svgFolder.file(`${nft.id}.svg`, renderSVG(nft, 1000));
  });

  const content = await zip.generateAsync({type:"blob", compression: "DEFLATE"});
  dlBlob(content, "mech_rangers_complete_bundle.zip");
  toast('Collection Bundle Ready!', 'success');
}

/* ─────────────────────────────────────────────
   MERKLE TREE EXPORT (UPGRADED)
   Aligns local results with bridge.js for Phase 2
───────────────────────────────────────────── */
function exportMerkleTreeData() {
  if (!allNFTs.length) { 
    if (typeof toast === 'function') toast('Generate Rangers first!', 'warn'); 
    return; 
  }
  
  const treeData = {
    generatedCount: allNFTs.length,
    exportDate: new Date().toISOString(),
    network: "Base",
    contract: document.getElementById('cContract')?.value || 'TBD',
    rangers: allNFTs.map(n => ({ 
      id: n.id, 
      tier: n.rarity, 
      holder: n.holder || "0x0000000000000000000000000000000000000000" 
    }))
  };
  
  dlBlob(new Blob([JSON.stringify(treeData, null, 2)], { type: 'application/json' }), 'mint-snapshot.json');
  if (typeof toast === 'function') toast('Mint snapshot exported for Bridge', 'success');
}

/* ─────────────────────────────────────────────
   INDIVIDUAL SVG EXPORT
───────────────────────────────────────────── */
function exportSVGsIndividually() {
  if (!allNFTs.length) { if (typeof toast === 'function') toast('Generate NFTs first!', 'warn'); return; }
  if (typeof toast === 'function') toast('Exporting ' + allNFTs.length + ' SVGs...', 'info');
  let i = 0;
  const next = () => {
    if (i >= allNFTs.length) return;
    const nft = allNFTs[i++];
    dlBlob(new Blob([renderSVG(nft, 1000)], { type: 'image/svg+xml' }), nft.id + '.svg');
    setTimeout(next, 100); 
  };
  next();
}

/* ─────────────────────────────────────────────
   INDIVIDUAL METADATA JSON EXPORT
───────────────────────────────────────────── */
function exportMetadataIndividually() {
  if (!allNFTs.length) { if (typeof toast === 'function') toast('Generate NFTs first!', 'warn'); return; }
  if (typeof toast === 'function') toast('Exporting ' + allNFTs.length + ' JSON files...', 'info');
  let i = 0;
  const next = () => {
    if (i >= allNFTs.length) return;
    const nft = allNFTs[i++];
    dlBlob(
      new Blob([JSON.stringify(buildMetaObj(nft), null, 2)], { type: 'application/json' }),
      nft.id + '.json'
    );
    setTimeout(next, 60);
  };
  next();
}

/* ─────────────────────────────────────────────
   BATCH — ALL METADATA AS ONE JSON ARRAY
───────────────────────────────────────────── */
function exportAllMetaJSON() {
  if (!allNFTs.length) { if (typeof toast === 'function') toast('Generate NFTs first!', 'warn'); return; }
  const data = allNFTs.map(buildMetaObj);
  dlBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    'mech-rangers-full-metadata.json'
  );
  if (typeof toast === 'function') toast('Exported batch: ' + allNFTs.length + ' records', 'success');
}

/* ─────────────────────────────────────────────
   BATCH — SVG PACK
───────────────────────────────────────────── */
function exportSVGpack() {
  if (!allNFTs.length) { if (typeof toast === 'function') toast('Generate NFTs first!', 'warn'); return; }
  const content = allNFTs.slice(0, 100)
    .map(n => "\n" + renderSVG(n, 500))
    .join('\n\n');
  dlBlob(new Blob([content], { type: 'image/svg+xml' }), 'mech-rangers-preview-pack.svg');
  if (typeof toast === 'function') toast('Preview SVG pack generated', 'success');
}

/* ─────────────────────────────────────────────
   CLIPBOARD — SINGLE SAMPLE JSON
───────────────────────────────────────────── */
function copyMetaSample() {
  if (!allNFTs.length) { if (typeof toast === 'function') toast('Generate NFTs first!', 'warn'); return; }
  navigator.clipboard?.writeText(JSON.stringify(buildMetaObj(allNFTs[0]), null, 2));
  if (typeof toast === 'function') toast('Metadata sample copied for testing', 'success');
}

/* ─────────────────────────────────────────────
   LIVE PREVIEWS
───────────────────────────────────────────── */
function updateSVGPreview() {
  const el = document.getElementById('svgPreview');
  if (!el || !allNFTs[0]) return;
  const n = allNFTs[0];
  const actualSVG = renderSVG(n, 100);
  el.textContent = actualSVG.substring(0, 500) + "...";
}

function updateMetaPreview() {
  const el = document.getElementById('metaPreview');
  if (!el || !allNFTs[0]) return;
  const preview = JSON.stringify(buildMetaObj(allNFTs[0]), null, 2);
  el.textContent = preview.length > 380
    ? preview.substring(0, 380) + '...'
    : preview;
}

/**
 * UPGRADE: Added CSV Export for OpenSea Bulk Listing
 */
function exportOpenSeaCSV() {
  if (!allNFTs.length) { if (typeof toast === 'function') toast('Generate Rangers first!', 'warn'); return; }
  let csv = "token_id,name,description,image_url,external_url\n";
  allNFTs.forEach(n => {
    const meta = buildMetaObj(n);
    csv += n.id + ',"' + meta.name + '","' + meta.description + '","' + meta.image + '","' + meta.external_url + '"\n';
  });
  dlBlob(new Blob([csv], { type: 'text/csv' }), 'opensea-listing-helper.csv');
  if (typeof toast === 'function') toast('CSV list generated for Base deployment', 'success');
}
