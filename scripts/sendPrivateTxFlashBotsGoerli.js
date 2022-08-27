require("dotenv").config();
const ethers = require("ethers");
const { FlashbotsBundleProvider, FlashbotsBundleResolution } = require("@flashbots/ethers-provider-bundle");

const { ALCHEMY_GOERLI, PRIVATE_KEY } = process.env;

const formatted = (bigNr) => ethers.utils.formatUnits(bigNr, "gwei");

// CONNECT SIGNER TO ALCHEMY GOERLI PROVIDER  
(async () => {
    const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_GOERLI);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);
    const flashbotsProvider = await FlashbotsBundleProvider.create(provider, signer, "https://relay-goerli.flashbots.net", "goerli");

    // INCLUDE TRANSACTIONS IN MAXIMUM 1 BLOCK
    const BLOCKS_IN_THE_FUTURE = 1;
    const CHAIN_ID = await provider.getNetwork().chainId || 5;

    // GET EIP1155 CURRENT BLOCK FEE INFORMATION
    const feeData = await provider.getFeeData()
    const MAX_FEE = feeData.maxFeePerGas; // MAX_FEE that you are willing to pay in total
    const PRIORITY_FEE = feeData.maxPriorityFeePerGas; // tip for miner deducted from MAX_FEE
    const GAS_PRICE = feeData.gasPrice; // price in GWEI = 1 GWEI == 1 Billion (1.000.000.000 WEI)
    const nonce = await provider.getTransactionCount(signer.address)

    console.log('nonce', nonce)
    console.log('CHAIN_ID', CHAIN_ID)
    console.log('MAX_FEE', formatted(MAX_FEE))
    console.log('PRIORITY_FEE', formatted(PRIORITY_FEE))
    console.log('GAS_PRICE', formatted(GAS_PRICE))

    // (MAX_FEE + 12%) - (BASEFEE + PRIORITY_TIP)
    const percentage = 12;
    const percentageIncrease = MAX_FEE.add(MAX_FEE.mul(percentage).div(100))
    const percentageIncreaseReadable = formatted(MAX_FEE.add(MAX_FEE.mul(percentage).div(100)))
    console.log('percentage', percentage)
    console.log('percentageIncrease', percentageIncrease)
    console.log('percentageIncreaseReadable', percentageIncreaseReadable)

    const legacyTransaction = {
        to: signer.address,
        gasPrice: ethers.BigNumber.from(99).mul(1e9),
        gasLimit: 21000,
        // data: '0x',
        value: 10, // 10 wei
        nonce: nonce
    }

    provider.on('block', async (blockNumber) => {
        const block = await provider.getBlock(blockNumber)

        let eip1559Transaction;
        if (block.baseFeePerGas == null) {
            console.warn('This chain is not EIP-1559 enabled, defaulting to two legacy transactions for demo')
            eip1559Transaction = { ...legacyTransaction }
            // We set a nonce in legacyTransaction above to limit validity to a single landed bundle. Delete that nonce for tx#2, and allow bundle provider to calculate it
            delete eip1559Transaction.nonce
        } else {
            const maxBaseFeeInFutureBlock = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(block.baseFeePerGas, BLOCKS_IN_THE_FUTURE)
            eip1559Transaction = {
                to: signer.address,
                type: 2,
                maxFeePerGas: PRIORITY_FEE.add(maxBaseFeeInFutureBlock),
                maxPriorityFeePerGas: PRIORITY_FEE,
                gasLimit: 21000,
                // data: '0x',
                value: 10, // 10 wei
                chainId: CHAIN_ID
            }
        }

        const signedTransactions = await flashbotsProvider.signBundle([
            {
                signer: signer,
                transaction: legacyTransaction
            },
            {
                signer: signer,
                transaction: eip1559Transaction
            }
        ])

        const targetBlock = blockNumber + BLOCKS_IN_THE_FUTURE
        const simulation = await flashbotsProvider.simulate(signedTransactions, targetBlock)
        console.log('simulation', simulation)
        console.log("'error' in simulation", 'error' in simulation)
        // Using TypeScript discrimination
        if ('error' in simulation) {
            console.warn(`Simulation Error: ${simulation.error.message}`)
            process.exit(1)
        } else {
            console.log(`Simulation Success: ${JSON.stringify(simulation, null, 2)}`)
        }
        const bundleSubmission = await flashbotsProvider.sendRawBundle(signedTransactions, targetBlock)
        console.log('bundle submitted, waiting')
        if ('error' in bundleSubmission) {
            throw new Error(bundleSubmission.error.message)
        }
        const waitResponse = await bundleSubmission.wait()
        console.log(`Wait Response: ${FlashbotsBundleResolution[waitResponse]}`)
        if (waitResponse === FlashbotsBundleResolution.BundleIncluded || waitResponse === FlashbotsBundleResolution.AccountNonceTooHigh) {
            console.log('BundleIncluded')
            process.exit(0)
        } else {
            console.log('a rulat bad waitReponse');
            console.log('bundleStats', await flashbotsProvider.getBundleStats(simulation.bundleHash, targetBlock));
            console.log('userStats', await flashbotsProvider.getUserStats());
            process.exit(0)
        }
    })

})();

// export type TransactionRequest = {
//     to?: string,
//     from?: string,
//     nonce?: BigNumberish,

//     gasLimit?: BigNumberish,
//     gasPrice?: BigNumberish,

//     data?: BytesLike,
//     value?: BigNumberish,
//     chainId?: number

//     type?: number;
//     accessList?: AccessListish;

//     maxPriorityFeePerGas?: BigNumberish;
//     maxFeePerGas?: BigNumberish;

//     customData?: Record<string, any>;
//     ccipReadEnabled?: boolean;
// }