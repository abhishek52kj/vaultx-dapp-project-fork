const { assert } = require('chai');

const VaultXToken = artifacts.require('VaultXToken');
const VaultXVesting = artifacts.require('VaultXVesting');

const DAY = 24 * 60 * 60;
const MONTH = 30 * DAY;

contract('VaultXVesting', (accounts) => {
  const [
    owner,
    beneficiary,
    advisor,
    presale,
    dex,
    cexReserve,
    staking,
    ecosystem,
    customerRewards,
    airdrop,
  ] = accounts;

  let token;
  let vesting;
  let tgeTimestamp;

  const toBN = (value) => web3.utils.toBN(value);
  const toWei = (value) => web3.utils.toWei(value, 'ether');

  const latestTimestamp = async () => {
    const block = await web3.eth.getBlock('latest');
    return Number(block.timestamp);
  };

  const providerSend = (method, params = []) =>
    new Promise((resolve, reject) => {
      web3.currentProvider.send(
        {
          jsonrpc: '2.0',
          method,
          params,
          id: Date.now(),
        },
        (error, result) => (error ? reject(error) : resolve(result))
      );
    });

  const increaseTo = async (targetTimestamp) => {
    const now = await latestTimestamp();
    assert.isAtLeast(targetTimestamp, now, 'target timestamp must be in the future');
    await providerSend('evm_increaseTime', [targetTimestamp - now]);
    await providerSend('evm_mine');
  };

  const expectRevert = async (promise, message) => {
    try {
      await promise;
      assert.fail('Expected transaction to revert');
    } catch (error) {
      assert.include(error.message, 'revert');
      if (message) {
        assert.include(error.message, message);
      }
    }
  };

  const deployTokenWithTeamAllocationAtVesting = async () => {
    vesting = await VaultXVesting.new({ from: owner });
    token = await VaultXToken.new(
      presale || owner,
      dex || owner,
      cexReserve || owner,
      staking || owner,
      vesting.address,
      ecosystem || owner,
      customerRewards || owner,
      airdrop || owner,
      { from: owner }
    );

    tgeTimestamp = (await latestTimestamp()) + DAY;
    await vesting.initialize(token.address, tgeTimestamp, { from: owner });
  };

  beforeEach(async () => {
    await deployTokenWithTeamAllocationAtVesting();
  });

  it('rejects pre-cliff claims with a descriptive revert', async () => {
    await vesting.addBeneficiary(beneficiary, toWei('1000'), 3 * MONTH, 12 * MONTH, {
      from: owner,
    });

    await increaseTo(tgeTimestamp + 3 * MONTH - 1);
    await expectRevert(
      vesting.claimVested({ from: beneficiary }),
      'VaultXVesting: no vested tokens'
    );
  });

  it('reports exactly 50% claimable halfway through linear vesting', async () => {
    const allocation = toBN(toWei('1000'));
    const cliff = 30 * DAY;
    const duration = 180 * DAY;

    await vesting.addBeneficiary(beneficiary, allocation, cliff, duration, { from: owner });
    await increaseTo(tgeTimestamp + cliff + duration / 2);

    const claimable = await vesting.claimableAmount(beneficiary);
    assert.equal(claimable.toString(), allocation.div(toBN(2)).toString());
  });

  it('reports 100% claimable at or after the full vesting duration', async () => {
    const allocation = toBN(toWei('2500'));
    const cliff = 7 * DAY;
    const duration = 90 * DAY;

    await vesting.addBeneficiary(beneficiary, allocation, cliff, duration, { from: owner });
    await increaseTo(tgeTimestamp + cliff + duration);

    const claimable = await vesting.claimableAmount(beneficiary);
    assert.equal(claimable.toString(), allocation.toString());
  });

  it('splits vested and unvested tokens correctly on mid-schedule revocation', async () => {
    const allocation = toBN(toWei('1000'));
    const duration = 1000;

    await vesting.addBeneficiary(beneficiary, allocation, 0, duration, { from: owner });
    await increaseTo(tgeTimestamp + duration / 2);

    const ownerBefore = toBN(await token.balanceOf(owner));
    const tx = await vesting.revokeBeneficiary(beneficiary, { from: owner });
    const revoked = tx.logs.find((log) => log.event === 'Revoked');

    const beneficiaryBalance = await token.balanceOf(beneficiary);
    const ownerAfter = toBN(await token.balanceOf(owner));
    const claimableAfterRevoke = await vesting.claimableAmount(beneficiary);
    const vestedPaid = toBN(revoked.args.vestedPaid);
    const unvestedReturned = toBN(revoked.args.unvestedReturned);

    assert.equal(beneficiaryBalance.toString(), vestedPaid.toString());
    assert.equal(ownerAfter.sub(ownerBefore).toString(), unvestedReturned.toString());
    assert.equal(vestedPaid.add(unvestedReturned).toString(), allocation.toString());
    assert.equal(claimableAfterRevoke.toString(), '0');
  });

  it('rejects duplicate beneficiary registration', async () => {
    await vesting.addBeneficiary(beneficiary, toWei('1000'), MONTH, 12 * MONTH, {
      from: owner,
    });

    await expectRevert(
      vesting.addBeneficiary(beneficiary, toWei('1'), MONTH, 12 * MONTH, { from: owner }),
      'VaultXVesting: duplicate beneficiary'
    );
  });

  it('rejects allocations that exceed the vesting contract token balance', async () => {
    const vestingBalance = toBN(await token.balanceOf(vesting.address));
    await expectRevert(
      vesting.addBeneficiary(advisor, vestingBalance.add(toBN(1)), 0, MONTH, { from: owner }),
      'VaultXVesting: allocation exceeds balance'
    );
  });

  it('claims only newly vested tokens and prevents double-claiming', async () => {
    const allocation = toBN(toWei('1200'));
    const duration = 1200;

    await vesting.addBeneficiary(beneficiary, allocation, 0, duration, { from: owner });
    await increaseTo(tgeTimestamp + duration / 2);

    const tx = await vesting.claimVested({ from: beneficiary });
    const claimed = tx.logs.find((log) => log.event === 'Claimed');
    assert.equal((await token.balanceOf(beneficiary)).toString(), claimed.args.amount.toString());

    await expectRevert(
      vesting.claimVested({ from: beneficiary }),
      'VaultXVesting: no vested tokens'
    );
  });
});
