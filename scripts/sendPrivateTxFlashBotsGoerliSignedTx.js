require("dotenv").config();
const ethers = require("ethers");
const { FlashbotsBundleProvider, FlashbotsBundleResolution } = require("@flashbots/ethers-provider-bundle");

const { ALCHEMY_GOERLI, PRIVATE_KEY } = process.env;

const formatted = (bigNr) => ethers.utils.formatUnits(bigNr, "gwei");

// CONNECT SIGNER TO ALCHEMY GOERLI PROVIDER  
provider.getBlockNumber().then(async (blockNumber) => {
  const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_GOERLI);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const flashbotsProvider = await FlashbotsBundleProvider.create(provider, signer, "https://relay-goerli.flashbots.net", "goerli");

  // Relay the signed message to FlashBots DarkPool from a Random Wallet
  const wallet = new ethers.Wallet.createRandom().connect(provider)

  const signedTransactions = await flashbotsProvider.signBundle([
    {
      signer: wallet,
      transaction: {
        to: wallet.address,
        gasPrice: 0
      }
    },
    {
      signedTransaction:
        '0xf85f8080825208947a76570ef1d933582c354cbc02c22415e243901880801ca0a0e5096067fa6a62874c9ea2bcc774f2dcf83fd73814db89258af9b4e66092d1a045410ddeda97315d5250d17461930edd6ad46be5351d70c9d02929a1cbd07645'
    }
  ])
  console.log({ signedTransactions })
  const simulation = await flashbotsProvider.simulate(signedTransactions, blockNumber + 1)

  // Using TypeScript discrimination
  if ('error' in simulation) {
    console.log(`Simulation Error: ${simulation.error.message}`)
  } else {
    console.log(`Simulation Success: ${JSON.stringify(simulation, null, 2)}`)
  }
  const bundleSubmission = await flashbotsProvider.sendRawBundle(signedTransactions, blockNumber + 1)
  console.log('bundle submitted, waiting')
  const waitResponse = await bundleSubmission.wait()
  const bundleSubmissionSimulation = await bundleSubmission.simulate()
  console.log({ bundleSubmissionSimulation, waitResponse: FlashbotsBundleResolution[waitResponse] })
})