const { assert } = require('chai');

const VaultXToken = artifacts.require('VaultXToken');
const VaultXStaking = artifacts.require('VaultXStaking');

contract('VaultXStaking', (accounts) => {
  const [
    owner,
    staker,
    secondStaker,
    presale,
    dex,
    cexReserve,
    stakingAllocationWallet,
    team,
    ecosystem,
    customerRewards,
    airdrop,
  ] = accounts;

  const toBN = (value) => web3.utils.toBN(value);
  const toWei = (value) => web3.utils.toWei(value, 'ether');

  let token;
  let staking;

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

  const increaseTime = async (seconds) => {
    await providerSend('evm_increaseTime', [seconds]);
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

  beforeEach(async () => {
    token = await VaultXToken.new(
      presale || owner,
      dex || owner,
      cexReserve || owner,
      stakingAllocationWallet || owner,
      team || owner,
      ecosystem || owner,
      customerRewards || owner,
      airdrop || owner,
      { from: owner }
    );
    staking = await VaultXStaking.new(token.address, { from: owner });

    await token.transfer(staker, toWei('1000'), { from: stakingAllocationWallet });
    await token.transfer(secondStaker, toWei('1000'), { from: stakingAllocationWallet });

    await token.approve(staking.address, toWei('100000'), { from: stakingAllocationWallet });
    await staking.fundRewardReserveFrom(0, stakingAllocationWallet, toWei('100000'), {
      from: owner,
    });
  });

  it('loads three default pools with live values', async () => {
    const firstPool = await staking.getPoolInfo(0);
    const thirdPool = await staking.getPoolInfo(2);

    assert.equal(firstPool.apy.toString(), '1250');
    assert.equal(firstPool.lockPeriod.toString(), String(7 * 24 * 60 * 60));
    assert.equal(firstPool.penaltyBps.toString(), '250');
    assert.equal(firstPool.active, true);
    assert.equal(thirdPool.apy.toString(), '4820');
  });

  it('stakes after approval and updates pool and staker info', async () => {
    const amount = toWei('100');
    await token.approve(staking.address, amount, { from: staker });

    const tx = await staking.stake(0, amount, { from: staker });
    const pool = await staking.getPoolInfo(0);
    const info = await staking.getStakerInfo(0, staker);

    assert.equal(tx.logs[0].event, 'Staked');
    assert.equal(pool.totalStaked.toString(), amount);
    assert.equal(info.stakedAmount.toString(), amount);
    assert.isAbove(Number(info.lockExpiresAt), await latestTimestamp());
  });

  it('accrues and claims pending rewards from the pool reserve', async () => {
    const amount = toBN(toWei('100'));
    await token.approve(staking.address, amount, { from: staker });
    await staking.stake(0, amount, { from: staker });
    await increaseTime(365 * 24 * 60 * 60);

    const pending = toBN(await staking.pendingRewards(0, staker));
    const expected = amount.mul(toBN(1250)).div(toBN(10000));
    assert.equal(pending.toString(), expected.toString());

    const before = toBN(await token.balanceOf(staker));
    await staking.claimRewards(0, { from: staker });
    const after = toBN(await token.balanceOf(staker));

    assert.equal(after.sub(before).toString(), expected.toString());
    assert.equal((await staking.pendingRewards(0, staker)).toString(), '0');
  });

  it('reverts reward claims when nothing is claimable', async () => {
    await expectRevert(
      staking.claimRewards(0, { from: staker }),
      'VaultXStaking: no rewards'
    );
  });

  it('applies an early-exit penalty before lock expiry', async () => {
    const amount = toBN(toWei('100'));
    await token.approve(staking.address, amount, { from: staker });
    await staking.stake(0, amount, { from: staker });

    const before = toBN(await token.balanceOf(staker));
    const tx = await staking.unstake(0, amount, { from: staker, gas: 500000 });
    const after = toBN(await token.balanceOf(staker));
    const expectedPenalty = amount.mul(toBN(250)).div(toBN(10000));

    assert.equal(tx.logs[0].event, 'Unstaked');
    assert.equal(tx.logs[0].args.penalty.toString(), expectedPenalty.toString());
    assert.equal(after.sub(before).toString(), amount.sub(expectedPenalty).toString());
  });

  it('unstakes without penalty after lock expiry', async () => {
    const amount = toBN(toWei('100'));
    await token.approve(staking.address, amount, { from: secondStaker });
    await staking.stake(0, amount, { from: secondStaker });
    await increaseTime(8 * 24 * 60 * 60);

    const before = toBN(await token.balanceOf(secondStaker));
    const tx = await staking.unstake(0, amount, { from: secondStaker });
    const after = toBN(await token.balanceOf(secondStaker));

    assert.equal(tx.logs[0].args.penalty.toString(), '0');
    assert.equal(after.sub(before).toString(), amount.toString());
  });

  it('prevents staking into inactive pools', async () => {
    await staking.configurePool(0, 1250, 7 * 24 * 60 * 60, 250, false, { from: owner });
    await token.approve(staking.address, toWei('1'), { from: staker });

    await expectRevert(
      staking.stake(0, toWei('1'), { from: staker }),
      'VaultXStaking: pool inactive'
    );
  });
});
