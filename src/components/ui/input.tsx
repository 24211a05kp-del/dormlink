import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = ({ className = "", ...props }: InputProps) => {
    return (
        <input
            className={`w-full px-5 py-3 rounded-xl border-2 border-[#EADFCC] focus:border-[#5A3A1E] outline-none transition-all bg-white text-[#0f172a] placeholder:text-[#7A5C3A]/50 ${className}`}
            {...props}
        />
    );
};
