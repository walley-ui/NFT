// SPDX-License-Identifier: MIT
// Mech Rangers ERC-721 — Production Contract (Optimized)
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// UPGRADE: Inheriting from ERC2981 directly is more gas-efficient than IERC2981
contract MechRangers is ERC721, Ownable, ERC2981, Pausable {
    using Strings for uint256;

    // ── Supply & Pricing ──────────────────────────────────────
    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY     = 10000;
    uint256 public mintPrice               = 0.05 ether; 
    uint256 public constant MAX_PER_WALLET = 5;
    uint256 public teamReserve             = 100;

    // ── Rarity Hard Caps ──────────────────────────────────────
    mapping(string => uint256) public rarityCap;
    mapping(string => uint256) public rarityMinted;

    // ── Whitelist & Provenance ────────────────────────────────
    bytes32 public merkleRoot;
    bool    public whitelistOnly = true;
    string  public provenanceHash; 
    mapping(address => uint256) public walletMinted;

    // ── Reveal System ─────────────────────────────────────────
    string  private _baseTokenURI;
    string public hiddenURI = "ipfs://QmYourActualHiddenJSONCidHere/hidden.json";
    bool    public  revealed  = false;

    // ── Events ────────────────────────────────────────────────
    event Minted(address indexed to, uint256 indexed tokenId);
    event Revealed(string baseURI);
    event BaseURISet(string newURI);
    event PermanentURI(string _value, uint256 indexed _id);

    // ── Constructor ───────────────────────────────────────────
    constructor(string memory initialBaseURI)
        ERC721("MechRangers", "MECHR")
        Ownable(msg.sender)
    {
        _baseTokenURI = initialBaseURI;
        
        // UPGRADE: Using standard ERC2981 internal setter
        _setDefaultRoyalty(msg.sender, 500); // 5%

        rarityCap["legendary"] = 100;
        rarityCap["epic"]      = 900;
        rarityCap["rare"]      = 2000;
        rarityCap["uncommon"]  = 3000;
        rarityCap["common"]    = 4000;
    }

    // ── Public Mint ───────────────────────────────────────────
    function mint(
        uint256 quantity,
        bytes32[] calldata merkleProof
    ) external payable whenNotPaused {
        require(totalSupply + quantity <= MAX_SUPPLY, "Collection Sold Out");
        require(walletMinted[msg.sender] + quantity <= MAX_PER_WALLET, "Exceeds Wallet Limit");
        require(msg.value >= mintPrice * quantity, "Insufficient Payment");

        if (whitelistOnly) {
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Not on Whitelist");
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
        
        if (!revealed) {
            return hiddenURI;
        }

        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    // ── Admin Functions ───────────────────────────────────────
    function setMintPrice(uint256 newPrice)   external onlyOwner { mintPrice = newPrice; }
    function setMerkleRoot(bytes32 newRoot)   external onlyOwner { merkleRoot = newRoot; }
    function setWhitelistOnly(bool state)     external onlyOwner { whitelistOnly = state; }
    function setHiddenURI(string memory uri)  external onlyOwner { hiddenURI = uri; }
    
    // UPGRADE: Simplified royalty setter using ERC2981 standard
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
    // UPGRADE: Fixed conflict with OpenZeppelin v5 supportsInterface
    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
