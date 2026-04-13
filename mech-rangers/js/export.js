/* ═══════════════════════════════════════════════════════
   export.js — All Export · Download · IPFS Preview Logic
   Upgraded for Base Mainnet + OpenSea Tier Alignment
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
  // Dynamically pulls the CID from your IPFS panel
  return document.getElementById('imageCID')?.value || 'Qm_BASE_MECH_COLLECTION_CID';
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
    image:         "ipfs://" + cid + "/" + nft.id + ".svg",
    external_url:  "https://mechrangers.io/token/" + nft.id,
    background_color: "050508",
    attributes: [
      ...Object.entries(nft.traits).map(([k, v]) => ({
        trait_type: TRAITS[k].name,
        value:      v.label,
      })),
      { trait_type: "Rarity Tier", value: nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1) },
      { trait_type: "Combat Score",  value: nft.score, display_type: "number" },
      { trait_type: "Network", value: "Base" }
    ],
  };
}

/* ─────────────────────────────────────────────
   MERKLE TREE EXPORT (UPGRADED)
   Aligns local results with bridge.js for Phase 2
───────────────────────────────────────────── */
function exportMerkleTreeData() {
  if (!allNFTs.length) { toast('Generate Rangers first!', 'warn'); return; }
  
  // UPGRADE: Now creates a full address-to-ID mapping for the Bridge
  const treeData = {
    generatedCount: allNFTs.length,
    exportDate: new Date().toISOString(),
    network: "Base",
    contract: document.getElementById('cContract')?.value || 'TBD',
    // Maps each generated Ranger to its holder/tier for verification
    rangers: allNFTs.map(n => ({ 
      id: n.id, 
      tier: n.rarity, 
      holder: n.holder || "0x0000000000000000000000000000000000000000" 
    }))
  };
  
  dlBlob(new Blob([JSON.stringify(treeData, null, 2)], { type: 'application/json' }), 'mint-snapshot.json');
  toast('Mint snapshot exported for Bridge', 'success');
}

/* ─────────────────────────────────────────────
   INDIVIDUAL SVG EXPORT
───────────────────────────────────────────── */
function exportSVGsIndividually() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  toast('Exporting ' + allNFTs.length + ' SVGs to local disk...', 'info');
  let i = 0;
  const next = () => {
    if (i >= allNFTs.length) return;
    const nft = allNFTs[i++];
    dlBlob(new Blob([renderSVG(nft, 1000)], { type: 'image/svg+xml' }), nft.id + '.svg');
    setTimeout(next, 60); 
  };
  next();
}

/* ─────────────────────────────────────────────
   INDIVIDUAL METADATA JSON EXPORT
───────────────────────────────────────────── */
function exportMetadataIndividually() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  toast('Exporting ' + allNFTs.length + ' JSON files for IPFS upload...', 'info');
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
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  const data = allNFTs.map(buildMetaObj);
  dlBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    'mech-rangers-full-metadata.json'
  );
  toast('Exported batch: ' + allNFTs.length + ' records', 'success');
}

/* ─────────────────────────────────────────────
   BATCH — SVG PACK
───────────────────────────────────────────── */
function exportSVGpack() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  const content = allNFTs.slice(0, 100)
    .map(n => "\n" + renderSVG(n, 500))
    .join('\n\n');
  dlBlob(new Blob([content], { type: 'image/svg+xml' }), 'mech-rangers-preview-pack.svg');
  toast('Preview SVG pack generated', 'success');
}

/* ─────────────────────────────────────────────
   CLIPBOARD — SINGLE SAMPLE JSON
───────────────────────────────────────────── */
function copyMetaSample() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  navigator.clipboard?.writeText(JSON.stringify(buildMetaObj(allNFTs[0]), null, 2));
  toast('Metadata sample copied for testing', 'success');
}

/* ─────────────────────────────────────────────
   LIVE PREVIEWS
───────────────────────────────────────────── */
function updateSVGPreview() {
  const el = document.getElementById('svgPreview');
  if (!el || !allNFTs[0]) return;
  const n = allNFTs[0];
  el.textContent =
    "\n" +
    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" ...>\n' +
    "  \n" +
    "  \n" +
    "  \n" +
    "  \n" +
    "</svg>";
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
  if (!allNFTs.length) { toast('Generate Rangers first!', 'warn'); return; }
  let csv = "token_id,name,description,image_url,external_url\n";
  allNFTs.forEach(n => {
    const meta = buildMetaObj(n);
    csv += n.id + ',"' + meta.name + '","' + meta.description + '","' + meta.image + '","' + meta.external_url + '"\n';
  });
  dlBlob(new Blob([csv], { type: 'text/csv' }), 'opensea-listing-helper.csv');
  toast('CSV list generated for Base deployment', 'success');
}
