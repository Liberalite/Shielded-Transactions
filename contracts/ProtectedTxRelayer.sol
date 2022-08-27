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
error ADDRESS_ZERO_NOT_ACCEPTED();

contract ProtectedTxRelayer is AccessControl {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    IWETH WETH;

    constructor(address WETH_ADDRESS, address[] memory whitelistedAddressess) payable {
        WETH = IWETH(WETH_ADDRESS);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        for (uint i = 0; i < whitelistedAddressess.length;) {
            _grantRole(EXECUTOR_ROLE, whitelistedAddressess[i]);
            unchecked{ i++; }
        }
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
        if (_targets.length != _payloads.length) revert TX_MISMATCH();
        if (blockhash(block.number - 1) != expectedParentHash) revert UNCLED_BLOCK();

        for (uint256 i = 0; i < _targets.length;) {
            // (bool _success, bytes memory _response) = _targets[i].call(abi.encodeWithSignature("myFunction(uint,address)", 10, msg.sender)); // function signature string should not have any spaces
            (bool _success, bytes memory _response) = _targets[i].call(_payloads[i]);
            require(_success); _response;
            // (bytes memory a) = abi.decode(_response, (bytes));
            unchecked{i++;}
        }

        block.coinbase.transfer(_ethAmountToCoinbase);
    }

    function call(
        address payable _to,
        uint256 _value,
        bytes calldata _data
    ) external payable onlyRole(DEFAULT_ADMIN_ROLE) returns (bytes memory) {
        if(_to == address(0)) revert ADDRESS_ZERO_NOT_ACCEPTED();
        (bool _success, bytes memory _result) = _to.call{value: _value}(_data);
        require(_success);
        return _result;
    }

    function withdrawETH(address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(to).transfer(address(this).balance);
    }

    function withdrawTOKEN(address payable to, address tokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IWETH ERC20Token = IWETH(tokenAddress);
        uint256 amount = ERC20Token.balanceOf(address(this));
        ERC20Token.transfer(to, amount);
    }

    function withdrawMultipleTOKENS(address payable to, address[] memory tokenAddress)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        for (uint i = 0; i < tokenAddress.length;) {
            IWETH ERC20Token = IWETH(tokenAddress[i]);
            uint256 amount = ERC20Token.balanceOf(address(this));
            ERC20Token.transfer(to, amount);
            unchecked { i++; }
        }
    }

    function getBlock()
        external
        view
        onlyRole(DEFAULT_ADMIN_ROLE)
        returns (
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
        )
    {
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

    function getSelectors() external pure returns (bytes memory) {
        return abi.encodeWithSelector(this.call.selector); // abi.encodeWithSignature("call()")
    }

    function destruct() external onlyRole(DEFAULT_ADMIN_ROLE) {
        selfdestruct(payable(msg.sender));
    }
}

contract MultiCall {
    function multiCall(address[] calldata _targets, bytes[] calldata _payloads)
        external
        view
        returns (bytes[] memory)
    {
        if (_targets.length != _payloads.length) revert TX_MISMATCH();
        bytes[] memory results = new bytes[](_payloads.length);

        for (uint i; i < _targets.length;) {
            (bool success, bytes memory result) = _targets[i].staticcall(
                _payloads[i]
            );
            if (success) {
                results[i] = result;
            }
            unchecked{i++;}
        }

        return results;
    }
}

contract MultiCallExtended {
    constructor(address[] memory targets, bytes[] memory args) {
        uint256 len = targets.length;
        if(args.length != len) revert TX_MISMATCH();

        bytes[] memory returnDatas = new bytes[](len);

        for (uint256 i = 0; i < len;) {
            address target = targets[i];
            bytes memory arg = args[i];
            (bool success, bytes memory returnData) = target.call(arg);
            if (!success) {
                returnDatas[i] = bytes("");
            } else {
                returnDatas[i] = returnData;
            }
            unchecked{i++;}
        }
        bytes memory data = abi.encode(block.number, returnDatas);
        assembly {
            return(add(data, 32), data)
        }
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
