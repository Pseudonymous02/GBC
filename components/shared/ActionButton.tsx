import React from "react";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  color?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ label, color = "#e6dc00", className = "", ...props }) => (
  <button
    className={`w-full py-3 px-5 font-semibold rounded-xl shadow-sm text-sm transition-all btn-focus ${className}`}
    style={{ backgroundColor: color, color: '#1a1a1a' }}
    {...props}
  >
    {label}
  </button>
);
