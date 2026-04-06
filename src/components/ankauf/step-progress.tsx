"use client";

import { cn } from "@/lib/utils";

interface Props {
  currentStep: number;
  steps: string[];
}

export function StepProgress({ currentStep, steps }: Props) {
  return (
    <div className="flex items-center gap-2">
      {steps.slice(1).map((label, i) => {
        const stepIndex = i + 1;
        const isCompleted = currentStep > stepIndex;
        const isActive = currentStep === stepIndex;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                  isCompleted ? "bg-blue-600 text-white" : isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                )}
              >
                {isCompleted ? "✓" : stepIndex}
              </div>
              <span className={cn("text-xs font-medium hidden sm:block", isActive ? "text-blue-600" : "text-gray-400")}>
                {label}
              </span>
            </div>
            {i < steps.length - 2 && (
              <div className={cn("h-px flex-1", currentStep > stepIndex ? "bg-blue-600" : "bg-gray-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
