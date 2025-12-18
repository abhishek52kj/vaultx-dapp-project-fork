const VaultXToken   = artifacts.require('VaultXToken');
const VaultXPresale = artifacts.require('VaultXPresale');

const deploy = async (deployer) => {
  // 1. Deploy the VaultX ERC-20 token
  await deployer.deploy(VaultXToken);
  const token = await VaultXToken.deployed();
  console.log('✅ VaultXToken deployed at:', token.address);

  // 2. Deploy the presale, passing the token address
  //    Constructor: VaultXPresale(address _token, uint256 _rate, uint256 _softCap, uint256 _hardCap)
  //    Defaults match the tokenomics header: 2 000 000 VTX/ETH, 50 ETH soft, 100 ETH hard
  const RATE     = 2_000_000;
  const SOFT_CAP = web3.utils.toWei('50',  'ether');
  const HARD_CAP = web3.utils.toWei('100', 'ether');

  await deployer.deploy(VaultXPresale, token.address, RATE, SOFT_CAP, HARD_CAP);
  const presale = await VaultXPresale.deployed();
  console.log('✅ VaultXPresale deployed at:', presale.address);
};

export default deploy;
