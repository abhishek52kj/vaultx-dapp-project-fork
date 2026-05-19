/**
 * contractInfo.js
 * Copies compiled ABI+address artefacts into the frontend so the UI can
 * interact with deployed contracts.
 *
 * Run automatically as part of `npm run deploy`.
 */
var fs   = require('fs');
var path = require('path');

var CONTRACTS = [
  ['VaultXPresale.json', 'contractInfo.json'],
  ['VaultXStaking.json', 'VaultXStaking.json'],
  ['VaultXVesting.json', 'VaultXVesting.json'],
];

CONTRACTS.forEach(([sourceFile, destFile]) => {
  var src = path.resolve(__dirname, '../build/contracts', sourceFile);
  var dest = path.resolve(__dirname, '../../src/contracts', destFile);

  fs.copyFileSync(src, dest);
  console.log(`✅ ${sourceFile} copied to src/contracts/${destFile}`);
});
