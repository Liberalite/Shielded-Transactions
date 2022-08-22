const dotenv = require("dotenv")
const path = require("path")
dotenv.config({ path: path.relative(process.cwd(), path.join(__dirname, '.env')) });

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log('account.address', account.address);
  }
});

task("hello", "Prints 'Hello' multiple times")
  .addOptionalParam(
    "times",
    "The number of times to print 'Hello'",
    1,
    types.int
  )
  .setAction(async ({ times }) => {
    for (let i = 0; i < times; i++) {
      console.log("Hello");
    }
    async ({ times }) => console.log('times', times)
  });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    ethGoerli: {
      url: process.env.ALCHEMY_GOERLI,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    ethLocalFork: {
      url: "http://127.0.0.1:8545/",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat: {
      forking: {
        url: process.env.ALCHEMY_MAINNET,
        accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
        chainId: 31337
      }
    }
  },
  settings: {
    opmizer: {
      enabled: true,
      runs: 200
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.9"
      },
      {
        version: "0.8.6"
      }
    ]
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache",
    tests: "./test"
  }
};