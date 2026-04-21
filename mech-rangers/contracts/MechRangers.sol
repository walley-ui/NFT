// SPDX-License-Identifier: MIT
// Mech Rangers ERC-721 — Production Contract v3.1 (Strict Limit Upgrades)
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MechRangers is ERC721, Ownable, ERC2981, Pausable {
    using Strings for uint256;

    // ── Supply & Pricing ──────────────────────────────────────
    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY       = 10000;
    uint256 public mintPrice                 = 0.00009 ether; 
    
    // Upgraded Limits
    uint256 public constant LIMIT_WL_FREE    = 1;
    uint256 public constant LIMIT_GENERAL    = 2;
    uint256 public constant MAX_FREE_WL      = 700; // Hard cap for Phase 0
    
    uint256 public freeMinted; // Tracks manual/community free pool
    uint256 public teamReserve               = 100;

    // ── Rarity Hard Caps ──────────────────────────────────────
    mapping(string => uint256) public rarityCap;
    mapping(string => uint256) public rarityMinted;

    // ── Whitelist & Provenance ────────────────────────────────
    bytes32 public wlRoot;  
    bytes32 public gtdRoot; 
    
    enum MintStep { Closed, WL, GTD, Public }
    MintStep public currentStep = MintStep.Closed;

    string  public provenanceHash; 
    mapping(address => uint256) public walletMinted;

    // ── Reveal System ─────────────────────────────────────────
    string  private _baseTokenURI;
    string  public  hiddenURI;
    bool    public  revealed  = false;

    // ── Events ────────────────────────────────────────────────
    event Minted(address indexed to, uint256 indexed tokenId);
    event Revealed(string baseURI);
    event BaseURISet(string newURI);
    event PermanentURI(string _value, uint256 indexed _id);
    event StepChanged(MintStep newStep);

    // ── Constructor ───────────────────────────────────────────
    constructor(string memory initialBaseURI)
        ERC721("MechRangers", "MECHR")
        Ownable(msg.sender)
    {
        _baseTokenURI = initialBaseURI; 
        _setDefaultRoyalty(msg.sender, 500); // 5%

        rarityCap["mythic"]    = 2000;
        rarityCap["legendary"] = 3000;
        rarityCap["epic"]      = 5000;
    }

    // ── Public Mint (UPGRADED for Variable Allowance) ─────────
    function mint(
        uint256 quantity,
        bytes32[] calldata merkleProof
    ) external payable whenNotPaused {
        require(currentStep != MintStep.Closed, "Minting is Closed");
        require(totalSupply + quantity <= MAX_SUPPLY, "Collection Sold Out");

        // ── PHASE LOGIC ──
        if (currentStep == MintStep.WL) {
            // WL Phase (1 Unit Max - Hard Capped at 700 total)
            require(walletMinted[msg.sender] + quantity <= LIMIT_WL_FREE, "WL Limit: 1 Unit");
            require(freeMinted + quantity <= MAX_FREE_WL, "Free WL Pool Exhausted");
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            require(MerkleProof.verify(merkleProof, wlRoot, leaf), "Not on Free WL");
            freeMinted += quantity;
        } 
        else if (currentStep == MintStep.GTD) {
            // GTD Phase (2 Units Max)
            require(walletMinted[msg.sender] + quantity <= LIMIT_GENERAL, "GTD Limit: 2 Units");
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            require(MerkleProof.verify(merkleProof, gtdRoot, leaf), "Not on GTD List");
            require(msg.value >= mintPrice * quantity, "Insufficient Payment");
        }
        else if (currentStep == MintStep.Public) {
            // Public Phase (2 Units Max)
            require(walletMinted[msg.sender] + quantity <= LIMIT_GENERAL, "Public Limit: 2 Units");
            require(msg.value >= mintPrice * quantity, "Insufficient Payment");
        }

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = ++totalSupply;
            walletMinted[msg.sender]++;
            _safeMint(msg.sender, tokenId);
            emit Minted(msg.sender, tokenId);
        }
    }

    // ── Owner: Team Reserve ───────────────────────────────────
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        require(quantity <= teamReserve, "Team Reserve Depleted");
        require(totalSupply + quantity <= MAX_SUPPLY, "Supply Limit Exceeded");
        
        teamReserve -= quantity;
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = ++totalSupply;
            _safeMint(to, tokenId);
        }
    }

    // ── Reveal & Provenance ───────────────────────────────────
    function reveal(string memory finalBaseURI, string memory _provenance) external onlyOwner {
        require(!revealed, "Already Revealed");
        revealed       = true;
        _baseTokenURI  = finalBaseURI;
        provenanceHash = _provenance;
        emit Revealed(finalBaseURI);
    }

    // ── Token URI ─────────────────────────────────────────────
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        if (!revealed) return hiddenURI;
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    // ── Admin Functions ───────────────────────────────────────
    function setMintPrice(uint256 newPrice)   external onlyOwner { mintPrice = newPrice; }
    
    function setRoots(bytes32 _wl, bytes32 _gtd) external onlyOwner {
        wlRoot = _wl;
        gtdRoot = _gtd;
    }
    
    function setStep(MintStep _step) external onlyOwner { 
        currentStep = _step; 
        emit StepChanged(_step);
    }
    
    function setHiddenURI(string memory uri)  external onlyOwner { hiddenURI = uri; }
    
    function setRoyaltyInfo(address receiver, uint96 fee) external onlyOwner {
        require(fee <= 1000, "Fee too high"); 
        _setDefaultRoyalty(receiver, fee);
    }

    function setBaseURI(string memory uri) external onlyOwner {
        _baseTokenURI = uri;
        emit BaseURISet(uri);
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal Failed");
    }

    // ── Interface Support ─────────────────────────────────────
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
