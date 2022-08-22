const { ethers } = require("hardhat");

const increaseTime = async (value) => {
    try {
        if (!ethers.BigNumber.isBigNumber(value)) {
            value = ethers.BigNumber.from(value);
        }
        await ethers.provider.send('evm_increaseTime', [value.toNumber()]);
        await ethers.provider.send('evm_mine');
    } catch (error) {
        console.log('error', error)
    }
}

module.exports.increaseTime = increaseTime;