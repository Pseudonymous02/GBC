import React from "react";

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ label = "Back", className = "", ...props }) => (
  <button
    className={`py-3 px-5 font-semibold rounded-xl text-sm border border-gray-200 bg-white hover:bg-gray-50 transition-colors btn-focus ${className}`}
    {...props}
  >
    {label}
  </button>
);
