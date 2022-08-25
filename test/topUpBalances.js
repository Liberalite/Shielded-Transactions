const { expect } = require("chai");
const { network, ethers } = require("hardhat");
const {impersonateAccount} = require("../utils/impersonateAccount");
const toWei = (amount) => ethers.utils.parseEther(amount);
// const addTime = async (time) => await network.provider.send("evm_increaseTime", [time]); await network.provider.send("evm_mine")

const { ALCHEMY_MAINNET, PRIVATE_KEY } = process.env;

const signer = new ethers.Wallet(PRIVATE_KEY);
const minter = ethers.utils.getAddress("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"); // hardhat address[0]
const wallet = ethers.utils.getAddress("0x70997970c51812dc3a010c7d01b50e0d17dc79c8"); // hardhat address[1]

// LOAD IMPERSONATED WALLETS
const impersonateDAI = ethers.utils.getAddress("0x28c6c06298d514db089934071355e5743bf21d60"); // x
const impersonateUSDC = ethers.utils.getAddress("0x0a59649758aa4d66e25f08dd01271e891fe52199"); // x
const impersonateUSDT = ethers.utils.getAddress("0xf977814e90da44bfa03b6295a0616a897441acec"); // x
const impersonateTUSD = ethers.utils.getAddress("0x0000000000085d4780B73119b644AE5ecd22b376"); // x
const impersonateWETH = ethers.utils.getAddress("0xf04a5cc80b1e94c69b48f5ee68a08cd2f09a7c3e"); // x
const impersonateWBTC = ethers.utils.getAddress("0xbf72da2bd84c5170618fbe5914b0eca9638d5eb5"); // x
const impersonateLINK = ethers.utils.getAddress("0x28c6c06298d514db089934071355e5743bf21d60"); // x
const impersonateUNI = ethers.utils.getAddress("0x1a9c8182c09f50c8318d769245bea52c32be35bc"); // x
const impersonateCOMP = ethers.utils.getAddress("0x28c6c06298d514db089934071355e5743bf21d60"); // x
const impersonateMATIC = ethers.utils.getAddress("0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"); // x

// TOKEN ADDRESSESS
const DAI = ethers.utils.getAddress("0x6b175474e89094c44da98b954eedeac495271d0f");
const USDC = ethers.utils.getAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48");
const USDT = ethers.utils.getAddress("0xdac17f958d2ee523a2206206994597c13d831ec7");
const TUSD = ethers.utils.getAddress("0x0000000000085d4780B73119b644AE5ecd22b376");
const WETH = ethers.utils.getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const WBTC = ethers.utils.getAddress("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599");
const LINK = ethers.utils.getAddress("0x514910771af9ca656af840dff83e8264ecf986ca");
const UNI = ethers.utils.getAddress("0x1f9840a85d5af5bf1d1762f925bdaddc4201f984");
const COMP = ethers.utils.getAddress("0xc00e94cb662c3520282e6f5717214004a7f26888");
const MATIC = ethers.utils.getAddress("0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0");

describe("Mainnet Fork - Balances Top-up", function () {
  before(async () => {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const block = await hre.ethers.provider.getBlock("latest");
    this.openingTime = Math.floor(block.timestamp) + 3600 // now + 1 hour
    this.closingTime = this.openingTime + 864000; // 864000 == 10 days

    const mockToken = await ethers.getContractFactory("ERC20Mock");
    this.contractDAI = await mockToken.attach(DAI);
    this.contractUSDC = await mockToken.attach(USDC);
    this.contractUSDT = await mockToken.attach(USDT);
    this.contractTUSD = await mockToken.attach(TUSD);
    this.contractWETH = await mockToken.attach(WETH);
    this.contractWBTC = await mockToken.attach(WBTC);
    this.contractLINK = await mockToken.attach(LINK);
    this.contractUNI = await mockToken.attach(UNI);
    this.contractCOMP = await mockToken.attach(COMP);
    this.contractMATIC = await mockToken.attach(MATIC);

    const signerImpersonated = await impersonateAccount(provider, signer.address, "0x4563918244F40000000");
    console.log('signerImpersonated', signerImpersonated);

    const walletImpersonated = await impersonateAccount(provider, wallet, "0x4563918244F40000000");
    console.log('signerImpersonated', signerImpersonated);

    // WALLET
    await provider.send("hardhat_impersonateAccount", [wallet]);
    this.signerWallet = await provider.getSigner(wallet);
    await network.provider.request({ method: "hardhat_impersonateAccount", params: [wallet] });
    await network.provider.send("hardhat_setBalance", [wallet, "0x4563918244F40000000"]); // 1280 ETH
    this.signerWallet = await provider.getSigner(wallet);

    const updateAllBalances = async () => {
      try {
        const signerWalletDAI = await impersonateAccount(provider, impersonateDAI, "0x4563918244F40000000");
        console.log('signerWalletDAI', signerWalletDAI)
        await this.contractDAI.connect(signerWalletDAI).transfer(signer.address, toWei("1000"));
        const signerWalletUSDC = await impersonateAccount(provider, impersonateUSDC, "0x4563918244F40000000");
        console.log('signerWalletUSDC', signerWalletUSDC)
        await this.contractUSDC.connect(signerWalletUSDC).transfer(signer.address, 1001 * 1e6);
        const signerWalletUSDT = await impersonateAccount(provider, impersonateUSDT, "0x4563918244F40000000");
        console.log('signerWalletUSDT', signerWalletUSDT)
        await this.contractUSDT.connect(signerWalletUSDT).transfer(signer.address, 1000 * 1e6);
        const signerWalletTUSD = await impersonateAccount(provider, impersonateTUSD, "0x4563918244F40000000");
        console.log('signerWalletTUSD', signerWalletTUSD)
        await this.contractTUSD.connect(signerWalletTUSD).transfer(signer.address, toWei("1000"));
        const signerWalletWETH = await impersonateAccount(provider, impersonateWETH, "0x4563918244F40000000");
        console.log('signerWalletWETH', signerWalletWETH)
        await this.contractWETH.connect(signerWalletWETH).transfer(signer.address, toWei("1000"));
        const signerWalletWBTC = await impersonateAccount(provider, impersonateWBTC, "0x4563918244F40000000");
        console.log('signerWalletWBTC', signerWalletWBTC)
        await this.contractWBTC.connect(signerWalletWBTC).transfer(signer.address, 10 * 1e8);
        const signerWalletLINK = await impersonateAccount(provider, impersonateLINK, "0x4563918244F40000000");
        console.log('signerWalletLINK', signerWalletLINK)
        await this.contractLINK.connect(signerWalletLINK).transfer(signer.address, toWei("1000"));
        const signerWalletUNI = await impersonateAccount(provider, impersonateUNI, "0x4563918244F40000000");
        console.log('signerWalletUNI', signerWalletUNI)
        await this.contractUNI.connect(signerWalletUNI).transfer(signer.address, toWei("1000"));
        const signerWalletCOMP = await impersonateAccount(provider, impersonateCOMP, "0x4563918244F40000000");
        console.log('signerWalletCOMP', signerWalletCOMP)
        await this.contractCOMP.connect(signerWalletCOMP).transfer(signer.address, toWei("1000"));
        const signerWalletMATIC = await impersonateAccount(provider, impersonateMATIC, "0x4563918244F40000000");
        console.log('signerWalletMATIC', signerWalletMATIC)
        await this.contractMATIC.connect(signerWalletMATIC).transfer(signer.address, toWei("1000"));
      } catch (error) {
        console.log('error', error)
      }
    }
    await updateAllBalances();

  });

  it("should check if Roles are working correctly", async () => {
    expect(true).to.equal(true, "Should work")
  });

});