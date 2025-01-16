import { useEffect, useState } from "react";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { AuthAdapter } from "@web3auth/auth-adapter";
import { IProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { web3AuthConfig, authAdapterConfig } from "./config/web3auth";
import StellarRPC from "./RPC/stellarRPC";
import SendModal from "./components/SendModal";
import Success from "./components/Success";
import Toast from "./components/Toast";



interface ToastState {
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
}
function App() {
    const [show, setShow] = useState(false);
    const [toast, setToast] = useState<ToastState>({
        show: false,
        message: "",
        type: "success",
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [transactionHash, setTransactionHash] = useState<string>("");
    const [publicKey, setPublicKey] = useState<string>("");
    const [balance, setBalance] = useState<{ [key: string]: string }>({
        native: "0"
    })
    const [provider, setProvider] = useState<IProvider | null>(null);
    const [stellarProvider, setStellarProvider] = useState<StellarRPC | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const web3auth = new Web3AuthNoModal(web3AuthConfig);
                setWeb3auth(web3auth);
                const authAdapter = new AuthAdapter(authAdapterConfig);
                web3auth.configureAdapter(authAdapter);
                await web3auth.init();
                setProvider(web3auth.provider);
                setLoggedIn(web3auth.connected);
            } catch (error) {
                console.error(error);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (provider) {
            getStellarProvider();
        }
    }, [provider]);
    const getStellarProvider = async (): Promise<StellarRPC | null> => {
        if (!provider) return null;

        const StellarProvider = new StellarRPC(provider);
        await StellarProvider.getTestnetFund();
        const balance = await StellarProvider.getBalance();
        const publicKey = await StellarProvider.getPublicKey();
        setPublicKey(publicKey)
        setBalance(balance);
        setStellarProvider(StellarProvider)
        return StellarProvider;
    };

    const refreshBalance = async () => {
        try {
            if (!stellarProvider) throw new Error("Stellar Provider not setup properly !");
            const balance = await stellarProvider.getBalance();
            setBalance(balance);
        } catch (error: any) {
            setToast({
                message: error?.message,
                show: true,
                type: 'error'
            })
        }
    }
    const login = async () => {
        if (!web3auth) return;
        const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
            loginProvider: "google",
        });
        setProvider(web3authProvider);
        setLoggedIn(true);
    };

    const logout = async () => {
        if (!web3auth) return;
        await web3auth.logout();
        setProvider(null);
        setLoggedIn(false);
    };

    const onToastClose = () => {
        setToast({
            message: "",
            show: false,
            type: 'success'
        })
    }
    const viewTransaction = () => {
        return window.open(`https://testnet.stellarchain.io/transactions/${transactionHash}`)
    }

    const viewWallet = () => {
        return window.open(`https://testnet.stellarchain.io/accounts/${publicKey}`);
    };

    const sendTransaction = async (destination: string, amount: number) => {

        try {
            if (!stellarProvider) throw new Error("Stellar Provider not setup properly !");
            const balance = await stellarProvider.getBalance();
            setBalance(balance);
            if (+amount >= +balance) {
                throw new Error("Insufficient Balance for transaction !");
            }

            const receipt = await stellarProvider.sendTransaction(destination, amount.toString());
            setTransactionHash(receipt?.hash);
            setShowSuccess(true);
        } catch (error: any) {
            setToast({
                message: error?.message,
                show: true,
                type: 'error'
            })
        }
    }
    return (
        <div className="md:my-[10px] alert flex flex-col w-full md:w-1/2 mx-auto rounded-lg shadow-md bg-white p-4">
            <Toast onClose={onToastClose} show={toast.show} message={toast.message} type={toast.type} />
            <Success show={showSuccess} onHide={() => setShowSuccess(false)} viewTransaction={viewTransaction} />
            <SendModal sendTransaction={sendTransaction} show={show} onHide={() => setShow(false)} selectedNetwork={"XLM"} />

            <header className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-lg">
                <div className="text-lg font-bold">Crypto Wallet</div>
                {loggedIn && (
                    <div className="flex items-center space-x-4 border border-white p-2 rounded-lg cursor-pointer" onClick={logout}>
                        <i className="fas fa-reply"></i>
                    </div>
                )}
            </header>

            {!loggedIn ? (
                <main className="flex-grow p-4">
                    <section className="bg-white p-6 rounded-lg mb-6">
                        <div className="flex justify-center items-center">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={login}>
                                Login with Google
                            </button>
                        </div>
                    </section>
                </main>
            ) : (
                <main className="flex-grow p-4">
                    <section className="bg-white p-6 rounded-lg mb-6">
                        <h2 className="text-xl font-bold mb-4">Portfolio</h2>
                        <div className="space-y-4">
                            <section className="bg-white p-6 rounded-lg mb-6 shadow-md border-[1px] border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <img
                                            alt={`stellar logo`}
                                            className="w-12 h-12"
                                            src={"https://cryptologos.cc/logos/stellar-xlm-logo.png"}
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold">Stellar XLM</h3>
                                            <p className="text-gray-500">XLM</p>
                                        </div>
                                    </div>
                                    <div className="text-right break-all w-1/2">
                                        <p className="text-lg font-semibold">{balance?.native}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4 break-all w-1/2">
                                        <div>
                                            <h3 className="text-lg font-semibold">Account Public Key</h3>
                                            <p className="text-gray-500 cursor-pointer" onClick={viewWallet}>{publicKey}</p>
                                        </div>
                                    </div>
                                    <div className="text-right break-all w-1/2">
                                        <button
                                            className="bg-green-600 text-white px-4 pb-2 m-1 rounded-lg text-2xl"
                                            onClick={refreshBalance}
                                        >
                                            ⟳
                                        </button>
                                        <button
                                            className="bg-blue-600 text-white px-4 py-2 m-1 rounded-lg"
                                            onClick={() => {
                                                setShow(true);
                                            }}
                                        >
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </section>
                </main>
            )}
        </div>
    );
}

export default App;