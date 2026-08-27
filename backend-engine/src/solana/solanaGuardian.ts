import { Connection, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';
dotenv.config();

export interface SolanaConfig {
    rpcUrl: string;
    wsUrl: string;
}

export class SolanaGuardianEngine {
    private connection: Connection;

    constructor(config: SolanaConfig) {
        this.connection = new Connection(config.rpcUrl, {
            wsEndpoint: config.wsUrl,
            commitment: 'processed'
        });
    }

    public async monitorWalletAccount(userPublicKeyStr: string): Promise<void> {
        console.log(`🚀 [Solana Engine] Initializing account listener for ${userPublicKeyStr}...`);

        try {
            const userPubkey = new PublicKey(userPublicKeyStr);

            this.connection.onAccountChange(
                userPubkey,
                async (accountInfo, context) => {
                    console.warn(`🔔 [Solana Alert] Account state change on slot ${context.slot} for ${userPublicKeyStr}`);
                    
                    // Trigger emergency balance sweep / delegation revocation
                    await this.executeEmergencySolanaSweep(userPubkey);
                },
                'processed'
            );

            console.log(`✅ [Solana Engine] Active account listener attached.`);
        } catch (error) {
            console.error('❌ [Solana Engine] Error setting up listener:', error);
        }
    }

    private async executeEmergencySolanaSweep(userPubkey: PublicKey): Promise<boolean> {
        console.log(`⚡ [Solana Engine] Constructing emergency sweep instruction...`);
        // In production: Construct token revoke instruction + ComputeBudget priority fee + push to Jito block engine
        return true;
    }
}
