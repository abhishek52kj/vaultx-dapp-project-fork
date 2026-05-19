const VaultXToken = artifacts.require('VaultXToken');
const VaultXVesting = artifacts.require('VaultXVesting');

const TEAM_ALLOCATION = web3.utils.toWei('100000000', 'ether');
const LOCAL_WALLET_SEED = web3.utils.toWei('100000', 'ether');
const TGE_DELAY_SECONDS = 30 * 24 * 60 * 60;

module.exports = async function (deployer, network, accounts) {
  const owner = accounts[0];
  const stakingAllocationWallet = accounts[3] || owner;
  const token = await VaultXToken.deployed();

  await deployer.deploy(VaultXVesting);
  const vesting = await VaultXVesting.deployed();

  const latestBlock = await web3.eth.getBlock('latest');
  const tgeTimestamp = Number(latestBlock.timestamp) + TGE_DELAY_SECONDS;

  await vesting.initialize(token.address, tgeTimestamp);

  const currentVestingBalance = web3.utils.toBN(await token.balanceOf(vesting.address));
  const requiredBalance = web3.utils.toBN(TEAM_ALLOCATION);

  if (currentVestingBalance.lt(requiredBalance)) {
    const topUp = requiredBalance.sub(currentVestingBalance);
    await token.transfer(vesting.address, topUp, { from: owner });
  }

  const ownerBalance = web3.utils.toBN(await token.balanceOf(owner));
  const requiredLocalBalance = web3.utils.toBN(LOCAL_WALLET_SEED);
  if (ownerBalance.lt(requiredLocalBalance)) {
    await token.transfer(owner, requiredLocalBalance.sub(ownerBalance), {
      from: stakingAllocationWallet,
    });
  }

  console.log('VaultXVesting deployed at:', vesting.address);
};
