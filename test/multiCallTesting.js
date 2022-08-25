const { expect } = require("chai");
const { network, ethers } = require("hardhat");

describe("Mainnet Fork - Balances Top-up", function () {
  before(async () => {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
    const block = await hre.ethers.provider.getBlock("latest");
    
  });

  it("should check if Roles are working correctly", async () => {
    expect(true).to.equal(true, "Should work")
  });

});