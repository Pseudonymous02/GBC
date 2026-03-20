import React from "react";

interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  color?: string;
}

export const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, highlight = false, color = "#e6dc00" }) => (
  <div
    className={`flex justify-between items-center py-2.5 px-4 rounded-xl ${highlight ? '' : 'bg-gray-50'}`}
    style={highlight ? { backgroundColor: '#fffef0', border: `1px solid ${color}` } : {}}
  >
    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
    <span className="text-sm font-semibold text-gray-800 max-w-[60%] text-right truncate">{value}</span>
  </div>
);
