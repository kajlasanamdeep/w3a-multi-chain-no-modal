import { useEffect, useState } from "react";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { AuthAdapter } from "@web3auth/auth-adapter";
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { web3AuthConfig, authAdapterConfig } from "./config/web3auth";
import networks from "./config/networks.json";
import Web3 from "web3";
import EthereumRPC from "./RPC/ethRPC-web3";
import SendModal from "./components/SendModal";
import Success from "./components/Success";
import Toast from "./components/Toast";

const mode = "testnet";

enum Network {
    ethereum = "ethereum",
    polygon = "polygon",
    binance = "binance",
}

interface NetworkConfig {
    chainConfig: any;
    displayName: string;
    ticker: string;
    logo: string;
}

interface WalletState {
    balance: number;
    address: string;
}

interface NetworkDetails {
    [key: string]: WalletState;
}

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
    const [selectedNetwork, setSelectedNetwork] = useState<Network>(Network.ethereum);
    const [transactionHash, setTransactionHash] = useState<string>("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [networkDetails, setNetworkDetails] = useState<NetworkDetails>({});
    const [provider, setProvider] = useState<IProvider | null>(null);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);

    const supportedNetworks = [Network.binance, Network.ethereum, Network.polygon];

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
            updateAllNetworkDetails();
        }
    }, [provider]);

    const getNetworkDetails = async (networkName: Network): Promise<Web3 | null> => {
        if (!provider) return null;

        const rpc = new EthereumRPC(provider);
        const privateKey = await rpc.getPrivateKey();

        const privateKeyProvider = new EthereumPrivateKeyProvider({
            config: {
                chainConfig: {
                    chainNamespace: CHAIN_NAMESPACES.EIP155,
                    ...networks[networkName][mode],
                },
            },
        });

        await privateKeyProvider.setupProvider(privateKey);
        const web3 = new Web3(privateKeyProvider);
        const address = (await web3.eth.getAccounts())[0];
        const balance = await web3.eth.getBalance(address);

        setNetworkDetails(prev => ({
            ...prev,
            [networkName]: {
                address,
                balance: Number(web3.utils.fromWei(balance, 'ether'))
            }
        }));

        return web3;
    };

    const updateAllNetworkDetails = () => {
        supportedNetworks.forEach(network => getNetworkDetails(network));
    };

    const sendTransaction = async (to: string, value: number) => {
        try {
            if (+value >= +networkDetails[selectedNetwork]?.balance) {
                throw new Error("Insufficient Balance for transaction !");
            }
            if (!provider) throw new Error("Provider not setup properly !");

            const web3 = await getNetworkDetails(selectedNetwork);
            if (!web3) throw new Error("Fail to get web3 provider !");

            const fromAddress = (await web3.eth.getAccounts())[0];
            const amount = web3.utils.toWei(value.toFixed(5), "ether");

            let transaction = {
                from: fromAddress,
                to,
                data: "0x",
                value: amount,
            };

            transaction = {
                ...transaction,
                gas: await web3.eth.estimateGas(transaction)
            } as any;

            const receipt = await web3.eth.sendTransaction(transaction);
            setTransactionHash(receipt?.transactionHash?.toString());
            setShowSuccess(true);
            return receipt;
        } catch (error: any) {
            setToast({
                message: error?.message,
                show: true,
                type: 'error'
            })
        }
    };

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

    const viewTransaction = () => {
        return window.open(`${networks?.[selectedNetwork]?.[mode].blockExplorerUrl}/tx/${transactionHash}`);
    };
    const viewWallet = (blockExplorerUrl: string, walletAddress: string) => {
        return window.open(`${blockExplorerUrl}/address/${walletAddress}`);
    };


    const onToastClose = () => {
        setToast({
            message: "",
            show: false,
            type: 'success'
        })
    }
    return (
        <div className="md:my-[10px] alert flex flex-col w-full md:w-1/2 mx-auto rounded-lg shadow-md bg-white p-4">
            <Toast onClose={onToastClose} show={toast.show} message={toast.message} type={toast.type} />
            <Success show={showSuccess} onHide={() => setShowSuccess(false)} viewTransaction={viewTransaction} />
            <SendModal sendTransaction={sendTransaction} show={show} onHide={() => setShow(false)} selectedNetwork={selectedNetwork} />

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
                            {supportedNetworks.map((network) => (
                                <section key={network} className="bg-white p-6 rounded-lg mb-6 shadow-md border-[1px] border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                alt={`${network} logo`}
                                                className="w-12 h-12"
                                                src={networks[network][mode].logo}
                                            />
                                            <div>
                                                <h3 className="text-lg font-semibold">{networks[network][mode].tickerName}</h3>
                                                <p className="text-gray-500">{networks[network][mode].ticker}</p>
                                            </div>
                                        </div>
                                        <div className="text-right break-all w-1/2">
                                            <p className="text-lg font-semibold">{networkDetails[network]?.balance || 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-4 break-all w-1/2">
                                            <div>
                                                <h3 className="text-lg font-semibold">wallet address</h3>
                                                <p className="text-gray-500 cursor-pointer" onClick={() => viewWallet(networks?.[network]?.[mode].blockExplorerUrl, networkDetails[network]?.address)}>{networkDetails[network]?.address || ''}</p>
                                            </div>
                                        </div>
                                        <div className="text-right break-all w-1/2">
                                            <button
                                                className="bg-green-600 text-white px-4 pb-2 m-1 rounded-lg text-2xl"
                                                onClick={() => getNetworkDetails(network)}
                                            >
                                                ⟳
                                            </button>
                                            <button
                                                className="bg-blue-600 text-white px-4 py-2 m-1 rounded-lg"
                                                onClick={() => {
                                                    setSelectedNetwork(network);
                                                    setShow(true);
                                                }}
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </section>
                </main>
            )}
        </div>
    );
}

export default App;