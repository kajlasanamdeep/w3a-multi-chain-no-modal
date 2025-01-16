import type { IProvider } from '@web3auth/base';
import StellarSdk from "stellar-sdk";

export default class StellarRPC {
    private provider: IProvider

    constructor(provider: IProvider) {
        this.provider = provider
    }

    async getChainId(): Promise<string> {
        try {
            return "";
        } catch (error) {
            return error as string
        }
    }

    public async getPublicKey(): Promise<any> {
        try {
            // Create Stellar keypair
            const privateKey = await this.getGeneralPrivateKey();
            const keypair = StellarSdk.Keypair.fromSecret(privateKey);

            return keypair.publicKey();
        } catch (error) {
            return error
        }
    }
    public async getKeypair(): Promise<any> {
        try {
            // Create Stellar keypair
            const privateKey = await this.getGeneralPrivateKey();
            const keypair = StellarSdk.Keypair.fromSecret(privateKey);

            return keypair;
        } catch (error) {
            return error
        }
    }
    public async getAccounts(): Promise<any> {
        try {

            const publicKey = await this.getPublicKey();
            // Connect to Stellar testnet
            const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

            console.log("Public Key:", publicKey);

            // Fetch account details
            const account = await server.loadAccount(publicKey);
            return account
        } catch (error) {
            return error
        }
    }

    async getBalance(): Promise<string> {
        try {
            return ""
        } catch (error) {
            return error as string
        }
    }

    async sendTransaction(destination: string, amount: string): Promise<any> {
        try {
            // Build a transaction (example: sending XLM)
            const account = await this.getAccounts();
            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET,
            })
                .addOperation(
                    StellarSdk.Operation.payment({
                        destination,
                        asset: StellarSdk.Asset.native(),
                        amount, // Amount of XLM to send
                    })
                )
                .setTimeout(30)
                .build();

            const keypair = await this.getKeypair();
            // Sign transaction
            transaction.sign(keypair);

            // Submit transaction
            const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

            const result = await server.submitTransaction(transaction);
            console.log("Transaction successful:", result);
            return result;

        } catch (error) {
            return error as string;
        }
    }

    async getPrivateKey(): Promise<any> {
        try {
            const privateKey = await this.provider.request({
                method: 'eth_private_key',
            })

            return privateKey
        } catch (error) {
            return error as string
        }
    }

    async getGeneralPrivateKey(): Promise<any> {
        try {
            const privateKey = await this.provider.request({
                method: 'private_key',
            })

            return privateKey
        } catch (error) {
            return error as string
        }
    }
}
