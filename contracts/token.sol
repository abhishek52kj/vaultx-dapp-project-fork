// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ┌────────────────────────────────────────────────────────────┐
 * │  VaultX Token  (VTX)          vaultx.io  ©2025            │
 * ├────────────────────────────────────────────────────────────┤
 * │                                                            │
 * │  Total Supply  : 1,000,000,000 VTX  (fixed, non-inflating)│
 * │  Decimals      : 18                                        │
 * │                                                            │
 * │  Allocation Breakdown                                      │
 * │  ─────────────────────────────────────────────────────     │
 * │  Staking Pool        25%   250,000,000 VTX                 │
 * │  Ecosystem Rewards   20%   200,000,000 VTX                 │
 * │  CEX Reserve         15%   150,000,000 VTX                 │
 * │  Team & Advisors     10%   100,000,000 VTX                 │
 * │  Presale             10%   100,000,000 VTX                 │
 * │  DEX Liquidity       10%   100,000,000 VTX                 │
 * │  Customer Rewards     5%    50,000,000 VTX                 │
 * │  Airdrop              5%    50,000,000 VTX                 │
 * └────────────────────────────────────────────────────────────┘
 */

// ─────────────────────────────────────────────────────────────
//  Interfaces
// ─────────────────────────────────────────────────────────────

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply()                                      external view returns (uint256);
    function balanceOf(address account)                         external view returns (uint256);
    function transfer(address to, uint256 amount)               external returns (bool);
    function allowance(address owner, address spender)          external view returns (uint256);
    function approve(address spender, uint256 amount)           external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IERC20Metadata is IERC20 {
    function name()     external view returns (string memory);
    function symbol()   external view returns (string memory);
    function decimals() external view returns (uint8);
}

// ─────────────────────────────────────────────────────────────
//  Context
// ─────────────────────────────────────────────────────────────

abstract contract Context {
    function _msgSender() internal view virtual returns (address)      { return msg.sender; }
    function _msgData()   internal view virtual returns (bytes calldata){ return msg.data; }
}

// ─────────────────────────────────────────────────────────────
//  Ownable  (OpenZeppelin v5 pattern)
// ─────────────────────────────────────────────────────────────

abstract contract Ownable is Context {
    address private _owner;

    error OwnableUnauthorizedAccount(address account);
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        if (initialOwner == address(0)) revert OwnableInvalidOwner(address(0));
        _transferOwnership(initialOwner);
    }

    modifier onlyOwner() {
        if (owner() != _msgSender()) revert OwnableUnauthorizedAccount(_msgSender());
        _;
    }

    function owner() public view virtual returns (address) { return _owner; }

    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) revert OwnableInvalidOwner(address(0));
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address old = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(old, newOwner);
    }
}

// ─────────────────────────────────────────────────────────────
//  ERC20 Base Implementation
// ─────────────────────────────────────────────────────────────

contract ERC20 is Context, IERC20, IERC20Metadata {
    mapping(address => uint256)                     private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;
    string  private _name;
    string  private _symbol;

    constructor(string memory name_, string memory symbol_) {
        _name   = name_;
        _symbol = symbol_;
    }

    function name()        public view virtual override returns (string memory) { return _name; }
    function symbol()      public view virtual override returns (string memory) { return _symbol; }
    function decimals()    public view virtual override returns (uint8)          { return 18; }
    function totalSupply() public view virtual override returns (uint256)        { return _totalSupply; }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public virtual override returns (bool) {
        _transfer(_msgSender(), to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public virtual override returns (bool) {
        _spendAllowance(from, _msgSender(), amount);
        _transfer(from, to, amount);
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, allowance(_msgSender(), spender) + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        uint256 current = allowance(_msgSender(), spender);
        require(current >= subtractedValue, "ERC20: decreased allowance below zero");
        unchecked { _approve(_msgSender(), spender, current - subtractedValue); }
        return true;
    }

    // ── Internal ────────────────────────────────────────────

    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "ERC20: transfer from zero address");
        require(to   != address(0), "ERC20: transfer to zero address");
        _beforeTokenTransfer(from, to, amount);

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: insufficient balance");
        unchecked { _balances[from] = fromBalance - amount; }
        _balances[to] += amount;

        emit Transfer(from, to, amount);
        _afterTokenTransfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: mint to zero address");
        _beforeTokenTransfer(address(0), account, amount);
        _totalSupply       += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
        _afterTokenTransfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal virtual {
        require(account != address(0), "ERC20: burn from zero address");
        _beforeTokenTransfer(account, address(0), amount);
        uint256 bal = _balances[account];
        require(bal >= amount, "ERC20: burn exceeds balance");
        unchecked { _balances[account] = bal - amount; }
        _totalSupply -= amount;
        emit Transfer(account, address(0), amount);
        _afterTokenTransfer(account, address(0), amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal virtual {
        require(owner   != address(0), "ERC20: approve from zero address");
        require(spender != address(0), "ERC20: approve to zero address");
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal virtual {
        uint256 current = allowance(owner, spender);
        if (current != type(uint256).max) {
            require(current >= amount, "ERC20: insufficient allowance");
            unchecked { _approve(owner, spender, current - amount); }
        }
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual {}
    function _afterTokenTransfer(address from, address to, uint256 amount)  internal virtual {}
}

// ─────────────────────────────────────────────────────────────
//  ERC20Burnable
// ─────────────────────────────────────────────────────────────

abstract contract ERC20Burnable is Context, ERC20 {
    /// @notice Destroy `amount` of your own tokens, reducing total supply.
    function burn(uint256 amount) public virtual {
        _burn(_msgSender(), amount);
    }

    /// @notice Destroy `amount` from `account` (requires prior approval).
    function burnFrom(address account, uint256 amount) public virtual {
        _spendAllowance(account, _msgSender(), amount);
        _burn(account, amount);
    }
}

// ─────────────────────────────────────────────────────────────
//  VaultXToken  —  Main Contract
// ─────────────────────────────────────────────────────────────

contract VaultXToken is ERC20Burnable, Ownable {

    // ── Supply Constants ────────────────────────────────────

    uint256 public constant TOTAL_SUPPLY           = 1_000_000_000e18;

    uint256 public constant STAKING_ALLOC          =   250_000_000e18; // 25%
    uint256 public constant ECOSYSTEM_ALLOC        =   200_000_000e18; // 20%
    uint256 public constant CEX_RESERVE_ALLOC      =   150_000_000e18; // 15%
    uint256 public constant TEAM_ALLOC             =   100_000_000e18; // 10%
    uint256 public constant PRESALE_ALLOC          =   100_000_000e18; // 10%
    uint256 public constant DEX_ALLOC              =   100_000_000e18; // 10%
    uint256 public constant CUSTOMER_REWARDS_ALLOC =    50_000_000e18; //  5%
    uint256 public constant AIRDROP_ALLOC          =    50_000_000e18; //  5%

    // ── State ────────────────────────────────────────────────

    /// @notice True after constructor — no further minting possible.
    bool public mintingLocked;

    // ── Errors ───────────────────────────────────────────────

    error MintingPermanentlyLocked();
    error AllocationSumMismatch(uint256 got, uint256 expected);

    // ── Events ───────────────────────────────────────────────

    event MintingLocked(uint256 totalSupply);

    // ── Constructor ──────────────────────────────────────────

    /**
     * @notice Deploy VaultX token and distribute the entire supply immediately.
     *
     * @param presaleAddr        Receives PRESALE_ALLOC
     * @param dexAddr            Receives DEX_ALLOC
     * @param cexReserveAddr     Receives CEX_RESERVE_ALLOC
     * @param stakingAddr        Receives STAKING_ALLOC
     * @param teamAddr           Receives TEAM_ALLOC
     * @param ecosystemAddr      Receives ECOSYSTEM_ALLOC
     * @param customerRewardsAddr Receives CUSTOMER_REWARDS_ALLOC
     * @param airdropAddr        Receives AIRDROP_ALLOC
     */
    constructor(
        address presaleAddr,
        address dexAddr,
        address cexReserveAddr,
        address stakingAddr,
        address teamAddr,
        address ecosystemAddr,
        address customerRewardsAddr,
        address airdropAddr
    )
        ERC20("VaultX", "VTX")
        Ownable(msg.sender)
    {
        // Verify allocations sum exactly to total supply
        uint256 sum =
            PRESALE_ALLOC        +
            DEX_ALLOC            +
            CEX_RESERVE_ALLOC    +
            STAKING_ALLOC        +
            TEAM_ALLOC           +
            ECOSYSTEM_ALLOC      +
            CUSTOMER_REWARDS_ALLOC +
            AIRDROP_ALLOC;

        if (sum != TOTAL_SUPPLY) revert AllocationSumMismatch(sum, TOTAL_SUPPLY);

        // Mint full supply to deployer, then route to allocation wallets
        _mint(msg.sender, TOTAL_SUPPLY);

        _transfer(msg.sender, presaleAddr,           PRESALE_ALLOC);
        _transfer(msg.sender, dexAddr,               DEX_ALLOC);
        _transfer(msg.sender, cexReserveAddr,        CEX_RESERVE_ALLOC);
        _transfer(msg.sender, stakingAddr,           STAKING_ALLOC);
        _transfer(msg.sender, teamAddr,              TEAM_ALLOC);
        _transfer(msg.sender, ecosystemAddr,         ECOSYSTEM_ALLOC);
        _transfer(msg.sender, customerRewardsAddr,   CUSTOMER_REWARDS_ALLOC);
        _transfer(msg.sender, airdropAddr,           AIRDROP_ALLOC);

        // Lock minting permanently
        mintingLocked = true;
        emit MintingLocked(TOTAL_SUPPLY);
    }

    // ── Overrides ────────────────────────────────────────────

    /// @dev Revert any future mint attempts — supply is permanently fixed.
    function _mint(address account, uint256 amount) internal override {
        if (mintingLocked) revert MintingPermanentlyLocked();
        super._mint(account, amount);
    }
}
