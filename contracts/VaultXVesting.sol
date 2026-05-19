// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VaultXVesting
 * @dev Non-custodial VTX vesting for team, advisors, and early contributors.
 */
contract VaultXVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct BeneficiarySchedule {
        uint256 totalAllocation;
        uint256 cliffDuration;
        uint256 vestingDuration;
        uint256 claimed;
        uint256 revokedAt;
        bool registered;
        bool revoked;
    }

    IERC20 public token;
    uint256 public tgeTimestamp;
    uint256 public totalRegisteredAllocations;
    bool public initialized;

    mapping(address => BeneficiarySchedule) public beneficiaries;

    event Initialized(address indexed token, uint256 tgeTimestamp);
    event BeneficiaryAdded(
        address indexed beneficiary,
        uint256 total,
        uint256 cliff,
        uint256 vesting
    );
    event Claimed(address indexed beneficiary, uint256 amount);
    event Revoked(address indexed beneficiary, uint256 vestedPaid, uint256 unvestedReturned);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Configures the VTX token and Token Generation Event timestamp.
     * @dev This function is callable once by the owner and requires a future TGE.
     * @param token_ Address of the VTX ERC-20 token.
     * @param tgeTimestamp_ Unix timestamp at which vesting schedules begin.
     */
    function initialize(address token_, uint256 tgeTimestamp_) external onlyOwner {
        require(!initialized, "VaultXVesting: already initialized");
        require(token_ != address(0), "VaultXVesting: zero token address");
        require(tgeTimestamp_ > block.timestamp, "VaultXVesting: TGE must be future");

        token = IERC20(token_);
        tgeTimestamp = tgeTimestamp_;
        initialized = true;

        emit Initialized(token_, tgeTimestamp_);
    }

    /**
     * @notice Registers an immutable vesting schedule for a beneficiary.
     * @dev Callable only before TGE; registered allocation totals cannot exceed the contract VTX balance.
     * @param beneficiary Address that can claim vested VTX.
     * @param total Total VTX allocation assigned to the beneficiary.
     * @param cliff Duration in seconds after TGE before vesting begins.
     * @param vesting Duration in seconds over which tokens vest linearly after the cliff.
     */
    function addBeneficiary(
        address beneficiary,
        uint256 total,
        uint256 cliff,
        uint256 vesting
    ) external onlyOwner {
        require(initialized, "VaultXVesting: not initialized");
        require(block.timestamp < tgeTimestamp, "VaultXVesting: TGE already started");
        require(beneficiary != address(0), "VaultXVesting: zero beneficiary");
        require(total > 0, "VaultXVesting: zero allocation");
        require(vesting > 0, "VaultXVesting: zero vesting duration");
        require(!beneficiaries[beneficiary].registered, "VaultXVesting: duplicate beneficiary");

        uint256 newTotalRegistered = totalRegisteredAllocations + total;
        uint256 availableBalance = token.balanceOf(address(this));
        require(
            newTotalRegistered <= availableBalance,
            "VaultXVesting: allocation exceeds balance"
        );

        beneficiaries[beneficiary] = BeneficiarySchedule({
            totalAllocation: total,
            cliffDuration: cliff,
            vestingDuration: vesting,
            claimed: 0,
            revokedAt: 0,
            registered: true,
            revoked: false
        });
        totalRegisteredAllocations = newTotalRegistered;

        emit BeneficiaryAdded(beneficiary, total, cliff, vesting);
    }

    /**
     * @notice Claims the caller's newly vested VTX.
     * @dev Uses checks-effects-interactions and SafeERC20 transfer semantics.
     */
    function claimVested() external nonReentrant {
        BeneficiarySchedule storage schedule = beneficiaries[msg.sender];
        require(schedule.registered, "VaultXVesting: beneficiary not registered");
        require(!schedule.revoked, "VaultXVesting: beneficiary revoked");

        uint256 amount = _claimableAmount(schedule, msg.sender);
        require(amount > 0, "VaultXVesting: no vested tokens");

        schedule.claimed += amount;
        token.safeTransfer(msg.sender, amount);

        emit Claimed(msg.sender, amount);
    }

    /**
     * @notice Revokes a beneficiary and settles the vested/unvested token split.
     * @dev Vested but unclaimed VTX is paid first; unvested VTX is returned to the owner.
     * @param beneficiary Address of the registered beneficiary to revoke.
     */
    function revokeBeneficiary(address beneficiary) external onlyOwner nonReentrant {
        BeneficiarySchedule storage schedule = beneficiaries[beneficiary];
        require(schedule.registered, "VaultXVesting: beneficiary not registered");
        require(!schedule.revoked, "VaultXVesting: beneficiary revoked");

        uint256 vested = _vestedAmount(schedule, block.timestamp);
        uint256 vestedUnclaimed = vested - schedule.claimed;
        uint256 unvested = schedule.totalAllocation - vested;

        schedule.claimed = vested;
        schedule.revoked = true;
        schedule.revokedAt = block.timestamp;
        totalRegisteredAllocations -= unvested;

        if (vestedUnclaimed > 0) {
            token.safeTransfer(beneficiary, vestedUnclaimed);
        }
        if (unvested > 0) {
            token.safeTransfer(owner(), unvested);
        }

        emit Revoked(beneficiary, vestedUnclaimed, unvested);
    }

    /**
     * @notice Returns the cumulative VTX vested to date for a beneficiary.
     * @dev Revoked schedules stop accruing at their revocation timestamp.
     * @param beneficiary Address whose vested amount will be calculated.
     * @return amount Cumulative vested VTX before subtracting prior claims.
     */
    function vestedAmount(address beneficiary) public view returns (uint256 amount) {
        BeneficiarySchedule storage schedule = beneficiaries[beneficiary];
        if (!schedule.registered) {
            return 0;
        }

        uint256 timestamp = schedule.revoked ? schedule.revokedAt : block.timestamp;
        return _vestedAmount(schedule, timestamp);
    }

    /**
     * @notice Returns the VTX currently claimable by a beneficiary.
     * @dev Claimable VTX is vested-to-date minus the amount already claimed.
     * @param beneficiary Address whose claimable amount will be calculated.
     * @return amount Net VTX available to claim now.
     */
    function claimableAmount(address beneficiary) public view returns (uint256 amount) {
        BeneficiarySchedule storage schedule = beneficiaries[beneficiary];
        if (!schedule.registered || schedule.revoked) {
            return 0;
        }

        return _claimableAmount(schedule, beneficiary);
    }

    function _claimableAmount(
        BeneficiarySchedule storage schedule,
        address beneficiary
    ) private view returns (uint256) {
        return vestedAmount(beneficiary) - schedule.claimed;
    }

    function _vestedAmount(
        BeneficiarySchedule storage schedule,
        uint256 timestamp
    ) private view returns (uint256) {
        uint256 vestingStart = tgeTimestamp + schedule.cliffDuration;
        if (timestamp < vestingStart) {
            return 0;
        }

        uint256 elapsed = timestamp - vestingStart;
        if (elapsed >= schedule.vestingDuration) {
            return schedule.totalAllocation;
        }

        return (schedule.totalAllocation * elapsed) / schedule.vestingDuration;
    }
}
