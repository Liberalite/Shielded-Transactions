// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.9 <0.9.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

interface IWETH {
    function deposit(uint wad) external payable;
    function withdraw(uint wad) external;
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

error UNCLED_BLOCK();
error TX_MISMATCH();

contract ProtectedTxRelayer is AccessControl {
    
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    
    IWETH WETH;

    constructor(address WETH_ADDRESS) payable {
        WETH = IWETH(WETH_ADDRESS);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        if (msg.value > 0) {
            WETH.deposit(msg.value);
        }
    }

    function uniswapWeth(
        address[] memory _targets,
        bytes[] memory _payloads,
        bytes32 expectedParentHash,
        uint256 _ethAmountToCoinbase
    ) external payable onlyRole(EXECUTOR_ROLE) {
        if(_targets.length != _payloads.length) revert TX_MISMATCH();
        if(blockhash(block.number - 1) != expectedParentHash) revert UNCLED_BLOCK();

        for (uint256 i = 0; i < _targets.length; i++) {
            // (bool success, bytes memory result) = addr.call(abi.encodeWithSignature("myFunction(uint,address)", 10, msg.sender)); // function signature string should not have any spaces
            (bool _success, bytes memory result) = _targets[i].call(_payloads[i]);
            require(_success); result;
            // (bytes memory a) = abi.decode(result, (bytes));
        }

        block.coinbase.transfer(_ethAmountToCoinbase);
    }

    function call(address payable _to, uint256 _value, bytes calldata _data) external onlyRole(DEFAULT_ADMIN_ROLE) payable returns (bytes memory) {
        require(_to != address(0));
        (bool _success, bytes memory _result) = _to.call{value: _value}(_data);
        require(_success);
        return _result;
    }

    function withdrawETH(address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(to).transfer(address(this).balance);
    }

    function withdrawTOKENS(address payable to, address tokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IWETH ERC20Token = IWETH(tokenAddress);
        uint256 amount = ERC20Token.balanceOf(address(this));
        ERC20Token.transfer(to, amount);
    }

    function getBlock() external onlyRole(DEFAULT_ADMIN_ROLE) view returns (
        bytes32 blockHash,
        uint256 blockBaseFee,
        uint256 blockChainId,
        address blockCoinbase,
        uint256 blockDifficulty,
        uint256 blockGasLimit,
        uint256 blockNumber,
        uint256 blockTimestamp,
        uint256 remainingGas,
        uint256 txGasprice
    ) {
        return (
            blockhash(block.number - 1),
            block.basefee,
            block.chainid,
            block.coinbase,
            block.difficulty,
            block.gaslimit,
            block.number,
            block.timestamp,
            gasleft(),
            tx.gasprice
        );
    }

    function destruct() external onlyRole(DEFAULT_ADMIN_ROLE){
        selfdestruct(payable(msg.sender));
    }
    
}

// BLOCK DATA
// blockhash(uint blockNumber) returns (bytes32): hash of the given block when blocknumber is one of the 256 most recent blocks; otherwise returns zero
// block.basefee (uint): current block’s base fee (EIP-3198 and EIP-1559)
// block.chainid (uint): current chain id
// block.coinbase (address payable): current block miner’s address
// block.difficulty (uint): current block difficulty
// block.gaslimit (uint): current block gaslimit
// block.number (uint): current block number
// block.timestamp (uint): current block timestamp as seconds since unix epoch
// gasleft() returns (uint256): remaining gas
// msg.data (bytes calldata): complete calldata
// msg.sender (address): sender of the message (current call)
// msg.sig (bytes4): first four bytes of the calldata (i.e. function identifier)
// msg.value (uint): number of wei sent with the message
// tx.gasprice (uint): gas price of the transaction
// tx.origin (address): sender of the transaction (full call chain)