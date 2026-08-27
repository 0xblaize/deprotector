// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TokenGuard
 * @dev On-chain registry for tracking banned drainer contracts and malicious spenders.
 */
contract TokenGuard {
    address public admin;
    mapping(address => bool) public isBlacklistedSpender;

    event SpenderBlacklisted(address indexed spender, bool status);

    modifier onlyAdmin() {
        require(msg.sender == admin, "TokenGuard: caller is not the admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function setSpenderStatus(address spender, bool blacklisted) external onlyAdmin {
        require(spender != address(0), "TokenGuard: invalid spender");
        isBlacklistedSpender[spender] = blacklisted;
        emit SpenderBlacklisted(spender, blacklisted);
    }

    function batchSetSpenderStatus(address[] calldata spenders, bool blacklisted) external onlyAdmin {
        for (uint256 i = 0; i < spenders.length; i++) {
            if (spenders[i] != address(0)) {
                isBlacklistedSpender[spenders[i]] = blacklisted;
                emit SpenderBlacklisted(spenders[i], blacklisted);
            }
        }
    }
}
