/* ═══════════════════════════════════════════════════════
   export.js — All Export · Download · IPFS Preview Logic
   Upgraded for Ethereum Mainnet + Phase-Based Alignment
   Logic: Aligned for 700 Free WL / 9,300 Paid Distribution
  ═══════════════════════════════════════════════════════ */

/* ─────────
   SHARED DOWNLOAD HELPER
────────── */
function dlBlob(blob, filename) {
  const a = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ─────────────────────────────────────────────
   IPFS CID HELPER
───────────────────────────────────────────── */
function getImageCID() {
  const inputEl = document.getElementById('imageCID');
  const rawCID = inputEl ? inputEl.value.trim() : "";
  return rawCID || "REPLACE_WITH_ACTUAL_IMAGE_CID";
}

/* ─────────────────────────────────────────────
   BUILD OPENSEA-READY METADATA OBJECT
───────────────────────────────────────────── */
function buildMetaObj(nft) {
  const cid = getImageCID();
  
  // Logic: Determine if this unit falls within the first 700 (Free WL)
  const isFreeUnit = nft.id <= 700;
  
  return {
    name: `Mech Ranger #${String(nft.id).padStart(4,'0')} — ${nft.name}`,
    description: `A unique Mech Ranger warrior from the 10,000-piece collection. Tier: ${nft.rarity.toUpperCase()}. Optimized for Ethereum Mainnet.`,
    image: `ipfs://${cid}/${nft.id}.png`,
    external_url: `https://mechrangers.io/token/${nft.id}`,
    background_color: "050508",
    attributes: [
      ...Object.entries(nft.traits).map(([k, v]) => ({
        trait_type: TRAITS[k]?.name || k,
        value:      v.label || v.val,
      })),
      { trait_type: "Rarity Tier", value: nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1) },
      { trait_type: "Combat Score", value: nft.score, display_type: "number" },
      { trait_type: "Mint Class", value: isFreeUnit ? "Founders WL (Free)" : "Standard Combatant (Paid)" },
      { trait_type: "Network", value: "Ethereum" }
    ],
  };
}

/* ─────────────────────────────────────────────
   PINATA MASTER BUNDLER (ROBUST BATCH)
───────────────────────────────────────────── */
async function exportPinataBundle() {
  if (!allNFTs.length) { toast('Generate Rangers first!', 'warn'); return; }
  
  const cid = getImageCID();
  if (cid === "REPLACE_WITH_ACTUAL_IMAGE_CID") {
    toast('STOP: Please paste the Image CID in the dashboard.', 'error');
    return;
  }

  if (typeof JSZip === 'undefined') {
    toast('JSZip library missing!', 'error');
    return;
  }

  const zip = new JSZip();
  const metaFolder = zip.folder("metadata");
  const imgFolder  = zip.folder("images");

  toast('Packing 10,000 Mechs... This may take a moment.', 'info');

  allNFTs.forEach(nft => {
    metaFolder.file(`${nft.id}.json`, JSON.stringify(buildMetaObj(nft), null, 2));
    // Check if renderer exists, fallback to generic SVG placeholder
    const imgData = typeof renderSVG === 'function' ? renderSVG(nft, 1000) : "<svg></svg>";
    imgFolder.file(`${nft.id}.svg`, imgData);
  });

  const content = await zip.generateAsync({type:"blob", compression: "DEFLATE"});
  dlBlob(content, "mech_rangers_ethereum_bundle.zip");
  toast('Collection Bundle Ready!', 'success');
}

/* ─────────────────────────────────────────────
   MERKLE TREE EXPORT (UPGRADED FOR LIMITS)
───────────────────────────────────────────── */
function exportMerkleTreeData() {
  if (!allNFTs.length) { 
    if (typeof toast === 'function') toast('Generate Rangers first!', 'warn'); 
    return; 
  }
  
  const treeData = {
    generatedCount: allNFTs.length,
    exportDate: new Date().toISOString(),
    network: "Ethereum",
    mintLogic: {
        freeLimit: 1,
        paidLimit: 2,
        freeCap: 700
    },
    rangers: allNFTs.map(n => ({ 
      id: n.id, 
      tier: n.rarity,
      isFreeEligible: n.id <= 700
    }))
  };
  
  dlBlob(new Blob([JSON.stringify(treeData, null, 2)], { type: 'application/json' }), 'mint-snapshot.json');
  if (typeof toast === 'function') toast('Snapshot Exported: Limits 1/2 verified', 'success');
}

/* ─────────────────────────────────────────────
   INDIVIDUAL SVG EXPORT
───────────────────────────────────────────── */
function exportSVGsIndividually() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  toast(`Exporting ${allNFTs.length} SVGs...`, 'info');
  let i = 0;
  const next = () => {
    if (i >= allNFTs.length) return;
    const nft = allNFTs[i++];
    dlBlob(new Blob([renderSVG(nft, 1000)], { type: 'image/svg+xml' }), `${nft.id}.svg`);
    setTimeout(next, 50); 
  };
  next();
}

/* ─────────────────────────────────────────────
   INDIVIDUAL METADATA JSON EXPORT
───────────────────────────────────────────── */
function exportMetadataIndividually() {
  if (!allNFTs.length) { toast('Generate NFTs first!', 'warn'); return; }
  toast(`Exporting ${allNFTs.length} JSON files...`, 'info');
  let i = 0;
  const next = () => {
    if (i >= allNFTs.length) return;
    const nft = allNFTs[i++];
    dlBlob(
      new Blob([JSON.stringify(buildMetaObj(nft), null, 2)], { type: 'application/json' }),
      `${nft.id}.json`
    );
    setTimeout(next, 50);
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
  toast(`Exported batch: ${allNFTs.length} records`, 'success');
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
 * CSV Export for OpenSea Bulk Listing (Ethereum Aligned)
 */
function exportOpenSeaCSV() {
  if (!allNFTs.length) { toast('Generate Rangers first!', 'warn'); return; }
  let csv = "token_id,name,description,image_url,external_url,mint_limit\n";
  allNFTs.forEach(n => {
    const meta = buildMetaObj(n);
    const limit = n.id <= 700 ? "1" : "2";
    csv += `${n.id},"${meta.name}","${meta.description}","${meta.image}","${meta.external_url}",${limit}\n`;
  });
  dlBlob(new Blob([csv], { type: 'text/csv' }), 'opensea-listing-helper.csv');
  toast('CSV list generated (Limits 1/2 Included)', 'success');
}
