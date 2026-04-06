"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all",
            toast.variant === "destructive"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-gray-200 bg-white text-gray-900"
          )}
        >
          <div className="flex-1">
            {toast.title && <div className="font-semibold text-sm">{toast.title}</div>}
            {toast.description && <div className="text-sm opacity-80 mt-0.5">{toast.description}</div>}
          </div>
          <button onClick={() => dismiss(toast.id)} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
