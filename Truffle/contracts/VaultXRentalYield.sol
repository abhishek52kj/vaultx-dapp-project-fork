// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VaultXRentalYield
 * @notice Epoch-based ETH rental-yield distribution for VaultX property NFTs.
 * @dev Property managers deposit verified rental income; current NFT holders claim
 *      the per-token share for every unclaimed epoch.
 */
contract VaultXRentalYield is Ownable, AccessControl, ReentrancyGuard {
    bytes32 public constant PROPERTY_MANAGER_ROLE = keccak256("PROPERTY_MANAGER_ROLE");
    uint256 public constant EMERGENCY_WITHDRAW_DELAY = 7 days;

    IERC721YieldToken public immutable propertyNft;
    uint256 public currentEpochId;
    uint256 public emergencyWithdrawInitiatedAt;

    struct YieldEpoch {
        uint256 totalAmount;
        uint256 perTokenAmount;
        uint256 supplySnapshot;
        uint256 depositedAt;
    }

    mapping(uint256 => YieldEpoch) public epochs;
    mapping(uint256 epochId => mapping(uint256 tokenId => bool)) public hasClaimed;

    event YieldDeposited(
        uint256 indexed epochId,
        address indexed manager,
        uint256 amount,
        uint256 supplySnapshot,
        uint256 perTokenAmount
    );
    event YieldClaimed(
        address indexed holder,
        uint256 indexed tokenId,
        uint256 indexed epochId,
        uint256 amount
    );
    event EmergencyInitiated(address indexed owner, uint256 executableAt);
    event EmergencyWithdrawn(address indexed owner, uint256 amount);

    /**
     * @notice Deploys the rental-yield contract for a fixed ERC-721 property collection.
     * @param propertyNft_ Address of the ERC-721 contract exposing ownerOf() and totalSupply().
     */
    constructor(address propertyNft_) Ownable(msg.sender) {
        require(propertyNft_ != address(0), "VaultXRentalYield: zero NFT address");
        propertyNft = IERC721YieldToken(propertyNft_);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Deposits ETH as a new rental-yield epoch.
     * @dev Caller must hold PROPERTY_MANAGER_ROLE. Owner bypass is intentionally not allowed.
     */
    function depositYield() external payable onlyRole(PROPERTY_MANAGER_ROLE) {
        require(msg.value > 0, "VaultXRentalYield: zero deposit");

        uint256 supply = propertyNft.totalSupply();
        require(supply > 0, "VaultXRentalYield: zero NFT supply");

        uint256 nextEpochId = currentEpochId + 1;
        uint256 perTokenAmount = msg.value / supply;
        require(perTokenAmount > 0, "VaultXRentalYield: deposit too small");

        currentEpochId = nextEpochId;
        epochs[nextEpochId] = YieldEpoch({
            totalAmount: msg.value,
            perTokenAmount: perTokenAmount,
            supplySnapshot: supply,
            depositedAt: block.timestamp
        });

        emit YieldDeposited(nextEpochId, msg.sender, msg.value, supply, perTokenAmount);
    }

    /**
     * @notice Claims all unclaimed rental yield for each supplied property token.
     * @dev Verifies current ownerOf(tokenId), marks each epoch claimed before sending ETH,
     *      and performs a single ETH transfer at the end of the function.
     * @param tokenIds Property token IDs to claim for.
     */
    function claimYield(uint256[] calldata tokenIds) external nonReentrant {
        require(tokenIds.length > 0, "VaultXRentalYield: empty token list");
        _requireUniqueTokenIds(tokenIds);

        uint256 totalClaim;
        uint256 epochCount = currentEpochId;

        for (uint256 tokenIndex = 0; tokenIndex < tokenIds.length; tokenIndex += 1) {
            uint256 tokenId = tokenIds[tokenIndex];
            require(propertyNft.ownerOf(tokenId) == msg.sender, "VaultXRentalYield: not token owner");

            for (uint256 epochId = 1; epochId <= epochCount; epochId += 1) {
                YieldEpoch memory epoch = epochs[epochId];
                if (tokenId <= epoch.supplySnapshot && !hasClaimed[epochId][tokenId]) {
                    uint256 amount = epoch.perTokenAmount;
                    if (amount > 0) {
                        hasClaimed[epochId][tokenId] = true;
                        totalClaim += amount;
                        emit YieldClaimed(msg.sender, tokenId, epochId, amount);
                    }
                }
            }
        }

        require(totalClaim > 0, "VaultXRentalYield: no yield");
        require(address(this).balance >= totalClaim, "VaultXRentalYield: insufficient ETH");

        (bool success, ) = payable(msg.sender).call{value: totalClaim}("");
        require(success, "VaultXRentalYield: ETH transfer failed");
    }

    /**
     * @notice Returns total unclaimed ETH for a property token across all epochs.
     * @param tokenId Property token ID to inspect.
     * @return amount Total claimable ETH for tokenId.
     */
    function unclaimedYield(uint256 tokenId) external view returns (uint256 amount) {
        propertyNft.ownerOf(tokenId);
        uint256 epochCount = currentEpochId;
        for (uint256 epochId = 1; epochId <= epochCount; epochId += 1) {
            YieldEpoch memory epoch = epochs[epochId];
            if (tokenId <= epoch.supplySnapshot && !hasClaimed[epochId][tokenId]) {
                amount += epoch.perTokenAmount;
            }
        }
    }

    /**
     * @notice Grants the property-manager role to an address.
     * @param manager Address that will be allowed to deposit rental yield.
     */
    function grantPropertyManager(address manager) external onlyOwner {
        require(manager != address(0), "VaultXRentalYield: zero manager");
        grantRole(PROPERTY_MANAGER_ROLE, manager);
    }

    /**
     * @notice Revokes the property-manager role from an address.
     * @param manager Address that will no longer be allowed to deposit rental yield.
     */
    function revokePropertyManager(address manager) external onlyOwner {
        require(manager != address(0), "VaultXRentalYield: zero manager");
        revokeRole(PROPERTY_MANAGER_ROLE, manager);
    }

    /**
     * @notice Starts the seven-day emergency withdrawal timelock.
     */
    function initiateEmergencyWithdraw() external onlyOwner {
        emergencyWithdrawInitiatedAt = block.timestamp;
        emit EmergencyInitiated(msg.sender, block.timestamp + EMERGENCY_WITHDRAW_DELAY);
    }

    /**
     * @notice Withdraws all ETH after the emergency timelock elapses.
     * @dev Intended only as a governance backstop for unrecoverable operational failures.
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 initiatedAt = emergencyWithdrawInitiatedAt;
        require(initiatedAt != 0, "VaultXRentalYield: emergency not initiated");
        require(
            block.timestamp >= initiatedAt + EMERGENCY_WITHDRAW_DELAY,
            "VaultXRentalYield: timelock active"
        );

        uint256 amount = address(this).balance;
        require(amount > 0, "VaultXRentalYield: no ETH");

        emergencyWithdrawInitiatedAt = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "VaultXRentalYield: ETH transfer failed");

        emit EmergencyWithdrawn(owner(), amount);
    }

    /**
     * @dev Rejects duplicate token IDs before claim-state mutation begins.
     * @param tokenIds Property token IDs submitted for a claim.
     */
    function _requireUniqueTokenIds(uint256[] calldata tokenIds) private pure {
        for (uint256 i = 0; i < tokenIds.length; i += 1) {
            for (uint256 j = i + 1; j < tokenIds.length; j += 1) {
                require(tokenIds[i] != tokenIds[j], "VaultXRentalYield: duplicate token");
            }
        }
    }
}

interface IERC721YieldToken {
    function ownerOf(uint256 tokenId) external view returns (address);
    function totalSupply() external view returns (uint256);
}
