const VaultXToken   = artifacts.require('VaultXToken');
const VaultXPresale = artifacts.require('VaultXPresale');

module.exports = async function (deployer, network, accounts) {
  const [
    deployerAccount,
    dexWallet,
    cexReserveWallet,
    stakingWallet,
    ecosystemWallet,
    customerRewardsWallet,
    airdropWallet,
  ] = accounts;

  await deployer.deploy(VaultXPresale);
  const presale = await VaultXPresale.deployed();
  console.log('VaultXPresale deployed at:', presale.address);

  await deployer.deploy(
    VaultXToken,
    presale.address,
    dexWallet || deployerAccount,
    cexReserveWallet || deployerAccount,
    stakingWallet || deployerAccount,
    deployerAccount,
    ecosystemWallet || deployerAccount,
    customerRewardsWallet || deployerAccount,
    airdropWallet || deployerAccount
  );
  const token = await VaultXToken.deployed();
  console.log('VaultXToken deployed at:', token.address);

  const latestBlock = await web3.eth.getBlock('latest');
  const startTime = Number(latestBlock.timestamp) + 60;
  const endTime = startTime + 30 * 24 * 60 * 60;

  await presale.initialize(
    token.address,
    2_000_000,
    web3.utils.toWei('0.01', 'ether'),
    web3.utils.toWei('5', 'ether'),
    web3.utils.toWei('50', 'ether'),
    web3.utils.toWei('100', 'ether'),
    startTime,
    endTime
  );
};
