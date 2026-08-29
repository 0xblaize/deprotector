// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GuardWallet.sol";

contract GuardFactory {
    address public immutable guardian;
    address public immutable tokenGuard;
    mapping(address => address) public walletForOwner;

    event GuardWalletCreated(address indexed owner, address indexed wallet, address indexed tokenGuard);

    constructor(address _guardian, address _tokenGuard) {
        require(_guardian != address(0), "GuardFactory: invalid guardian");
        require(_tokenGuard != address(0), "GuardFactory: invalid token guard");
        guardian = _guardian;
        tokenGuard = _tokenGuard;
    }

    function deployGuardWallet(address rescueVault) external returns (address wallet) {
        require(walletForOwner[msg.sender] == address(0), "GuardFactory: wallet already exists");
        require(rescueVault != address(0), "GuardFactory: invalid rescue vault");
        GuardWallet created = new GuardWallet(msg.sender, guardian);
        created.setTokenGuard(tokenGuard);
        created.setRescueVault(rescueVault);
        wallet = address(created);
        walletForOwner[msg.sender] = wallet;
        emit GuardWalletCreated(msg.sender, wallet, tokenGuard);
    }
}
