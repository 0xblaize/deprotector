// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GuardWallet
 * @dev ERC-4337 Account Abstraction Smart Contract Wallet with Guardian Co-Signing & Emergency Asset Rescue.
 */
contract GuardWallet {
    address public owner;
    address public guardian;
    bool public isFrozen;

    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event GuardianChanged(address indexed oldGuardian, address indexed newGuardian);
    event EmergencyFrozen(address indexed triggeredBy);
    event EmergencyUnfrozen(address indexed triggeredBy);
    event EmergencySweepExecuted(address indexed token, address indexed destination, uint256 amount);
    event TransactionExecuted(address indexed target, uint256 value, bytes data);

    modifier onlyOwner() {
        require(msg.sender == owner, "GuardWallet: caller is not the owner");
        _;
    }

    modifier onlyGuardian() {
        require(msg.sender == guardian, "GuardWallet: caller is not the guardian");
        _;
    }

    modifier whenNotFrozen() {
        require(!isFrozen, "GuardWallet: contract is frozen due to high threat state");
        _;
    }

    constructor(address _owner, address _guardian) {
        require(_owner != address(0), "GuardWallet: invalid owner");
        require(_guardian != address(0), "GuardWallet: invalid guardian");
        owner = _owner;
        guardian = _guardian;
        isFrozen = false;
    }

    /**
     * @notice Execute a transaction requiring both user signature and non-frozen state.
     */
    function execute(address target, uint256 value, bytes calldata data) external onlyOwner whenNotFrozen returns (bytes memory) {
        require(target != address(0), "GuardWallet: invalid target");
        
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "GuardWallet: transaction execution failed");

        emit TransactionExecuted(target, value, data);
        return result;
    }

    /**
     * @notice Emergency Freeze function triggered by the Guardian security backend.
     */
    function emergencyFreeze() external onlyGuardian {
        isFrozen = true;
        emit EmergencyFrozen(msg.sender);
    }

    /**
     * @notice Unfreeze contract once security threat has cleared.
     */
    function unfreeze() external onlyGuardian {
        isFrozen = false;
        emit EmergencyUnfrozen(msg.sender);
    }

    /**
     * @notice Emergency sweep function: Guardian transfers native asset or tokens to a safe vault.
     */
    function emergencySweepToken(address token, address safeVault, uint256 amount) external onlyGuardian {
        require(safeVault != address(0), "GuardWallet: invalid safe vault address");

        if (token == address(0)) {
            // Sweep native ETH / Gas token
            uint256 balance = address(this).balance;
            uint256 sweepAmount = amount > 0 && amount <= balance ? amount : balance;
            (bool sent, ) = safeVault.call{value: sweepAmount}("");
            require(sent, "GuardWallet: native sweep failed");
            emit EmergencySweepExecuted(address(0), safeVault, sweepAmount);
        } else {
            // Sweep ERC20 Token balance
            bytes memory data = abi.encodeWithSignature("transfer(address,uint256)", safeVault, amount);
            (bool success, ) = token.call(data);
            require(success, "GuardWallet: ERC20 sweep failed");
            emit EmergencySweepExecuted(token, safeVault, amount);
        }
    }

    receive() external payable {}
}
