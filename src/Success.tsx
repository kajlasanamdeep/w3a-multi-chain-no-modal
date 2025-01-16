import React from 'react'
interface Props {
    show: Boolean,
    onHide: () => void,
    viewTransaction: () => void
}
function Success({ show, onHide, viewTransaction }: Props) {
    return (
        <div className={`${show ? '' : 'hidden'} relative z-10`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true"></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm">
                        <div className="bg-white px-4 pt-5 pb-4 flex justify-center ">
                            <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                                <i className="fa  fa-check-circle" aria-hidden="true"></i>
                            </div>
                        </div>
                        <div className="bg-white px-4 pb-4 flex justify-center ">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">Payment Success</h3>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row sm:px-6 justify-center ">
                            <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" onClick={onHide}>Close</button>
                            <button type="button" className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto" onClick={viewTransaction}>View</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Success
