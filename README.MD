Shielded Transactions - Alchemy and Flashbots

1. Copy .env.example to .env and add your env keys
2. ```yarn run forkMainnet``` should fork Ethereum Mainnet in a local Hardhat Node
3. ```yarn run test``` Top-Up Mainnet Local Fork Balances for the Native Coin and 1000 * 10 ERC20 Tokens
4. you can run ```node scripts/sendPrivateTxFlashBotsGoerli.js``` run Goerli FlashBots Shielded Transaction. 
5. you can run ```node scripts/sendPrivateTxAlchemyMainnet.js``` run Mainnet Alchemy Shielded Transaction. 

--- TODO ---

V1 - MAINNET LOCAL FORK & GOERLI:
[x] basic env
[x] add balances on local mainnet fork
[x] add ETH Mainnet - Alchemy private transfer example
[x] add ETH Goerli - Flashbots private transfer example
[x] add legacy transactions
[x] add EIP1159 transactions
[x] add simulated transactions
[] add bundled transactions
[] add function gas estimation example
[] add function _signTypedData example
[] any urgent task needed ?

V2 - MAINNET:
[] add mainnet
[] add retry EIP 1559 transaction
[] add signMessage
[] add _signTypedData
[] add _verifyMessage
[] add eth_estimateGas
[] add upgradeable transactions
[] add simulate transactions
[] add multicall tasks
[] add tests for local Fork