import { ethers } from 'ethers';

// Standard EVM Method Signatures used by Drainers
export const METHOD_SIGNATURES = {
    APPROVE: '0x095ea7b3',              // approve(address,uint256)
    SET_APPROVAL_FOR_ALL: '0xa22cb465', // setApprovalForAll(address,bool)
    INCREASE_ALLOWANCE: '0x39509351',   // increaseAllowance(address,uint256)
    PERMIT: '0xd505174f',               // permit(address,address,uint256,uint256,uint8,bytes32,bytes32)
    PERMIT2: '0x2b67ed7d'               // Permit2 approve signature
};

export interface DecodedApproval {
    methodName: string;
    isApproval: boolean;
    spender: string;
    valueOrApproved: string | boolean;
}

export function decodeTransactionInput(data: string): DecodedApproval | null {
    if (!data || data.length < 10) return null;

    const methodId = data.slice(0, 10).toLowerCase();

    try {
        if (methodId === METHOD_SIGNATURES.APPROVE || methodId === METHOD_SIGNATURES.INCREASE_ALLOWANCE) {
            const abiCoder = new ethers.utils.AbiCoder();
            const decoded = abiCoder.decode(['address', 'uint256'], '0x' + data.slice(10));
            return {
                methodName: methodId === METHOD_SIGNATURES.APPROVE ? 'approve' : 'increaseAllowance',
                isApproval: true,
                spender: decoded[0].toLowerCase(),
                valueOrApproved: decoded[1].toString()
            };
        }

        if (methodId === METHOD_SIGNATURES.SET_APPROVAL_FOR_ALL) {
            const abiCoder = new ethers.utils.AbiCoder();
            const decoded = abiCoder.decode(['address', 'bool'], '0x' + data.slice(10));
            return {
                methodName: 'setApprovalForAll',
                isApproval: decoded[1], // True if granting approval for all assets
                spender: decoded[0].toLowerCase(),
                valueOrApproved: decoded[1]
            };
        }
    } catch (error) {
        console.error('[Decoder] Failed to parse transaction payload:', error);
    }

    return null;
}
