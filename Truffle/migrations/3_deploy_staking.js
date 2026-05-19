const VaultXToken = artifacts.require('VaultXToken');
const VaultXStaking = artifacts.require('VaultXStaking');

const REWARD_RESERVES = [
  web3.utils.toWei('10000000', 'ether'),
  web3.utils.toWei('15000000', 'ether'),
  web3.utils.toWei('25000000', 'ether'),
];
const LOCAL_WALLET_SEED = web3.utils.toWei('100000', 'ether');

module.exports = async function (deployer, network, accounts) {
  const stakingAllocationWallet = accounts[3] || accounts[0];
  const localSeedWallets = [accounts[0], accounts[1]].filter(Boolean);
  const token = await VaultXToken.deployed();

  await deployer.deploy(VaultXStaking, token.address);
  const staking = await VaultXStaking.deployed();

  for (const wallet of localSeedWallets) {
    const currentBalance = web3.utils.toBN(await token.balanceOf(wallet));
    const requiredBalance = web3.utils.toBN(LOCAL_WALLET_SEED);
    if (currentBalance.lt(requiredBalance)) {
      await token.transfer(wallet, requiredBalance.sub(currentBalance), {
        from: stakingAllocationWallet,
      });
    }
  }

  for (let poolId = 0; poolId < REWARD_RESERVES.length; poolId += 1) {
    await token.approve(staking.address, REWARD_RESERVES[poolId], {
      from: stakingAllocationWallet,
    });
    await staking.fundRewardReserveFrom(
      poolId,
      stakingAllocationWallet,
      REWARD_RESERVES[poolId],
      { from: accounts[0] }
    );
  }

  console.log('VaultXStaking deployed at:', staking.address);
};
