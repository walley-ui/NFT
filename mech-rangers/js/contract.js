/* ═══════════════════════════════════════════════════════
   contract.js — Smart Contract Panel
   Builds & displays the Solidity contract + deploy script.
   Handles network selection + mint simulator.
   Depends on: generator.js (SUPPLY_CAPS, mintedCount)
   ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   CONFIG READERS
   Pull live values from the deploy config form.
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
  };
}

/* ─────────────────────────────────────────────
   SOLIDITY CONTRACT — syntax-highlighted HTML
───────────────────────────────────────────── */
function buildSolidityHTML(cfg) {
  const priceWei = `${(cfg.price * 1000).toFixed(0)} finney`;
  return `<span class="cm">// SPDX-License-Identifier: MIT</span>
<span class="cm">// Mech Rangers ERC-721 — Production Contract</span>
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

    <span class="cm">// ── Rarity Hard Caps ──────────────────────────────</span>
    <span class="type">mapping</span>(<span class="type">string</span> =&gt; <span class="type">uint256</span>) <span class="kw">public</span> rarityCap;
    <span class="type">mapping</span>(<span class="type">string</span> =&gt; <span class="type">uint256</span>) <span class="kw">public</span> rarityMinted;

    <span class="cm">// ── Whitelist ──────────────────────────────────────</span>
    <span class="type">bytes32</span> <span class="kw">public</span> merkleRoot;
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
        <span class="cm">// Hard-cap each rarity tier</span>
        rarityCap[<span class="str">"legendary"</span>] = <span class="num">100</span>;
        rarityCap[<span class="str">"epic"</span>]      = <span class="num">900</span>;
        rarityCap[<span class="str">"rare"</span>]     = <span class="num">2000</span>;
        rarityCap[<span class="str">"uncommon"</span>] = <span class="num">3000</span>;
        rarityCap[<span class="str">"common"</span>]   = <span class="num">4000</span>;
    }

    <span class="cm">// ── Public Mint ───────────────────────────────────</span>
    <span class="kw">function</span> <span class="fn">mint</span>(
        <span class="type">uint256</span> quantity,
        <span class="type">bytes32[] calldata</span> merkleProof
    ) <span class="kw">external payable whenNotPaused</span> {
        <span class="kw">require</span>(totalSupply + quantity &lt;= MAX_SUPPLY,           <span class="str">"Max supply reached"</span>);
        <span class="kw">require</span>(walletMinted[msg.sender] + quantity &lt;= MAX_PER_WALLET, <span class="str">"Exceeds wallet limit"</span>);
        <span class="kw">require</span>(msg.value &gt;= mintPrice * quantity,             <span class="str">"Insufficient ETH"</span>);
        <span class="kw">if</span> (whitelistOnly) {
            <span class="type">bytes32</span> leaf = <span class="fn">keccak256</span>(<span class="fn">abi.encodePacked</span>(msg.sender));
            <span class="kw">require</span>(<span class="type">MerkleProof</span>.<span class="fn">verify</span>(merkleProof, merkleRoot, leaf), <span class="str">"Not whitelisted"</span>);
        }
        <span class="kw">for</span> (<span class="type">uint256</span> i = <span class="num">0</span>; i &lt; quantity; i++) {
            <span class="type">uint256</span> tokenId = ++totalSupply;
            <span class="fn">_safeMint</span>(msg.sender, tokenId);
            walletMinted[msg.sender]++;
            <span class="kw">emit</span> <span class="fn">Minted</span>(msg.sender, tokenId);
        }
    }

    <span class="cm">// ── Owner: Team Reserve ───────────────────────────</span>
    <span class="kw">function</span> <span class="fn">ownerMint</span>(<span class="type">address</span> to, <span class="type">uint256</span> quantity) <span class="kw">external onlyOwner</span> {
        <span class="kw">require</span>(quantity &lt;= teamReserve,                        <span class="str">"Exceeds team reserve"</span>);
        <span class="kw">require</span>(totalSupply + quantity &lt;= MAX_SUPPLY,           <span class="str">"Max supply reached"</span>);
        teamReserve -= quantity;
        <span class="kw">for</span> (<span class="type">uint256</span> i = <span class="num">0</span>; i &lt; quantity; i++) { <span class="fn">_safeMint</span>(to, ++totalSupply); }
    }

    <span class="cm">// ── Reveal ────────────────────────────────────────</span>
    <span class="kw">function</span> <span class="fn">reveal</span>(<span class="type">string memory</span> finalBaseURI) <span class="kw">external onlyOwner</span> {
        revealed = <span class="kw">true</span>;
        _baseTokenURI = finalBaseURI;
        <span class="kw">emit</span> <span class="fn">Revealed</span>();
    }

    <span class="cm">// ── Token URI ─────────────────────────────────────</span>
    <span class="kw">function</span> <span class="fn">tokenURI</span>(<span class="type">uint256</span> tokenId) <span class="kw">public view override returns</span> (<span class="type">string memory</span>) {
        <span class="fn">_requireOwned</span>(tokenId);
        <span class="kw">if</span> (!revealed) <span class="kw">return</span> hiddenURI;
        <span class="kw">return</span> <span class="type">string</span>(<span class="fn">abi.encodePacked</span>(_baseTokenURI, <span class="fn">_toString</span>(tokenId), <span class="str">".json"</span>));
    }

    <span class="cm">// ── EIP-2981 Royalties ────────────────────────────</span>
    <span class="kw">function</span> <span class="fn">royaltyInfo</span>(<span class="type">uint256</span>, <span class="type">uint256</span> salePrice)
        <span class="kw">external view override returns</span> (<span class="type">address</span>, <span class="type">uint256</span>)
    {
        <span class="kw">return</span> (_royaltyReceiver, (salePrice * _royaltyFee) / <span class="num">10000</span>);
    }

    <span class="cm">// ── Admin ─────────────────────────────────────────</span>
    <span class="kw">function</span> <span class="fn">setMintPrice</span>(<span class="type">uint256</span> p) <span class="kw">external onlyOwner</span> { mintPrice = p; }
    <span class="kw">function</span> <span class="fn">setMerkleRoot</span>(<span class="type">bytes32</span> r) <span class="kw">external onlyOwner</span> { merkleRoot = r; }
    <span class="kw">function</span> <span class="fn">setWhitelistOnly</span>(<span class="type">bool</span> wl) <span class="kw">external onlyOwner</span> { whitelistOnly = wl; }
    <span class="kw">function</span> <span class="fn">setBaseURI</span>(<span class="type">string memory</span> uri) <span class="kw">external onlyOwner</span> {
        _baseTokenURI = uri; <span class="kw">emit</span> <span class="fn">BaseURISet</span>(uri);
    }
    <span class="kw">function</span> <span class="fn">pause</span>()   <span class="kw">external onlyOwner</span> { <span class="fn">_pause</span>(); }
    <span class="kw">function</span> <span class="fn">unpause</span>() <span class="kw">external onlyOwner</span> { <span class="fn">_unpause</span>(); }
    <span class="kw">function</span> <span class="fn">withdraw</span>() <span class="kw">external onlyOwner</span> {
        (<span class="type">bool</span> ok,) = msg.sender.<span class="fn">call</span>{value: <span class="fn">address</span>(<span class="kw">this</span>).<span class="fn">balance</span>}(<span class="str">""</span>);
        <span class="kw">require</span>(ok, <span class="str">"Withdraw failed"</span>);
    }

    <span class="cm">// ── Interface Support ─────────────────────────────</span>
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
   HARDHAT DEPLOY SCRIPT — syntax-highlighted HTML
───────────────────────────────────────────── */
function buildDeployHTML(cfg) {
  return `<span class="cm">// scripts/deploy.js (Hardhat)</span>
<span class="kw">const</span> { ethers } = <span class="fn">require</span>(<span class="str">"hardhat"</span>);

<span class="kw">async function</span> <span class="fn">main</span>() {
  <span class="kw">const</span> [deployer] = <span class="kw">await</span> ethers.<span class="fn">getSigners</span>();
  console.<span class="fn">log</span>(<span class="str">"Deploying from:"</span>, deployer.address);

  <span class="kw">const</span> baseURI = <span class="str">"${cfg.baseURI}"</span>;

  <span class="kw">const</span> Factory  = <span class="kw">await</span> ethers.<span class="fn">getContractFactory</span>(<span class="str">"${cfg.name}"</span>);
  <span class="kw">const</span> contract = <span class="kw">await</span> Factory.<span class="fn">deploy</span>(baseURI);
  <span class="kw">await</span> contract.<span class="fn">waitForDeployment</span>();

  <span class="kw">const</span> addr = <span class="kw">await</span> contract.<span class="fn">getAddress</span>();
  console.<span class="fn">log</span>(<span class="str">"✓ ${cfg.name} deployed:"</span>, addr);

  <span class="cm">// Verify on Etherscan:</span>
  <span class="cm">// npx hardhat verify --network mainnet {addr} "${cfg.baseURI}"</span>
}

<span class="fn">main</span>().<span class="fn">catch</span>(e => { console.<span class="fn">error</span>(e); process.<span class="fn">exit</span>(1); });`;
}

/* ─────────────────────────────────────────────
   BUILD CONTRACT PANEL
   Called on tab switch + Update button.
───────────────────────────────────────────── */
function buildContractCode() {
  const cfg = getContractConfig();
  document.getElementById('solCode').innerHTML     = buildSolidityHTML(cfg);
  document.getElementById('deployScript').innerHTML = buildDeployHTML(cfg);
  updateMintSim();
}

function updateContract() {
  buildContractCode();
  toast('Contract updated', 'success');
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

  wrap.innerHTML = TIERS.map(t => `
    <div class="mint-tier-row">
      <div class="mt-label" style="color:${t.col}">${t.label}</div>
      <div class="mt-bar-bg">
        <div class="mt-bar-fill" style="width:${(mintedCount[t.key]/SUPPLY_CAPS[t.key]*100).toFixed(1)}%;background:${t.col}"></div>
      </div>
      <div class="mt-count">${mintedCount[t.key]}/${SUPPLY_CAPS[t.key]}</div>
    </div>`).join('');

  document.getElementById('simTotal').textContent   = total.toLocaleString();
  document.getElementById('simRevenue').textContent = `${(total * price).toFixed(0)} ETH`;
  document.getElementById('simRoyalty').textContent = `${royalty}% on secondary`;
}

/* ─────────────────────────────────────────────
   NETWORK PICKER
───────────────────────────────────────────── */
const NETWORK_RPCS = {
  '1':     'https://mainnet.infura.io/v3/YOUR_KEY',
  '137':   'https://polygon-rpc.com',
  '8453':  'https://mainnet.base.org',
  '42161': 'https://arb1.arbitrum.io/rpc',
};

function pickNet(el, name, chainId) {
  document.querySelectorAll('.network-badge').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('netRPC').value = NETWORK_RPCS[chainId] || '';
  toast(`Network: ${name} (Chain ${chainId})`, 'info');
}
