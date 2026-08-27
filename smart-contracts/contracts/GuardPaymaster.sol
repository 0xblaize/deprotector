// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GuardPaymaster
 * @dev ERC-4337 Paymaster contract allowing Deprotector Guardian to sponsor gas for rescue transactions.
 */
contract GuardPaymaster {
    address public admin;
    address public guardian;

    mapping(address => bool) public approvedWallets;

    event GasSponsored(address indexed userWallet, uint256 actualGasCost);

    modifier onlyAdmin() {
        require(msg.sender == admin, "GuardPaymaster: not admin");
        _;
    }

    modifier onlyGuardian() {
        require(msg.sender == guardian, "GuardPaymaster: not guardian");
        _;
    }

    constructor(address _guardian) {
        admin = msg.sender;
        guardian = _guardian;
    }

    function setApprovedWallet(address userWallet, bool approved) external onlyGuardian {
        approvedWallets[userWallet] = approved;
    }

    function validatePaymasterUserOp(address userWallet) external view returns (bool) {
        return approvedWallets[userWallet];
    }

    receive() external payable {}
}
