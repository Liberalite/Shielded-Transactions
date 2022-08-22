const { network } = require("hardhat");

// Impersonate account and top-up balances on the local mainnet fork
const impersonateAccount = async (provider, addr, amount) => {
    try {
        await provider.send("hardhat_impersonateAccount", [addr]);
        await network.provider.request({ method: "hardhat_impersonateAccount", params: [addr] });
        await network.provider.send("hardhat_setBalance", [addr, amount]);
        return await provider.getSigner(addr);
    } catch (error) {
        console.log('error', error)
    }
}

module.exports.impersonateAccount = impersonateAccount;