/* ═══════════════════════════════════════════════════════
   contract.js — Smart Contract Panel (BASE OPTIMIZED)
   Builds & displays the Solidity contract + deploy script.
   Enforced Network: Base (Mainnet)
   ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   CONFIG READERS
───────────────────────────────────────────── */
function getContractConfig() {
  return {
    name:      document.getElementById('cName')?.value      || 'MechRangers',
    sym:       document.getElementById('cSymbol')?.value    || 'MECHR',
    maxSupply: document.getElementById('cMaxSupply')?.value || '10000',
    price:     parseFloat(document.getElementById('cPrice')?.value)     || 0.05,
    maxWallet: document.getElementById('cMaxWallet')?.value || '5',
    royalty:   parseFloat(document.getElementById('cRoyalty')?.value)   || 5,
    baseURI:   document.getElementById('cBaseURI')?.value   || 'ipfs://YOUR_METADATA_CID/',
    // UPGRADE: Added Merkle Root reader to align with Admin Forge
    merkleRoot: document.getElementById('cMerkleRoot')?.value || '0x0000000000000000000000000000000000000000000000000000000000000000'
  };
}

/* ─────────────────────────────────────────────
   SOLIDITY CONTRACT — (BASE COMPATIBLE)
───────────────────────────────────────────── */
function buildSolidityHTML(cfg) {
  const priceWei = `${(cfg.price * 1000).toFixed(0)} finney`;
  return `<span class="cm">// SPDX-License-Identifier: MIT</span>
<span class="cm">// Mech Rangers ERC-721 — Production Contract v2.1 (Base Mainnet)</span>
<span class="kw">pragma solidity</span> ^<span class="num">0.8.20</span>;

<span class="kw">import</span> <span class="str">"@openzeppelin/contracts/token/ERC721/ERC721.sol"</span>;
<span class="kw">import</span> <span class="str">"@openzeppelin/contracts/access/Ownable.sol"</span>;
<span class="kw">import</span> <span class="str">"@openzeppelin/contracts/interfaces/IERC2981.sol"</span>;
<span class="kw">import</span> <span class="str">"@openzeppelin/contracts/utils/Pausable.sol"</span>;
<span class="kw">import</span> <span class="str">"@openzeppelin/contracts/utils/cryptography/MerkleProof.sol"</span>;

<span class="kw">contract</span> <span class="type">${cfg.name}</span> <span class="kw">is</span> <span class="type">ERC721</span>, <span class="type">Ownable</span>, <span class="type">IERC2981</span>, <span class="type">Pausable</span> {

    <span class="cm">// ── Supply &amp; Pricing ──────────────────────────────</span>
    <span class="type">uint256</span> <span class="kw">public</span> totalSupply;
    <span class="type">uint256</span> <span class="kw">public constant</span> MAX_SUPPLY   = <span class="num">${cfg.maxSupply}</span>;
    <span class="type">uint256</span> <span class="kw">public</span> mintPrice             = <span class="num">${priceWei}</span>;
    <span class="type">uint256</span> <span class="kw">public constant</span> MAX_PER_WALLET = <span class="num">${cfg.maxWallet}</span>;
    <span class="type">uint256</span> <span class="kw">public</span> teamReserve           = <span class="num">100</span>;

    <span class="cm">// ── Rarity Hard Caps (Synced with generator.js) ──</span>
    <span class="type">mapping</span>(<span class="type">string</span> =&gt; <span class="type">uint256</span>) <span class="kw">public</span> rarityCap;
    <span class="type">mapping</span>(<span class="type">string</span> =&gt; <span class="type">uint256</span>) <span class="kw">public</span> rarityMinted;

    <span class="cm">// ── Whitelist (Merkle Root from Admin Snapshot) ──</span>
    <span class="type">bytes32</span> <span class="kw">public</span> merkleRoot = <span class="type">${cfg.merkleRoot}</span>;
    <span class="type">bool</span>    <span class="kw">public</span> whitelistOnly = <span class="kw">true</span>;
    <span class="type">mapping</span>(<span class="type">address</span> =&gt; <span class="type">uint256</span>) <span class="kw">public</span> walletMinted;

    <span class="cm">// ── Reveal System ─────────────────────────────────</span>
    <span class="type">string</span> <span class="kw">private</span> _baseTokenURI;
    <span class="type">string</span> <span class="kw">public</span>  hiddenURI = <span class="str">"ipfs://HIDDEN_CID/hidden.json"</span>;
    <span class="type">bool</span>   <span class="kw">public</span>  revealed  = <span class="kw">false</span>;

    <span class="cm">// ── Royalties (EIP-2981) ──────────────────────────</span>
    <span class="type">uint96</span>  <span class="kw">private</span> _royaltyFee      = <span class="num">${cfg.royalty * 100}</span>; <span class="cm">// ${cfg.royalty}%</span>
    <span class="type">address</span> <span class="kw">private</span> _royaltyReceiver;

    <span class="cm">// ── Events ────────────────────────────────────────</span>
    <span class="ev">event</span> <span class="fn">Minted</span>(<span class="type">address indexed</span> to, <span class="type">uint256 indexed</span> tokenId);
    <span class="ev">event</span> <span class="fn">Revealed</span>();
    <span class="ev">event</span> <span class="fn">BaseURISet</span>(<span class="type">string</span> newURI);

    <span class="kw">constructor</span>(<span class="type">string memory</span> baseURI_)
        <span class="fn">ERC721</span>(<span class="str">"${cfg.name}"</span>, <span class="str">"${cfg.sym}"</span>)
        <span class="fn">Ownable</span>(msg.sender)
    {
        _baseTokenURI    = baseURI_;
        _royaltyReceiver = msg.sender;
        
        <span class="cm">// UPGRADE: Caps now match your dynamic generator state</span>
        rarityCap[<span class="str">"legendary"</span>] = <span class="num">${SUPPLY_CAPS.legendary}</span>;
        rarityCap[<span class="str">"epic"</span>]      = <span class="num">${SUPPLY_CAPS.epic}</span>;
        rarityCap[<span class="str">"rare"</span>]      = <span class="num">${SUPPLY_CAPS.rare}</span>;
        rarityCap[<span class="str">"uncommon"</span>]  = <span class="num">${SUPPLY_CAPS.uncommon}</span>;
        rarityCap[<span class="str">"common"</span>]    = <span class="num">${SUPPLY_CAPS.common}</span>;
    }

    <span class="cm">// ── Public Mint (With Proof-based Allowance for Survivors) ───────────────────</span>
    <span class="kw">function</span> <span class="fn">mint</span>(
        <span class="type">uint256</span> quantity,
        <span class="type">uint256</span> maxAllowance,
        <span class="type">bytes32[] calldata</span> merkleProof
    ) <span class="kw">external payable whenNotPaused</span> {
        <span class="kw">require</span>(totalSupply + quantity &lt;= MAX_SUPPLY,           <span class="str">"Max supply reached"</span>);
        <span class="kw">require</span>(msg.value &gt;= mintPrice * quantity,             <span class="str">"Insufficient ETH"</span>);
        
        <span class="kw">if</span> (whitelistOnly) {
            <span class="type">bytes32</span> leaf = <span class="fn">keccak256</span>(<span class="fn">abi.encodePacked</span>(msg.sender, maxAllowance));
            <span class="kw">require</span>(<span class="type">MerkleProof</span>.<span class="fn">verify</span>(merkleProof, merkleRoot, leaf), <span class="str">"Invalid proof"</span>);
            <span class="kw">require</span>(walletMinted[msg.sender] + quantity &lt;= maxAllowance, <span class="str">"Exceeds tier allowance"</span>);
        } <span class="kw">else</span> {
            <span class="kw">require</span>(walletMinted[msg.sender] + quantity &lt;= MAX_PER_WALLET, <span class="str">"Exceeds wallet limit"</span>);
        }

        <span class="kw">for</span> (<span class="type">uint256</span> i = <span class="num">0</span>; i &lt; quantity; i++) {
            <span class="type">uint256</span> tokenId = ++totalSupply;
            <span class="fn">_safeMint</span>(msg.sender, tokenId);
            walletMinted[msg.sender]++;
            <span class="kw">emit</span> <span class="fn">Minted</span>(msg.sender, tokenId);
        }
    }

    <span class="cm">// ── Team Operations ───────────────────────────────</span>
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

    <span class="kw">function</span> <span class="fn">royaltyInfo</span>(<span class="type">uint256</span>, <span class="type">uint256</span> salePrice)
        <span class="kw">external view override returns</span> (<span class="type">address</span>, <span class="type">uint256</span>)
    {
        <span class="kw">return</span> (_royaltyReceiver, (salePrice * _royaltyFee) / <span class="num">10000</span>);
    }

    <span class="kw">function</span> <span class="fn">withdraw</span>() <span class="kw">external onlyOwner</span> {
        (<span class="type">bool</span> ok,) = msg.sender.<span class="fn">call</span>{value: <span class="fn">address</span>(<span class="kw">this</span>).<span class="fn">balance</span>}(<span class="str">""</span>);
        <span class="kw">require</span>(ok, <span class="str">"Withdraw failed"</span>);
    }

    <span class="kw">function</span> <span class="fn">supportsInterface</span>(<span class="type">bytes4</span> id)
        <span class="kw">public view override</span>(<span class="type">ERC721</span>, <span class="type">IERC165</span>) <span class="kw">returns</span> (<span class="type">bool</span>)
    {
        <span class="kw">return</span> id == <span class="kw">type</span>(<span class="type">IERC2981</span>).<span class="fn">interfaceId</span> || <span class="kw">super</span>.<span class="fn">supportsInterface</span>(id);
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
   HARDHAT DEPLOY SCRIPT (BASE MAINNET)
───────────────────────────────────────────── */
function buildDeployHTML(cfg) {
  return `<span class="cm">// scripts/deploy.js (Hardhat - Optimized for Base Mainnet)</span>
<span class="kw">const</span> { ethers } = <span class="fn">require</span>(<span class="str">"hardhat"</span>);

<span class="kw">async function</span> <span class="fn">main</span>() {
  <span class="kw">const</span> [deployer] = <span class="kw">await</span> ethers.<span class="fn">getSigners</span>();
  console.<span class="fn">log</span>(<span class="str">"Deploying ${cfg.name} to Base from:"</span>, deployer.address);

  <span class="kw">const</span> baseURI = <span class="str">"${cfg.baseURI}"</span>;
  <span class="kw">const</span> Factory  = <span class="kw">await</span> ethers.<span class="fn">getContractFactory</span>(<span class="str">"${cfg.name}"</span>);
  <span class="kw">const</span> contract = <span class="kw">await</span> Factory.<span class="fn">deploy</span>(baseURI);
  
  <span class="kw">await</span> contract.<span class="fn">waitForDeployment</span>();
  console.<span class="fn">log</span>(<span class="str">"✓ Mech Ranger Unit Deployed on Base:"</span>, <span class="kw">await</span> contract.<span class="fn">getAddress</span>());
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
  toast('Base Logic Synchronized', 'success');
}

/* ─────────────────────────────────────────────
   MINT SIMULATOR
───────────────────────────────────────────── */
function updateMintSim() {
  const wrap = document.getElementById('mintSimRows');
  if (!wrap) return;

  const price   = parseFloat(document.getElementById('cPrice')?.value)     || 0.05;
  const total   = parseInt(document.getElementById('cMaxSupply')?.value)   || 10000;
  const royalty = parseFloat(document.getElementById('cRoyalty')?.value)   || 5;

  const TIERS = [
    { key:'legendary', label:'LEGENDARY', col:'#ffc400' },
    { key:'epic',      label:'EPIC',      col:'#b44fff' },
    { key:'rare',      label:'RARE',      col:'#00e5ff' },
    { key:'uncommon',  label:'UNCOMMON',  col:'#00e676' },
    { key:'common',    label:'COMMON',    col:'#4a4a72' },
  ];

  // UPGRADE: Revenue calculation now reflects the 10k batch size
  const estRevenue = total * price;

  wrap.innerHTML = TIERS.map(t => `
    <div class="mint-tier-row">
      <div class="mt-label" style="color:${t.col}">${t.label}</div>
      <div class="mt-bar-bg">
        <div class="mt-bar-fill" style="width:${(mintedCount[t.key]/SUPPLY_CAPS[t.key]*100).toFixed(1)}%;background:${t.col}"></div>
      </div>
      <div class="mt-count">${mintedCount[t.key]}/${SUPPLY_CAPS[t.key]}</div>
    </div>`).join('');

  const sTot = document.getElementById('simTotal');
  const sRev = document.getElementById('simRevenue');
  const sRoy = document.getElementById('simRoyalty');

  if(sTot) sTot.textContent = total.toLocaleString();
  if(sRev) sRev.textContent = estRevenue.toFixed(2) + ' ETH';
  if(sRoy) sRoy.textContent = royalty + '% Royalty (Base Secured)';
}

/* ─────────────────────────────────────────────
   NETWORK PICKER (LOCKED TO BASE)
───────────────────────────────────────────── */
const NETWORK_RPCS = {
  '8453':  'https://mainnet.base.org',
};

function pickNet(el, name, chainId) {
  document.querySelectorAll('.network-badge').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  const rpcInput = document.getElementById('netRPC');
  if(rpcInput) rpcInput.value = NETWORK_RPCS['8453'];
  toast('NETWORK LOCKED: ' + name + ' Deployment Only', 'warn');
}
