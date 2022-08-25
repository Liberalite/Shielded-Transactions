const hre = require("hardhat");

const goerliWETH = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"

// CONTRACT DEPLOYED AT: https://goerli.etherscan.io/address/0x6F9A7918d27334A0b92a19891102fd257e3f6F32

async function main() {
  const block = await hre.ethers.provider.getBlock("latest");
  console.log('block', block)

  const contract = await hre.ethers.getContractFactory("ProtectedTxRelayer");
  const ProtectedTxRelayer = await contract.deploy(goerliWETH)
  await ProtectedTxRelayer.deployed();
  console.log('ProtectedTxRelayer.address', ProtectedTxRelayer.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});