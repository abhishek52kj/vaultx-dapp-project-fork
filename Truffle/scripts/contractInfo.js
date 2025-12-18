/**
 * contractInfo.js
 * Copies the compiled VaultXPresale ABI+address artefact into the frontend
 * so the UI can interact with the deployed contract.
 *
 * Run automatically as part of `npm run deploy`.
 */
var fs   = require('fs');
var path = require('path');

var SRC  = path.resolve(__dirname, '../build/contracts/VaultXPresale.json');
var DEST = path.resolve(__dirname, '../../src/contracts/contractInfo.json');

fs.copyFile(SRC, DEST, (err) => {
  if (err) {
    console.error('❌ Could not copy VaultXPresale artefact:', err.message);
    console.error('   Make sure you ran `truffle migrate` first.');
    process.exit(1);
  }
  console.log('✅ VaultXPresale ABI copied to src/contracts/contractInfo.json');
});
