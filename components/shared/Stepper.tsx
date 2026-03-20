import React from "react";
import { motion } from "framer-motion";

interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: string;
  color?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, color = "#e6dc00" }) => {
  const stepIndex = steps.findIndex((s) => s.id === currentStep);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isDone = stepIndex > i;
          const isActive = stepIndex === i;
          return (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                  style={isDone
                    ? { backgroundColor: '#16a34a', color: '#fff' }
                    : isActive
                    ? { backgroundColor: color, color: '#1a1a1a', boxShadow: `0 2px 8px ${color}4D` }
                    : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span className="text-[11px] font-semibold" style={isActive ? { color: '#b8a800' } : isDone ? { color: '#16a34a' } : { color: '#9ca3af' }}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-1 rounded-full mx-2 mb-4 transition-all duration-500" style={{ backgroundColor: stepIndex > i ? color : '#f3f4f6' }} />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
