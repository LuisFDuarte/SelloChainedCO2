require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const NETWORK = process.env.NET;
const projectUrl = process.env[`INFURA_URL_${NETWORK}`] || process.env.INFURA_URL;
const privateKey = process.env[`DEPLOYER_SIGNER_PRIVATE_KEY_${NETWORK}`] || process.env.DEPLOYER_SIGNER_PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.4",
  networks: {
    [NETWORK]: {
      url: projectUrl,
      accounts: [privateKey]
    }
  }
};
