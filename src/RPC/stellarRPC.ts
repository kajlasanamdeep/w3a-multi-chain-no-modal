import type { IProvider } from '@web3auth/base';
import * as StellarSdk from "@stellar/stellar-sdk";

export default class StellarRPC {
    private provider: IProvider
    private server: StellarSdk.Horizon.Server

    constructor(provider: IProvider) {
        this.provider = provider;
        this.server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
    }

    private async getPrivateKey(): Promise<any> {
        try {
            const privateKey = await this.provider.request({
                method: 'private_key',
            })

            return privateKey
        } catch (error) {
            return error as string
        }
    }

    private async getKeypair(): Promise<any> {
        try {
            const privateKey = await this.getPrivateKey();
            const privateKeyBuffer = Buffer.from(privateKey, "hex");
            const keypair = StellarSdk.Keypair.fromRawEd25519Seed(privateKeyBuffer);
            return keypair;
        } catch (error) {
            return error
        }
    }

    public async getSecretKey(): Promise<any> {
        try {
            const keypair = await this.getKeypair();
            return keypair.secret();
        } catch (error) {
            return error
        }
    }

    public async getPublicKey(): Promise<any> {
        try {
            const keypair = await this.getKeypair();
            return keypair.publicKey();
        } catch (error) {
            return error
        }
    }

    private async getAccount(): Promise<StellarSdk.Horizon.AccountResponse> {
        try {
            const publicKey = await this.getPublicKey();
            const account = await this.server.loadAccount(publicKey);
            return account
        } catch (error) {
            throw error;
        }
    }

    public async getBalance(): Promise<{ [key: string]: string }> {
        try {
            return (await this.getAccount()).balances.reduce((curr, next) => {
                return {
                    ...curr,
                    [next.asset_type]: next.balance
                }
            }, { native: "0" });
        } catch (error) {
            throw error
        }
    }

    public async sendTransaction(destination: string, amount: string): Promise<StellarSdk.Horizon.HorizonApi.SubmitTransactionResponse> {
        try {
            const account = await this.getAccount();
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
            transaction.sign(keypair);
            const result = await this.server.submitTransaction(transaction);
            console.log("Transaction successful:", result);
            return result;
        } catch (error) {
            throw error;
        }
    }

    public async getTestnetFund(): Promise<any> {
        try {
            const response = await fetch(
                `https://friendbot.stellar.org?addr=${encodeURIComponent(
                    await this.getPublicKey(),
                )}`,
            );
            const responseJSON = await response.json();
            return responseJSON;
        } catch (e) {
            console.error("ERROR!", e);
        }
    }
}
