const { assert } = require('chai');

const VaultXPropertyNFT = artifacts.require('VaultXPropertyNFT');
const VaultXRentalYield = artifacts.require('VaultXRentalYield');

const DAY = 24 * 60 * 60;

contract('VaultXRentalYield', (accounts) => {
  const [owner, manager, holder, secondHolder, outsider] = accounts;

  let propertyNft;
  let rentalYield;

  const toBN = (value) => web3.utils.toBN(value);
  const toWei = (value) => web3.utils.toWei(value, 'ether');

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

  const gasCost = (tx) =>
    toBN(tx.receipt.gasUsed).mul(toBN(tx.receipt.effectiveGasPrice || tx.receipt.gasPrice || 0));

  beforeEach(async () => {
    propertyNft = await VaultXPropertyNFT.new('https://vaultx.test/metadata/', { from: owner });
    await propertyNft.mint(holder, { from: owner });
    await propertyNft.mint(secondHolder, { from: owner });

    rentalYield = await VaultXRentalYield.new(propertyNft.address, { from: owner });
    await rentalYield.grantPropertyManager(manager, { from: owner });
  });

  it('enforces the property-manager role on deposits', async () => {
    await expectRevert(
      rentalYield.depositYield({ from: outsider, value: toWei('1') })
    );
  });

  it('creates a new epoch and records the ETH amount per deposit', async () => {
    const amount = toWei('2');
    const tx = await rentalYield.depositYield({ from: manager, value: amount });
    const epoch = await rentalYield.epochs(1);

    assert.equal(tx.logs[0].event, 'YieldDeposited');
    assert.equal((await rentalYield.currentEpochId()).toString(), '1');
    assert.equal(epoch.totalAmount.toString(), amount);
    assert.equal(epoch.supplySnapshot.toString(), '2');
    assert.equal(epoch.perTokenAmount.toString(), toWei('1'));
  });

  it('distributes exactly epochTotal / totalSupply ETH to one token holder', async () => {
    const amount = toBN(toWei('2'));
    await rentalYield.depositYield({ from: manager, value: amount });

    const before = toBN(await web3.eth.getBalance(holder));
    const receipt = await rentalYield.claimYield([1], { from: holder });
    const after = toBN(await web3.eth.getBalance(holder));
    const expected = amount.div(toBN(2));

    assert.equal(receipt.logs[0].event, 'YieldClaimed');
    assert.equal(after.add(gasCost(receipt)).sub(before).toString(), expected.toString());
    assert.equal((await rentalYield.hasClaimed(1, 1)), true);
  });

  it('reverts when the same token claims the same epoch twice', async () => {
    await rentalYield.depositYield({ from: manager, value: toWei('2') });
    await rentalYield.claimYield([1], { from: holder });

    await expectRevert(
      rentalYield.claimYield([1], { from: holder }),
      'VaultXRentalYield: no yield'
    );
  });

  it('sums unclaimed yield across epochs and claims all unclaimed epochs atomically', async () => {
    await rentalYield.depositYield({ from: manager, value: toWei('2') });
    await rentalYield.depositYield({ from: manager, value: toWei('4') });

    assert.equal((await rentalYield.unclaimedYield(1)).toString(), toWei('3'));

    const before = toBN(await web3.eth.getBalance(holder));
    const receipt = await rentalYield.claimYield([1], { from: holder });
    const after = toBN(await web3.eth.getBalance(holder));

    assert.equal(after.add(gasCost(receipt)).sub(before).toString(), toWei('3'));
    assert.equal((await rentalYield.unclaimedYield(1)).toString(), '0');
  });

  it('rejects claims from wallets that do not own the submitted token', async () => {
    await rentalYield.depositYield({ from: manager, value: toWei('2') });

    await expectRevert(
      rentalYield.claimYield([1], { from: outsider }),
      'VaultXRentalYield: not token owner'
    );
  });

  it('does not let tokens minted after an epoch claim that older epoch', async () => {
    await rentalYield.depositYield({ from: manager, value: toWei('2') });
    await propertyNft.mint(outsider, { from: owner });

    assert.equal((await rentalYield.unclaimedYield(3)).toString(), '0');
    await expectRevert(
      rentalYield.claimYield([3], { from: outsider }),
      'VaultXRentalYield: no yield'
    );

    await rentalYield.depositYield({ from: manager, value: toWei('3') });
    assert.equal((await rentalYield.unclaimedYield(3)).toString(), toWei('1'));
  });

  it('enforces the seven-day emergency withdrawal timelock', async () => {
    await rentalYield.depositYield({ from: manager, value: toWei('2') });
    await rentalYield.initiateEmergencyWithdraw({ from: owner });

    await expectRevert(
      rentalYield.emergencyWithdraw({ from: owner }),
      'VaultXRentalYield: timelock active'
    );

    const before = toBN(await web3.eth.getBalance(owner));
    await increaseTime(7 * DAY + 1);
    const receipt = await rentalYield.emergencyWithdraw({ from: owner });
    const after = toBN(await web3.eth.getBalance(owner));

    assert.equal(after.add(gasCost(receipt)).sub(before).toString(), toWei('2'));
    assert.equal((await web3.eth.getBalance(rentalYield.address)).toString(), '0');
  });

  it('revokes property managers before future deposits', async () => {
    await rentalYield.revokePropertyManager(manager, { from: owner });

    await expectRevert(
      rentalYield.depositYield({ from: manager, value: toWei('1') })
    );
  });
});
