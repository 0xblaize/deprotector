// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITokenGuard {
    function isBlacklistedSpender(address spender) external view returns (bool);
}

contract GuardWallet {
    address public owner;
    address public guardian;
    address public rescueVault;
    ITokenGuard public tokenGuard;
    bool public isFrozen;
    bool private entered;

    bytes4 private constant APPROVE = 0x095ea7b3;
    bytes4 private constant SET_APPROVAL_FOR_ALL = 0xa22cb465;
    bytes4 private constant INCREASE_ALLOWANCE = 0x39509351;

    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event GuardianChanged(address indexed oldGuardian, address indexed newGuardian);
    event RescueVaultChanged(address indexed oldVault, address indexed newVault);
    event TokenGuardChanged(address indexed oldGuard, address indexed newGuard);
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
        require(!isFrozen, "GuardWallet: wallet is frozen");
        _;
    }

    modifier nonReentrant() {
        require(!entered, "GuardWallet: reentrant call");
        entered = true;
        _;
        entered = false;
    }

    constructor(address _owner, address _guardian) {
        require(_owner != address(0), "GuardWallet: invalid owner");
        require(_guardian != address(0), "GuardWallet: invalid guardian");
        owner = _owner;
        guardian = _guardian;
    }

    function setGuardian(address newGuardian) external onlyOwner {
        require(newGuardian != address(0), "GuardWallet: invalid guardian");
        emit GuardianChanged(guardian, newGuardian);
        guardian = newGuardian;
    }

    function setRescueVault(address newVault) external onlyOwner {
        require(newVault != address(0), "GuardWallet: invalid rescue vault");
        emit RescueVaultChanged(rescueVault, newVault);
        rescueVault = newVault;
    }

    function setTokenGuard(address newGuard) external onlyOwner {
        emit TokenGuardChanged(address(tokenGuard), newGuard);
        tokenGuard = ITokenGuard(newGuard);
    }

    function execute(address target, uint256 value, bytes calldata data) external onlyOwner whenNotFrozen nonReentrant returns (bytes memory) {
        require(target != address(0), "GuardWallet: invalid target");
        _checkApproval(target, data);
        (bool success, bytes memory result) = target.call{value: value}(data);
        require(success, "GuardWallet: transaction execution failed");
        emit TransactionExecuted(target, value, data);
        return result;
    }

    function emergencyFreeze() external onlyGuardian {
        isFrozen = true;
        emit EmergencyFrozen(msg.sender);
    }

    function unfreeze() external onlyOwner {
        isFrozen = false;
        emit EmergencyUnfrozen(msg.sender);
    }

    function emergencySweepToken(address token, uint256 amount) external onlyGuardian whenFrozen nonReentrant {
        require(rescueVault != address(0), "GuardWallet: rescue vault not configured");
        if (token == address(0)) {
            uint256 balance = address(this).balance;
            uint256 sweepAmount = amount == 0 || amount > balance ? balance : amount;
            (bool sent, ) = rescueVault.call{value: sweepAmount}("");
            require(sent, "GuardWallet: native sweep failed");
            emit EmergencySweepExecuted(address(0), rescueVault, sweepAmount);
        } else {
            (bool success, bytes memory result) = token.call(abi.encodeWithSignature("transfer(address,uint256)", rescueVault, amount));
            require(success && (result.length == 0 || abi.decode(result, (bool))), "GuardWallet: token sweep failed");
            emit EmergencySweepExecuted(token, rescueVault, amount);
        }
    }

    modifier whenFrozen() {
        require(isFrozen, "GuardWallet: wallet is not frozen");
        _;
    }

    function _checkApproval(address target, bytes calldata data) internal view {
        if (address(tokenGuard) == address(0) || data.length < 36) return;
        bytes4 selector;
        address spender;
        assembly {
            selector := calldataload(data.offset)
            spender := shr(96, calldataload(add(data.offset, 4)))
        }
        if (selector == APPROVE || selector == INCREASE_ALLOWANCE || selector == SET_APPROVAL_FOR_ALL) {
            require(!tokenGuard.isBlacklistedSpender(spender), "GuardWallet: blacklisted spender");
        }
        target;
    }

    receive() external payable {}
}
