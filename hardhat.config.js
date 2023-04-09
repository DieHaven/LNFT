require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
const privateKey = process.env.METAMARK_PRIVATE_KEY_WALLET;
const projectid = process.env.ALCHEMY_API_ID;


module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${projectid}`,
      url: "https://rpc-mumbai.matic.today",
      accounts: [privateKey]
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [privateKey]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
};

