import { useEffect, useState } from 'react'

interface Props {
    show: Boolean,
    onHide: () => void,
    selectedNetwork: string,
    sendTransaction: (to: string, amount: number) => any
}
function SendModal({ show, onHide, sendTransaction, selectedNetwork }: Props) {
    const [toAddress, setToAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const onSubmit = async () => {
        setLoading(true);
        await sendTransaction(toAddress, +amount)
        onHide();
        setLoading(false);
    }
    useEffect(() => {
        setLoading(false);
        setToAddress("");
        setAmount("");
    }, [show]);

    return (
        <div className={`fixed z-10 overflow-y-auto top-0 w-full left-0 ${show ? '' : 'hidden'}`} id="modal">
            <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity">
                    <div className="absolute inset-0 bg-gray-900 opacity-75" />
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                <div className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                    <div className="bg-blue-300 font-medium capitalize px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h1>Send {selectedNetwork}</h1>
                    </div>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <label className="font-medium text-gray-800">To Address :</label>
                        <input type="text" value={toAddress} onChange={(e) => {
                            setToAddress(e.target.value)
                        }} className="w-full outline-none rounded bg-gray-100 p-2 mt-2 mb-3" />
                        <label className="font-medium text-gray-800">Amount</label>
                        <input type="number" min={0} value={amount} onChange={(e) => {
                            setAmount(e.target.value)
                        }} className="w-full outline-none rounded bg-gray-100 p-2 mt-2 mb-3" />
                    </div>
                    <div className="bg-gray-200 px-4 py-3 text-right">
                        <button type="button" className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2" onClick={onHide}><i className="fas fa-times"></i> Cancel</button>
                        <button disabled={loading} type="button" className="py-2 px-4 bg-blue-500 text-white rounded font-medium hover:bg-blue-700 mr-2 transition duration-500" onClick={onSubmit}>{loading ? "Submiting..." : "Submit"}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SendModal
