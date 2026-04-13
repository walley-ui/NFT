// js/bridge.js

async function checkMintEligibility() {
    const wallet = document.getElementById('walletInput').value.toLowerCase();
    
    // 1. Fetch the tree.json we generated with points.js
    const response = await fetch('./tree.json');
    const treeData = await response.json();

    if (treeData[wallet]) {
        const { allowance, proof } = treeData[wallet];
        // 2. SUCCESS: Show OpenSea link and pass data to contract
        updateUIForSuccess(allowance);
    } else {
        // 3. FINAL ROAST: For the Parasites who didn't make the cut
        renderFinalInsult();
    }
}
