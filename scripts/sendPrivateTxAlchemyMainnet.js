// Github: https://github.com/alchemyplatform/alchemy-sdk-js
const { Alchemy, Network, Wallet } = require("alchemy-sdk")
require("dotenv").config();

const { ALCHEMY_MAINNET, PRIVATE_KEY } = process.env;

const settings = {
  apiKey: ALCHEMY_MAINNET,
  network: Network.ETH_MAINNET, // Replace with your network.
};

const alchemy = new Alchemy(settings);
const wallet = new Wallet(PRIVATE_KEY);
const nonce = await alchemy.core.getTransactionCount(wallet.address, "latest");

(async () => {

  const exampleTx = {
    to: "0xE91386C3655acaAAf28Ab609bD7528373660A288",
    value: 10, // 10 wei
    gasLimit: "21000", // Notice 21000 is because we are sending ETH which is the Native Coin which is the cheapest tx on EVM Chains
    maxFeePerGas: "20000000000", // 20 gwei = 20 billion decimals
    nonce: nonce,
    type: 2, // EIP1155 - better more gas efficient transaction
    chainId: 5,
  };

  const rawTransaction = await wallet.signTransaction(exampleTx);

  const signedTx = await alchemy.transact.sendPrivateTransaction(
    rawTransaction,
    (await alchemy.core.getBlockNumber()) + 10 // if transactions is not added in the following 10 blocks stop execution
  );

  console.log('signedTx', signedTx);

})();