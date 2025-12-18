// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ┌────────────────────────────────────────────────────────────┐
 * │  VaultXPresale                vaultx.io  ©2025            │
 * ├────────────────────────────────────────────────────────────┤
 * │  ETH-denominated fixed-rate presale for VaultX (VTX).     │
 * │                                                            │
 * │  States                                                    │
 * │    PENDING  — before start time                            │
 * │    ACTIVE   — accepting deposits                           │
 * │    SUCCESS  — hard cap reached OR ended above soft cap     │
 * │    FAILED   — ended below soft cap / force-failed          │
 * │                                                            │
 * │  On SUCCESS  → buyers call claimTokens()                   │
 * │  On FAILED   → buyers call claimRefund()                   │
 * │  On SUCCESS  → owner calls withdrawFunds()                 │
 * └────────────────────────────────────────────────────────────┘
 */

// ─────────────────────────────────────────────────────────────
//  IERC20 (minimal surface)
// ─────────────────────────────────────────────────────────────

interface IERC20 {
    function name()        external view returns (string memory);
    function symbol()      external view returns (string memory);
    function decimals()    external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

// ─────────────────────────────────────────────────────────────
//  ReentrancyGuard
// ─────────────────────────────────────────────────────────────

abstract contract ReentrancyGuard {
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED     = 2;
    uint256 private _status;

    constructor() { _status = _NOT_ENTERED; }

    modifier nonReentrant() {
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }
}

// ─────────────────────────────────────────────────────────────
//  SafeTransfer library
// ─────────────────────────────────────────────────────────────

library SafeTransfer {
    error ERC20TransferFailed(address token, address to, uint256 amount);

    function safeTransfer(address token, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) {
            revert ERC20TransferFailed(token, to, amount);
        }
    }
}

// ─────────────────────────────────────────────────────────────
//  VaultXPresale
// ─────────────────────────────────────────────────────────────

contract VaultXPresale is ReentrancyGuard {
    using SafeTransfer for address;

    // ── Enums ────────────────────────────────────────────────

    enum State { PENDING, ACTIVE, SUCCESS, FAILED }

    // ── Data Structures ──────────────────────────────────────

    struct Config {
        address saleToken;        // VTX contract address
        uint256 ratePerEth;       // VTX per 1 ETH
        uint256 minContribution;  // minimum ETH per deposit
        uint256 maxContribution;  // maximum ETH per wallet
        uint256 softCap;          // minimum ETH to declare success
        uint256 hardCap;          // maximum ETH accepted
        uint256 startTime;        // unix timestamp
        uint256 endTime;          // unix timestamp
    }

    struct Metrics {
        uint256 totalRaisedEth;   // cumulative ETH deposited
        uint256 totalSoldVtx;     // cumulative VTX allocated
        uint256 totalClaimedVtx;  // VTX claimed by buyers
        uint256 totalRefundedEth; // ETH refunded on failure
        uint256 uniqueBuyers;     // distinct wallet count
    }

    struct Buyer {
        uint256 ethDeposited;     // refundable on failure
        uint256 vtxAllocated;     // claimable on success
    }

    struct TokenInfo {
        string  name;
        string  symbol;
        uint8   decimals;
        uint256 totalSupply;
    }

    // ── Storage ──────────────────────────────────────────────

    address public immutable owner;
    bool    public forceFailed;
    bool    public initialized;

    Config    public config;
    Metrics   public metrics;
    TokenInfo public tokenInfo;

    mapping(address => Buyer) public buyers;

    // ── Custom Errors ────────────────────────────────────────

    error NotOwner();
    error AlreadyInitialized();
    error NotInitialized();
    error InvalidConfiguration(string reason);
    error PresaleNotActive();
    error PresaleNotSucceeded();
    error PresaleNotFailed();
    error BelowMinContribution(uint256 sent, uint256 minimum);
    error NothingToWithdraw();
    error InsufficientPresaleBalance(uint256 required, uint256 available);

    // ── Events ───────────────────────────────────────────────

    event Initialized(address indexed token, uint256 start, uint256 end, uint256 hardCap);
    event Deposited(address indexed buyer, uint256 ethAmount, uint256 vtxAmount);
    event TokensClaimed(address indexed buyer, uint256 vtxAmount);
    event Refunded(address indexed buyer, uint256 ethAmount);
    event FundsWithdrawn(address indexed owner, uint256 ethAmount);
    event UnsoldTokensRecovered(address indexed owner, uint256 vtxAmount);
    event ForceFailed(address indexed by);

    // ── Modifiers ────────────────────────────────────────────

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyInitialized() {
        if (!initialized) revert NotInitialized();
        _;
    }

    // ── Constructor ──────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─────────────────────────────────────────────────────────
    //  Owner: Configuration
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Configure and activate the presale. One-time call by owner.
     * @param _saleToken        VTX ERC-20 contract address
     * @param _ratePerEth       VTX tokens per 1 ETH
     * @param _minContribution  Minimum ETH per deposit
     * @param _maxContribution  Maximum ETH per wallet
     * @param _softCap          Minimum raise for success (must be ≤ hardCap)
     * @param _hardCap          Maximum raise accepted
     * @param _startTime        Unix start timestamp
     * @param _endTime          Unix end timestamp (must be > startTime)
     */
    function initialize(
        address _saleToken,
        uint256 _ratePerEth,
        uint256 _minContribution,
        uint256 _maxContribution,
        uint256 _softCap,
        uint256 _hardCap,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        if (initialized)                      revert AlreadyInitialized();
        if (_saleToken == address(0))         revert InvalidConfiguration("zero token address");
        if (_ratePerEth == 0)                 revert InvalidConfiguration("zero rate");
        if (_minContribution == 0)            revert InvalidConfiguration("zero min contribution");
        if (_maxContribution < _minContribution) revert InvalidConfiguration("max < min contribution");
        if (_softCap > _hardCap)              revert InvalidConfiguration("soft cap exceeds hard cap");
        if (_startTime >= _endTime)           revert InvalidConfiguration("start >= end");
        if (_startTime < block.timestamp)     revert InvalidConfiguration("start in the past");

        config = Config({
            saleToken:       _saleToken,
            ratePerEth:      _ratePerEth,
            minContribution: _minContribution,
            maxContribution: _maxContribution,
            softCap:         _softCap,
            hardCap:         _hardCap,
            startTime:       _startTime,
            endTime:         _endTime
        });

        IERC20 token = IERC20(_saleToken);
        tokenInfo = TokenInfo({
            name:        token.name(),
            symbol:      token.symbol(),
            decimals:    token.decimals(),
            totalSupply: token.totalSupply()
        });

        initialized = true;
        emit Initialized(_saleToken, _startTime, _endTime, _hardCap);
    }

    /**
     * @notice Emergency: force the presale into FAILED state.
     *         Enables all depositors to reclaim their ETH.
     */
    function forceFailPresale() external onlyOwner {
        forceFailed = true;
        emit ForceFailed(msg.sender);
    }

    // ─────────────────────────────────────────────────────────
    //  State View
    // ─────────────────────────────────────────────────────────

    function currentState() public view returns (State) {
        if (!initialized)   return State.PENDING;
        if (forceFailed)    return State.FAILED;

        if (metrics.totalRaisedEth >= config.hardCap)
            return State.SUCCESS;

        if (block.timestamp > config.endTime)
            return metrics.totalRaisedEth >= config.softCap
                ? State.SUCCESS
                : State.FAILED;

        if (block.timestamp >= config.startTime)
            return State.ACTIVE;

        return State.PENDING;
    }

    // ─────────────────────────────────────────────────────────
    //  Public: Deposit
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Purchase VTX tokens by sending ETH.
     *         Any ETH that would exceed your wallet cap or the hard cap
     *         is automatically refunded.
     */
    function deposit() external payable nonReentrant onlyInitialized {
        if (currentState() != State.ACTIVE) revert PresaleNotActive();

        Buyer storage buyer = buyers[msg.sender];

        // Determine effective deposit amount
        uint256 ethIn      = msg.value;
        uint256 walletRoom = config.maxContribution - buyer.ethDeposited;
        uint256 capRoom    = config.hardCap - metrics.totalRaisedEth;
        uint256 accepted   = _min3(ethIn, walletRoom, capRoom);

        if (accepted < config.minContribution)
            revert BelowMinContribution(accepted, config.minContribution);

        uint256 vtxOut = accepted * config.ratePerEth;

        uint256 contractBalance = IERC20(config.saleToken).balanceOf(address(this));
        if (metrics.totalSoldVtx + vtxOut > contractBalance)
            revert InsufficientPresaleBalance(
                metrics.totalSoldVtx + vtxOut,
                contractBalance
            );

        // Record first-time buyer
        if (buyer.ethDeposited == 0) metrics.uniqueBuyers++;

        buyer.ethDeposited       += accepted;
        buyer.vtxAllocated       += vtxOut;
        metrics.totalRaisedEth   += accepted;
        metrics.totalSoldVtx     += vtxOut;

        // Refund excess ETH immediately
        uint256 refund = ethIn - accepted;
        if (refund > 0) {
            (bool ok,) = payable(msg.sender).call{value: refund}("");
            require(ok, "ETH refund failed");
        }

        emit Deposited(msg.sender, accepted, vtxOut);
    }

    // ─────────────────────────────────────────────────────────
    //  Public: Claim / Refund
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Claim your VTX allocation after a successful presale.
     */
    function claimTokens() external nonReentrant onlyInitialized {
        if (currentState() != State.SUCCESS) revert PresaleNotSucceeded();

        Buyer storage buyer = buyers[msg.sender];
        uint256 amount = buyer.vtxAllocated;
        if (amount == 0) revert NothingToWithdraw();

        buyer.vtxAllocated        = 0;
        metrics.totalClaimedVtx  += amount;

        config.saleToken.safeTransfer(msg.sender, amount);
        emit TokensClaimed(msg.sender, amount);
    }

    /**
     * @notice Reclaim your ETH deposit after a failed presale.
     */
    function claimRefund() external nonReentrant onlyInitialized {
        if (currentState() != State.FAILED) revert PresaleNotFailed();

        Buyer storage buyer = buyers[msg.sender];
        uint256 amount = buyer.ethDeposited;
        if (amount == 0) revert NothingToWithdraw();

        buyer.ethDeposited        = 0;
        buyer.vtxAllocated        = 0;
        metrics.totalRefundedEth += amount;

        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "ETH transfer failed");

        emit Refunded(msg.sender, amount);
    }

    // ─────────────────────────────────────────────────────────
    //  Owner: Withdrawals
    // ─────────────────────────────────────────────────────────

    /**
     * @notice Withdraw all raised ETH after a successful presale.
     */
    function withdrawFunds() external onlyOwner nonReentrant {
        if (currentState() != State.SUCCESS) revert PresaleNotSucceeded();

        uint256 balance = address(this).balance;
        if (balance == 0) revert NothingToWithdraw();

        (bool ok,) = payable(owner).call{value: balance}("");
        require(ok, "ETH withdrawal failed");

        emit FundsWithdrawn(owner, balance);
    }

    /**
     * @notice Recover unsold or residual VTX tokens after presale ends.
     *         Only tokens beyond pending buyer claims can be recovered.
     */
    function recoverUnsoldTokens() external onlyOwner nonReentrant {
        require(block.timestamp > config.endTime, "Presale not ended");

        uint256 contractBalance = IERC20(config.saleToken).balanceOf(address(this));
        uint256 pendingClaims   = metrics.totalSoldVtx - metrics.totalClaimedVtx;
        uint256 recoverable     = contractBalance > pendingClaims
            ? contractBalance - pendingClaims
            : 0;

        if (recoverable == 0) revert NothingToWithdraw();

        config.saleToken.safeTransfer(owner, recoverable);
        emit UnsoldTokensRecovered(owner, recoverable);
    }

    // ─────────────────────────────────────────────────────────
    //  Views
    // ─────────────────────────────────────────────────────────

    /// @return raisedEth  Total ETH raised so far
    /// @return hardCapEth Hard cap in ETH
    /// @return bps        Progress in basis points (0–10000)
    /// @return state      Current presale state
    function progress() external view returns (
        uint256 raisedEth,
        uint256 hardCapEth,
        uint256 bps,
        State   state
    ) {
        raisedEth  = metrics.totalRaisedEth;
        hardCapEth = config.hardCap;
        bps        = hardCapEth > 0 ? (raisedEth * 10_000) / hardCapEth : 0;
        state      = currentState();
    }

    /// @notice Retrieve a wallet's presale position.
    function buyerPosition(address wallet) external view returns (
        uint256 ethDeposited,
        uint256 vtxAllocated
    ) {
        return (buyers[wallet].ethDeposited, buyers[wallet].vtxAllocated);
    }

    /// @notice Convenience: current block timestamp.
    function blockTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

    // ─────────────────────────────────────────────────────────
    //  Internals
    // ─────────────────────────────────────────────────────────

    function _min3(uint256 a, uint256 b, uint256 c) internal pure returns (uint256) {
        return a < b ? (a < c ? a : c) : (b < c ? b : c);
    }

    // ─────────────────────────────────────────────────────────
    //  Fallback
    // ─────────────────────────────────────────────────────────

    receive() external payable {
        if (currentState() == State.ACTIVE) {
            this.deposit{value: msg.value}();
        } else {
            revert PresaleNotActive();
        }
    }
}
