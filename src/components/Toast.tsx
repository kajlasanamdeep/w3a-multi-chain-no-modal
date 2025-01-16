import React, { useEffect } from "react";

// Define types for Toast props
interface ToastProps {
    message: string;
    type?: "success" | "error" | "warning" | "info";
    duration?: number;
    onClose: () => void;
    show: Boolean
}

const Toast: React.FC<ToastProps> = ({
    message,
    show,
    type = "success",
    duration = 3000,
    onClose,
}) => {
    // Tailwind classes for different toast types
    const typeClasses: Record<string, string> = {
        success: "bg-green-100 text-green-800 border-green-500",
        error: "bg-red-100 text-red-800 border-red-500",
        warning: "bg-yellow-100 text-yellow-800 border-yellow-500",
        info: "bg-blue-100 text-blue-800 border-blue-500",
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={`${show ? '' : 'hidden'} fixed top-4 right-4 max-w-sm p-4 flex items-start space-x-4 rounded-lg shadow-lg border-l-4 ${typeClasses[type]} transform transition-all`}
        >
            <div>
                {type === "success" && (
                    <i className="fa fa-check-circle" aria-hidden="true"></i>
                )}
                {["error", "warning"].includes(type) && (
                    <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>
                )}
                {type === "info" && (
                   <i className="fa fa-info-circle" aria-hidden="true"></i>
                )}
            </div>
            <div>
                <p className="font-bold break-all">{message || type.charAt(0).toUpperCase() + type.slice(1)}</p>
            </div>
            <button
                className="text-gray-500 hover:text-gray-700"
                onClick={onClose}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    );
};

export default Toast;
