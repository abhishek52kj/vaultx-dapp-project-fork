const VaultXPropertyNFT = artifacts.require('VaultXPropertyNFT');
const VaultXRentalYield = artifacts.require('VaultXRentalYield');

const LOCAL_DEMO_YIELD = web3.utils.toWei('1', 'ether');
const LOCAL_MINTS_PER_WALLET = 12;

module.exports = async function (deployer, network, accounts) {
  const owner = accounts[0];
  const secondaryHolder = accounts[1] || owner;
  let nftAddress = process.env.VITE_NFT_ADDRESS;

  if (!nftAddress || !web3.utils.isAddress(nftAddress)) {
    await deployer.deploy(VaultXPropertyNFT, 'https://vaultx.local/metadata/');
    const propertyNft = await VaultXPropertyNFT.deployed();
    nftAddress = propertyNft.address;

    const currentSupply = await propertyNft.totalSupply();
    if (currentSupply.toString() === '0') {
      await propertyNft.batchMint(owner, LOCAL_MINTS_PER_WALLET, { from: owner });
      await propertyNft.batchMint(secondaryHolder, LOCAL_MINTS_PER_WALLET, { from: owner });
    }

    console.log('VaultXPropertyNFT deployed at:', propertyNft.address);
  }

  await deployer.deploy(VaultXRentalYield, nftAddress);
  const rentalYield = await VaultXRentalYield.deployed();

  await rentalYield.grantPropertyManager(owner, { from: owner });

  if (network === 'develop' || network === 'development') {
    const epochId = await rentalYield.currentEpochId();
    if (epochId.toString() === '0') {
      await rentalYield.depositYield({ from: owner, value: LOCAL_DEMO_YIELD });
    }
  }

  console.log('VaultXRentalYield deployed at:', rentalYield.address);
};
