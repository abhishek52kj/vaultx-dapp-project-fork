// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VaultXStaking
 * @notice Three-pool VTX staking contract used by the interactive staking dashboard.
 * @dev Rewards accrue linearly from each pool APY and are paid from owner-funded reserves.
 */
contract VaultXStaking is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant POOL_COUNT = 3;
    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    IERC20 public immutable stakingToken;

    struct Pool {
        uint256 totalStaked;
        uint256 rewardReserve;
        uint256 apy;
        uint256 lockPeriod;
        uint256 penaltyBps;
        bool active;
    }

    struct Position {
        uint256 stakedAmount;
        uint256 accruedRewards;
        uint256 lockExpiresAt;
        uint256 lastStakeTime;
        uint256 rewardCheckpoint;
    }

    Pool[POOL_COUNT] private _pools;
    mapping(uint256 => mapping(address => Position)) private _positions;

    event PoolConfigured(
        uint256 indexed poolId,
        uint256 apy,
        uint256 lockPeriod,
        uint256 penaltyBps,
        bool active
    );
    event RewardReserveFunded(uint256 indexed poolId, address indexed source, uint256 amount);
    event RewardReserveRecovered(uint256 indexed poolId, address indexed recipient, uint256 amount);
    event Staked(address indexed user, uint256 indexed poolId, uint256 amount);
    event Unstaked(address indexed user, uint256 indexed poolId, uint256 amount, uint256 penalty);
    event RewardsClaimed(address indexed user, uint256 indexed poolId, uint256 amount);

    /**
     * @notice Deploys the staking contract for a fixed VTX token.
     * @param token_ Address of the VTX ERC-20 token.
     */
    constructor(address token_) Ownable(msg.sender) {
        require(token_ != address(0), "VaultXStaking: zero token address");
        stakingToken = IERC20(token_);

        _configurePool(0, 1_250, 7 days, 250, true);
        _configurePool(1, 2_480, 30 days, 500, true);
        _configurePool(2, 4_820, 90 days, 1_000, true);
    }

    /**
     * @notice Configures APY, lock period, penalty, and status for one pool.
     * @param poolId Pool identifier, from 0 to 2.
     * @param apy Annual percentage yield in basis points.
     * @param lockPeriod Lock duration in seconds after staking.
     * @param penaltyBps Early unstake penalty in basis points.
     * @param active Whether staking into the pool is currently enabled.
     */
    function configurePool(
        uint256 poolId,
        uint256 apy,
        uint256 lockPeriod,
        uint256 penaltyBps,
        bool active
    ) external onlyOwner {
        _configurePool(poolId, apy, lockPeriod, penaltyBps, active);
    }

    /**
     * @notice Funds a pool's reward reserve from an approved source wallet.
     * @dev The source wallet must approve this contract for at least amount before this call.
     * @param poolId Pool whose reward reserve will be increased.
     * @param source Wallet that supplies VTX reward tokens.
     * @param amount Amount of VTX to add to the pool reward reserve.
     */
    function fundRewardReserveFrom(
        uint256 poolId,
        address source,
        uint256 amount
    ) external onlyOwner nonReentrant {
        _requirePool(poolId);
        require(source != address(0), "VaultXStaking: zero source");
        require(amount > 0, "VaultXStaking: zero amount");

        _pools[poolId].rewardReserve += amount;
        stakingToken.safeTransferFrom(source, address(this), amount);

        emit RewardReserveFunded(poolId, source, amount);
    }

    /**
     * @notice Recovers unused reward reserve tokens from a pool.
     * @dev Staked principal is never included in rewardReserve and cannot be recovered through this function.
     * @param poolId Pool whose unused reward reserve will be reduced.
     * @param recipient Address receiving the recovered reserve.
     * @param amount Amount of VTX to recover.
     */
    function recoverRewardReserve(
        uint256 poolId,
        address recipient,
        uint256 amount
    ) external onlyOwner nonReentrant {
        _requirePool(poolId);
        require(recipient != address(0), "VaultXStaking: zero recipient");
        require(amount > 0, "VaultXStaking: zero amount");
        require(_pools[poolId].rewardReserve >= amount, "VaultXStaking: reserve too low");

        _pools[poolId].rewardReserve -= amount;
        stakingToken.safeTransfer(recipient, amount);

        emit RewardReserveRecovered(poolId, recipient, amount);
    }

    /**
     * @notice Stakes VTX into one of the three staking pools.
     * @dev Existing rewards are accrued before principal changes, preserving reward accounting.
     * @param poolId Pool identifier, from 0 to 2.
     * @param amount Amount of VTX to stake.
     */
    function stake(uint256 poolId, uint256 amount) external nonReentrant {
        _requirePool(poolId);
        Pool storage pool = _pools[poolId];
        require(pool.active, "VaultXStaking: pool inactive");
        require(amount > 0, "VaultXStaking: zero amount");

        Position storage position = _positions[poolId][msg.sender];
        _accrue(pool, position);

        position.stakedAmount += amount;
        position.lastStakeTime = block.timestamp;
        position.lockExpiresAt = block.timestamp + pool.lockPeriod;
        position.rewardCheckpoint = block.timestamp;
        pool.totalStaked += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, poolId, amount);
    }

    /**
     * @notice Unstakes VTX from a selected pool.
     * @dev Early exits burn no tokens; the penalty remains in the contract as reward reserve for the pool.
     * @param poolId Pool identifier, from 0 to 2.
     * @param amount Amount of staked VTX to unstake.
     */
    function unstake(uint256 poolId, uint256 amount) external nonReentrant {
        _requirePool(poolId);
        require(amount > 0, "VaultXStaking: zero amount");

        Pool storage pool = _pools[poolId];
        Position storage position = _positions[poolId][msg.sender];
        require(position.stakedAmount >= amount, "VaultXStaking: insufficient stake");

        _accrue(pool, position);

        uint256 penalty = block.timestamp < position.lockExpiresAt
            ? (amount * pool.penaltyBps) / BPS_DENOMINATOR
            : 0;
        uint256 payout = amount - penalty;

        position.stakedAmount -= amount;
        pool.totalStaked -= amount;
        if (penalty > 0) {
            pool.rewardReserve += penalty;
        }
        if (position.stakedAmount == 0) {
            position.lockExpiresAt = 0;
            position.rewardCheckpoint = block.timestamp;
        }

        stakingToken.safeTransfer(msg.sender, payout);

        emit Unstaked(msg.sender, poolId, amount, penalty);
    }

    /**
     * @notice Claims all pending VTX rewards for the selected pool.
     * @dev Reverts if no rewards are available or the pool reserve cannot cover the claim.
     * @param poolId Pool identifier, from 0 to 2.
     */
    function claimRewards(uint256 poolId) external nonReentrant {
        _requirePool(poolId);

        Pool storage pool = _pools[poolId];
        Position storage position = _positions[poolId][msg.sender];
        _accrue(pool, position);

        uint256 amount = position.accruedRewards;
        require(amount > 0, "VaultXStaking: no rewards");
        require(pool.rewardReserve >= amount, "VaultXStaking: reserve too low");

        position.accruedRewards = 0;
        pool.rewardReserve -= amount;

        stakingToken.safeTransfer(msg.sender, amount);

        emit RewardsClaimed(msg.sender, poolId, amount);
    }

    /**
     * @notice Returns live configuration and accounting for a pool.
     * @param poolId Pool identifier, from 0 to 2.
     * @return totalStaked Total VTX currently staked in the pool.
     * @return rewardReserve VTX rewards still available for this pool.
     * @return apy Annual percentage yield in basis points.
     * @return lockPeriod Lock duration in seconds.
     * @return penaltyBps Early-exit penalty in basis points.
     * @return active Whether staking is currently enabled.
     */
    function getPoolInfo(uint256 poolId)
        external
        view
        returns (
            uint256 totalStaked,
            uint256 rewardReserve,
            uint256 apy,
            uint256 lockPeriod,
            uint256 penaltyBps,
            bool active
        )
    {
        _requirePool(poolId);
        Pool storage pool = _pools[poolId];
        return (
            pool.totalStaked,
            pool.rewardReserve,
            pool.apy,
            pool.lockPeriod,
            pool.penaltyBps,
            pool.active
        );
    }

    /**
     * @notice Returns a wallet staking position for a pool.
     * @param poolId Pool identifier, from 0 to 2.
     * @param wallet Wallet address to inspect.
     * @return stakedAmount VTX principal currently staked.
     * @return rewardDebt Stored accrued rewards awaiting claim.
     * @return lockExpiresAt Unix timestamp after which unstake is penalty-free.
     * @return lastStakeTime Unix timestamp of the wallet's latest stake in this pool.
     */
    function getStakerInfo(uint256 poolId, address wallet)
        external
        view
        returns (
            uint256 stakedAmount,
            uint256 rewardDebt,
            uint256 lockExpiresAt,
            uint256 lastStakeTime
        )
    {
        _requirePool(poolId);
        Position storage position = _positions[poolId][wallet];
        return (
            position.stakedAmount,
            position.accruedRewards,
            position.lockExpiresAt,
            position.lastStakeTime
        );
    }

    /**
     * @notice Returns the currently claimable rewards for a wallet and pool.
     * @param poolId Pool identifier, from 0 to 2.
     * @param wallet Wallet address to inspect.
     * @return amount Total accrued plus newly accumulated VTX rewards.
     */
    function pendingRewards(uint256 poolId, address wallet) public view returns (uint256 amount) {
        _requirePool(poolId);
        Pool storage pool = _pools[poolId];
        Position storage position = _positions[poolId][wallet];
        return position.accruedRewards + _earnedSinceCheckpoint(pool, position);
    }

    function _configurePool(
        uint256 poolId,
        uint256 apy,
        uint256 lockPeriod,
        uint256 penaltyBps,
        bool active
    ) private {
        _requirePool(poolId);
        require(penaltyBps <= BPS_DENOMINATOR, "VaultXStaking: invalid penalty");

        Pool storage pool = _pools[poolId];
        pool.apy = apy;
        pool.lockPeriod = lockPeriod;
        pool.penaltyBps = penaltyBps;
        pool.active = active;

        emit PoolConfigured(poolId, apy, lockPeriod, penaltyBps, active);
    }

    function _accrue(Pool storage pool, Position storage position) private {
        position.accruedRewards += _earnedSinceCheckpoint(pool, position);
        position.rewardCheckpoint = block.timestamp;
    }

    function _earnedSinceCheckpoint(
        Pool storage pool,
        Position storage position
    ) private view returns (uint256) {
        if (position.stakedAmount == 0 || position.rewardCheckpoint == 0) {
            return 0;
        }

        uint256 elapsed = block.timestamp - position.rewardCheckpoint;
        return (position.stakedAmount * pool.apy * elapsed) / (BPS_DENOMINATOR * SECONDS_PER_YEAR);
    }

    function _requirePool(uint256 poolId) private pure {
        require(poolId < POOL_COUNT, "VaultXStaking: invalid pool");
    }
}
