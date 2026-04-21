/* ═══════════════════════════════════════════════════════
   contract.js — Smart Contract Panel (ETHEREUM OPTIMIZED)
   Builds & displays the Solidity contract + deploy script.
   Logic: 700 WL (Free - 1 Max) | GTD (Paid - 2 Max) | Public (2 Max)
   ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   CONFIG READERS
───────────────────────────────────────────── */
function getContractConfig() {
  return {
    name:      document.getElementById('cName')?.value      || 'MechRangers',
    sym:       document.getElementById('cSymbol')?.value    || 'MECHR',
    maxSupply: document.getElementById('cMaxSupply')?.value || '10000',
    price:     parseFloat(document.getElementById('cPrice')?.value)     || 0.00009,
    royalty:   parseFloat(document.getElementById('cRoyalty')?.value)   || 5,
    baseURI:   document.getElementById('cBaseURI')?.value   || 'ipfs://YOUR_METADATA_CID/',
    merkleRoot: (typeof _snapshot !== 'undefined' && _snapshot?.merkleRoot) 
                ? _snapshot.merkleRoot 
                : (document.getElementById('cMerkleRoot')?.value || '0x0000000000000000000000000000000000000000000000000000000000000000'),
    gtdRoot:   document.getElementById('cGTDRoot')?.value || '0x0000000000000000000000000000000000000000000000000000000000000000'
  };
}

/* ─────────────────────────────────────────────
   SOLIDITY CONTRACT — (UPGRADED ALLOWANCE LOGIC)
───────────────────────────────────────────── */
function buildSolidityHTML(cfg) {
  return `<span class="cm">// SPDX-License-Identifier: MIT</span>
<span class="cm">// Mech Rangers ERC-721 — Production Contract v3.1 (Ethereum Mainnet)</span>
<span class="kw">pragma solidity</span> ^<span class="num">0.8.20</span>;

<span class="kw">import</span> <span class="str">"@openzeppelin/contracts/token/ERC721/ERC721.sol"</span>;
<span class="kw">import</span> <span class="str">"@openzeppelin/contracts/access/Ownable.sol"</span>;
<span class="kw">import</span> <span class="str">"@openzeppelin/contracts/interfaces/IERC2981.sol"</span>;
<span class="kw">import</span> <span class="str">"@openzeppelin/contracts/utils/Pausable.sol"</span>;
<span class="kw">import</span> <span class="str">"@openzeppelin/contracts/utils/cryptography/MerkleProof.sol"</span>;

<span class="kw">contract</span> <span class="type">${cfg.name}</span> <span class="kw">is</span> <span class="type">ERC721</span>, <span class="type">Ownable</span>, <span class="type">IERC2981</span>, <span class="type">Pausable</span> {

    <span class="kw">enum</span> <span class="type">MintPhase</span> { Locked, WL_Free, GTD_Paid, Public_FCFS }
    <span class="type">MintPhase</span> <span class="kw">public</span> currentPhase = <span class="type">MintPhase</span>.Locked;

    <span class="type">uint256</span> <span class="kw">public</span> totalSupply;
    <span class="type">uint256</span> <span class="kw">public constant</span> MAX_SUPPLY       = <span class="num">${cfg.maxSupply}</span>;
    <span class="type">uint256</span> <span class="kw">public</span> mintPrice                 = <span class="num">${cfg.price} ether</span>;
    
    <span class="type">uint256</span> <span class="kw">public constant</span> MAX_FREE_WL      = <span class="num">700</span>;
    <span class="type">uint256</span> <span class="kw">public constant</span> LIMIT_WL_FREE    = <span class="num">1</span>;
    <span class="type">uint256</span> <span class="kw">public constant</span> LIMIT_GENERAL    = <span class="num">2</span>;

    <span class="type">uint256</span> <span class="kw">public</span> freeMinted;
    <span class="type">uint256</span> <span class="kw">public</span> teamReserve               = <span class="num">100</span>;

    <span class="type">bytes32</span> <span class="kw">public</span> wlMerkleRoot  = <span class="num">${cfg.merkleRoot}</span>;
    <span class="type">bytes32</span> <span class="kw">public</span> gtdMerkleRoot = <span class="num">${cfg.gtdRoot}</span>;

    <span class="type">mapping</span>(<span class="type">address</span> =&gt; <span class="type">uint256</span>) <span class="kw">public</span> walletMinted;
    <span class="type">mapping</span>(<span class="type">string</span> =&gt; <span class="type">uint256</span>) <span class="kw">public</span> rarityCap;

    <span class="type">string</span> <span class="kw">private</span> _baseTokenURI;
    <span class="type">string</span> <span class="kw">public</span>  hiddenURI = <span class="str">"ipfs://HIDDEN_CID/hidden.json"</span>;
    <span class="type">bool</span>   <span class="kw">public</span>  revealed  = <span class="kw">false</span>;

    <span class="type">uint96</span>  <span class="kw">private</span> _royaltyFee      = <span class="num">${cfg.royalty * 100}</span>;
    <span class="type">address</span> <span class="kw">private</span> _royaltyReceiver;

    <span class="ev">event</span> <span class="fn">Minted</span>(<span class="type">address indexed</span> to, <span class="type">uint256 indexed</span> tokenId);
    <span class="ev">event</span> <span class="fn">Revealed</span>();
    <span class="ev">event</span> <span class="fn">PhaseChanged</span>(<span class="type">MintPhase</span> newPhase);

    <span class="kw">constructor</span>(<span class="type">string memory</span> baseURI_)
        <span class="fn">ERC721</span>(<span class="str">"${cfg.name}"</span>, <span class="str">"${cfg.sym}"</span>)
        <span class="fn">Ownable</span>(msg.sender)
    {
        _baseTokenURI    = baseURI_;
        _royaltyReceiver = msg.sender;
        
        rarityCap[<span class="str">"mythic"</span>]    = <span class="num">2000</span>;
        rarityCap[<span class="str">"legendary"</span>] = <span class="num">3000</span>;
        rarityCap[<span class="str">"epic"</span>]      = <span class="num">5000</span>;
    }

    <span class="kw">function</span> <span class="fn">setPhase</span>(<span class="type">MintPhase</span> _phase) <span class="kw">external onlyOwner</span> {
        currentPhase = _phase;
        <span class="kw">emit</span> <span class="fn">PhaseChanged</span>(_phase);
    }

    <span class="kw">function</span> <span class="fn">mint</span>(<span class="type">uint256</span> quantity, <span class="type">bytes32[] calldata</span> proof) <span class="kw">external payable whenNotPaused</span> {
        <span class="kw">require</span>(totalSupply + quantity &lt;= MAX_SUPPLY, <span class="str">"Max supply reached"</span>);
        <span class="type">bytes32</span> leaf = <span class="fn">keccak256</span>(<span class="fn">abi.encodePacked</span>(msg.sender));

        <span class="kw">if</span> (currentPhase == <span class="type">MintPhase</span>.WL_Free) {
            <span class="kw">require</span>(walletMinted[msg.sender] + quantity &lt;= LIMIT_WL_FREE, <span class="str">"WL Limit: 1 Unit"</span>);
            <span class="kw">require</span>(<span class="type">MerkleProof</span>.<span class="fn">verify</span>(proof, wlMerkleRoot, leaf), <span class="str">"Invalid WL Proof"</span>);
            <span class="kw">require</span>(freeMinted + quantity &lt;= MAX_FREE_WL, <span class="str">"Free WL cap reached"</span>);
            freeMinted += quantity;
        } <span class="kw">else if</span> (currentPhase == <span class="type">MintPhase</span>.GTD_Paid) {
            <span class="kw">require</span>(walletMinted[msg.sender] + quantity &lt;= LIMIT_GENERAL, <span class="str">"Limit: 2 Units"</span>);
            <span class="kw">require</span>(<span class="type">MerkleProof</span>.<span class="fn">verify</span>(proof, gtdMerkleRoot, leaf), <span class="str">"Invalid GTD Proof"</span>);
            <span class="kw">require</span>(msg.value &gt;= mintPrice * quantity, <span class="str">"Insufficient ETH"</span>);
        } <span class="kw">else if</span> (currentPhase == <span class="type">MintPhase</span>.Public_FCFS) {
            <span class="kw">require</span>(walletMinted[msg.sender] + quantity &lt;= LIMIT_GENERAL, <span class="str">"Limit: 2 Units"</span>);
            <span class="kw">require</span>(msg.value &gt;= mintPrice * quantity, <span class="str">"Insufficient ETH"</span>);
        } <span class="kw">else</span> {
            <span class="kw">revert</span>(<span class="str">"Minting is locked"</span>);
        }

        <span class="kw">for</span> (<span class="type">uint256</span> i = <span class="num">0</span>; i &lt; quantity; i++) {
            <span class="fn">_safeMint</span>(msg.sender, ++totalSupply);
            walletMinted[msg.sender]++;
            <span class="kw">emit</span> <span class="fn">Minted</span>(msg.sender, totalSupply);
        }
    }

    <span class="kw">function</span> <span class="fn">ownerMint</span>(<span class="type">address</span> to, <span class="type">uint256</span> quantity) <span class="kw">external onlyOwner</span> {
        <span class="kw">require</span>(quantity &lt;= teamReserve,                        <span class="str">"Exceeds team reserve"</span>);
        <span class="kw">require</span>(totalSupply + quantity &lt;= MAX_SUPPLY,           <span class="str">"Max supply reached"</span>);
        teamReserve -= quantity;
        <span class="kw">for</span> (<span class="type">uint256</span> i = <span class="num">0</span>; i &lt; quantity; i++) { <span class="fn">_safeMint</span>(to, ++totalSupply); }
    }

    <span class="kw">function</span> <span class="fn">reveal</span>(<span class="type">string memory</span> finalBaseURI) <span class="kw">external onlyOwner</span> {
        revealed = <span class="kw">true</span>;
        _baseTokenURI = finalBaseURI;
        <span class="kw">emit</span> <span class="fn">Revealed</span>();
    }

    <span class="kw">function</span> <span class="fn">tokenURI</span>(<span class="type">uint256</span> tokenId) <span class="kw">public view override returns</span> (<span class="type">string memory</span>) {
        <span class="fn">_requireOwned</span>(tokenId);
        <span class="kw">if</span> (!revealed) <span class="kw">return</span> hiddenURI;
        <span class="kw">return</span> <span class="type">string</span>(<span class="fn">abi.encodePacked</span>(_baseTokenURI, <span class="fn">_toString</span>(tokenId), <span class="str">".json"</span>));
    }

    <span class="kw">function</span> <span class="fn">royaltyInfo</span>(<span class="type">uint256</span>, <span class="type">uint256</span> salePrice) <span class="kw">external view override returns</span> (<span class="type">address</span>, <span class="type">uint256</span>) {
        <span class="kw">return</span> (_royaltyReceiver, (salePrice * _royaltyFee) / <span class="num">10000</span>);
    }

    <span class="kw">function</span> <span class="fn">withdraw</span>() <span class="kw">external onlyOwner</span> {
        (<span class="type">bool</span> ok,) = msg.sender.<span class="fn">call</span>{value: <span class="fn">address</span>(<span class="kw">this</span>).balance}(<span class="str">""</span>);
        <span class="kw">require</span>(ok, <span class="str">"Withdraw failed"</span>);
    }

    <span class="kw">function</span> <span class="fn">supportsInterface</span>(<span class="type">bytes4</span> id) <span class="kw">public view override</span>(<span class="type">ERC721</span>, <span class="type">IERC165</span>) <span class="kw">returns</span> (<span class="type">bool</span>) {
        <span class="kw">return</span> id == <span class="kw">type</span>(<span class="type">IERC2981</span>).interfaceId || <span class="kw">super</span>.<span class="fn">supportsInterface</span>(id);
    }

    <span class="kw">function</span> <span class="fn">_toString</span>(<span class="type">uint256</span> value) <span class="kw">internal pure returns</span> (<span class="type">string memory</span>) {
        <span class="kw">if</span> (value == <span class="num">0</span>) <span class="kw">return</span> <span class="str">"0"</span>;
        <span class="type">uint256</span> temp = value; <span class="type">uint256</span> digits;
        <span class="kw">while</span> (temp != <span class="num">0</span>) { digits++; temp /= <span class="num">10</span>; }
        <span class="type">bytes memory</span> buffer = <span class="kw">new bytes</span>(digits);
        <span class="kw">while</span> (value != <span class="num">0</span>) {
            digits--;
            buffer[digits] = <span class="type">bytes1</span>(<span class="type">uint8</span>(<span class="num">48</span> + value % <span class="num">10</span>));
            value /= <span class="num">10</span>;
        }
        <span class="kw">return</span> <span class="type">string</span>(buffer);
    }
}`;
}

/* ─────────────────────────────────────────────
   HARDHAT DEPLOY SCRIPT (ETHEREUM MAINNET)
───────────────────────────────────────────── */
function buildDeployHTML(cfg) {
  return `<span class="cm">// scripts/deploy.js (Hardhat - Optimized for Ethereum Mainnet)</span>
<span class="kw">const</span> { ethers } = <span class="fn">require</span>(<span class="str">"hardhat"</span>);

<span class="kw">async function</span> <span class="fn">main</span>() {
  <span class="kw">const</span> [deployer] = <span class="kw">await</span> ethers.<span class="fn">getSigners</span>();
  console.<span class="fn">log</span>(<span class="str">"Deploying ${cfg.name} to Ethereum from:"</span>, deployer.address);

  <span class="kw">const</span> baseURI = <span class="str">"${cfg.baseURI}"</span>;
  <span class="kw">const</span> Factory  = <span class="kw">await</span> ethers.<span class="fn">getContractFactory</span>(<span class="str">"${cfg.name}"</span>);
  <span class="kw">const</span> contract = <span class="kw">await</span> Factory.<span class="fn">deploy</span>(baseURI);
  
  <span class="kw">await</span> contract.<span class="fn">waitForDeployment</span>();
  console.<span class="fn">log</span>(<span class="str">"✓ Mech Ranger Unit Deployed on Ethereum:"</span>, <span class="kw">await</span> contract.<span class="fn">getAddress</span>());
}

<span class="fn">main</span>().<span class="fn">catch</span>(e => { console.<span class="fn">error</span>(e); process.<span class="fn">exit</span>(1); });`;
}

/* ─────────────────────────────────────────────
   BUILD CONTRACT PANEL
───────────────────────────────────────────── */
function buildContractCode() {
  const cfg = getContractConfig();
  const solEl = document.getElementById('solCode');
  const depEl = document.getElementById('deployScript');
  
  if(solEl) solEl.innerHTML = buildSolidityHTML(cfg);
  if(depEl) depEl.innerHTML = buildDeployHTML(cfg);
  
  updateMintSim();
}

function updateContract() {
  buildContractCode();
  if (typeof toast === 'function') toast('Contract Upgraded: WL(1) | GTD(2)', 'success');
}

/* ─────────────────────────────────────────────
   MINT SIMULATOR (PHASE-BASED REVENUE SYNC)
───────────────────────────────────────────── */
function updateMintSim() {
  const wrap = document.getElementById('mintSimRows');
  if (!wrap) return;

  const price   = parseFloat(document.getElementById('cPrice')?.value)     || 0.00009;
  const total   = parseInt(document.getElementById('cMaxSupply')?.value)   || 10000;
  const royalty = parseFloat(document.getElementById('cRoyalty')?.value)   || 5;

  // Revenue calc: 700 are Free WL. 9,300 are Paid (GTD + Public).
  const paidUnits = total - 700;
  const estRevenue = paidUnits * price;

  const TIERS = [
    { key:'mythic',    label:'MYTHIC',    col:'#ff0055', cap: 2000 },
    { key:'legendary', label:'LEGENDARY', col:'#ffc400', cap: 3000 },
    { key:'epic',      label:'EPIC',      col:'#b44fff', cap: 5000 }
  ];

  wrap.innerHTML = TIERS.map(t => {
    const count = (typeof mintedCount !== 'undefined' ? mintedCount[t.key] : 0);
    // Visual indicator: Logic check for rank 1-700
    const phaseNote = t.key === 'mythic' ? ' (Includes Free WL)' : '';
    return `
    <div class="mint-tier-row">
      <div class="mt-label" style="color:${t.col}">${t.label}${phaseNote}</div>
      <div class="mt-bar-bg">
        <div class="mt-bar-fill" style="width:${((count / t.cap) * 100).toFixed(1)}%;background:${t.col}"></div>
      </div>
      <div class="mt-count">${count}/${t.cap}</div>
    </div>`}).join('');

  const sTot = document.getElementById('simTotal');
  const sRev = document.getElementById('simRevenue');
  const sRoy = document.getElementById('simRoyalty');

  if(sTot) sTot.textContent = total.toLocaleString();
  if(sRev) sRev.textContent = estRevenue.toFixed(4) + ' ETH (9,300 Paid Units)';
  if(sRoy) sRoy.textContent = royalty + '% Royalty | Limits: WL(1) GTD(2)';
}

/* ─────────────────────────────────────────────
   NETWORK PICKER (LOCKED TO ETHEREUM)
───────────────────────────────────────────── */
const NETWORK_RPCS = { '1':  'https://eth.llamarpc.com' };

function pickNet(el, name, chainId) {
  document.querySelectorAll('.network-badge').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const rpcInput = document.getElementById('netRPC');
  if(rpcInput) rpcInput.value = NETWORK_RPCS['1'];
  if (typeof toast === 'function') toast('NETWORK LOCKED: Ethereum Mainnet Only', 'warn');
}

buildContractCode();
