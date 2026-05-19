// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VaultXPropertyNFT
 * @notice Minimal local ERC-721-compatible property collection for rental-yield testing and demos.
 * @dev This fixture intentionally implements only the ERC-721 surface required by VaultXRentalYield
 *      and the frontend gallery: ownerOf(), balanceOf(), totalSupply(), Transfer events, and owner-led minting.
 */
contract VaultXPropertyNFT {
    string public constant name = "VaultX Property";
    string public constant symbol = "VXPROP";

    address public owner;
    uint256 public totalSupply;

    uint256 private _nextTokenId = 1;
    string private _baseTokenUri;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "VaultXPropertyNFT: not owner");
        _;
    }

    /**
     * @notice Deploys the local property NFT collection.
     * @param baseTokenUri Initial token metadata base URI.
     */
    constructor(string memory baseTokenUri) {
        owner = msg.sender;
        _baseTokenUri = baseTokenUri;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Returns the owner of a property token.
     * @param tokenId Property token ID to inspect.
     * @return tokenOwner Current token owner.
     */
    function ownerOf(uint256 tokenId) public view returns (address tokenOwner) {
        tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "VaultXPropertyNFT: nonexistent token");
    }

    /**
     * @notice Returns the number of property tokens owned by a wallet.
     * @param account Wallet to inspect.
     * @return balance Number of owned property tokens.
     */
    function balanceOf(address account) external view returns (uint256 balance) {
        require(account != address(0), "VaultXPropertyNFT: zero account");
        return _balances[account];
    }

    /**
     * @notice Returns a token URI for local metadata resolution.
     * @param tokenId Property token ID.
     * @return uri Token metadata URI.
     */
    function tokenURI(uint256 tokenId) external view returns (string memory uri) {
        ownerOf(tokenId);
        return string(abi.encodePacked(_baseTokenUri, _toString(tokenId), ".json"));
    }

    /**
     * @notice Mints one property NFT to a recipient.
     * @param to Wallet receiving the property NFT.
     * @return tokenId Newly minted token ID.
     */
    function mint(address to) public onlyOwner returns (uint256 tokenId) {
        require(to != address(0), "VaultXPropertyNFT: zero recipient");
        tokenId = _nextTokenId;
        _nextTokenId += 1;
        totalSupply += 1;
        _owners[tokenId] = to;
        _balances[to] += 1;
        emit Transfer(address(0), to, tokenId);
    }

    /**
     * @notice Mints multiple property NFTs to one recipient.
     * @param to Wallet receiving the property NFTs.
     * @param count Number of NFTs to mint.
     */
    function batchMint(address to, uint256 count) external onlyOwner {
        require(count > 0, "VaultXPropertyNFT: zero count");
        for (uint256 i = 0; i < count; i += 1) {
            mint(to);
        }
    }

    /**
     * @notice Transfers a token owned by the caller.
     * @param from Current token owner.
     * @param to New token owner.
     * @param tokenId Property token ID.
     */
    function transferFrom(address from, address to, uint256 tokenId) external {
        require(ownerOf(tokenId) == from, "VaultXPropertyNFT: wrong owner");
        require(msg.sender == from, "VaultXPropertyNFT: caller not owner");
        require(to != address(0), "VaultXPropertyNFT: zero recipient");

        _owners[tokenId] = to;
        _balances[from] -= 1;
        _balances[to] += 1;

        emit Transfer(from, to, tokenId);
    }

    /**
     * @notice Updates the metadata base URI.
     * @param baseTokenUri New token metadata base URI.
     */
    function setBaseURI(string calldata baseTokenUri) external onlyOwner {
        _baseTokenUri = baseTokenUri;
    }

    /**
     * @notice Transfers local fixture ownership.
     * @param newOwner New contract owner.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "VaultXPropertyNFT: zero owner");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits += 1;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
