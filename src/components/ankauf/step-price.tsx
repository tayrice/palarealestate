"use client";

import type { AnkaufFormData } from "@/app/ankauf/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SELL_TIMELINE_OPTIONS } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  data: AnkaufFormData;
  update: (d: Partial<AnkaufFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPrice({ data, update, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Preis & Zeitplanung</h2>
        <p className="text-gray-500">Diese Angaben sind optional aber hilfreich für uns</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Preisvorstellung */}
        <div className="space-y-2">
          <Label htmlFor="priceExpectation">Preisvorstellung (€)</Label>
          <div className="relative">
            <Input
              id="priceExpectation"
              type="number"
              placeholder="z. B. 350000"
              value={data.priceExpectation}
              onChange={(e) => update({ priceExpectation: e.target.value })}
              className="pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
          </div>
          <p className="text-xs text-gray-400">Ihre Wunschvorstellung – wir prüfen dies und machen ein faires Angebot</p>
        </div>

        {/* Zeitraum */}
        <div className="space-y-3">
          <Label>Wann möchten Sie verkaufen?</Label>
          <div className="grid grid-cols-2 gap-3">
            {SELL_TIMELINE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ sellTimeline: opt.value })}
                className={cn(
                  "p-3 rounded-lg border-2 text-sm font-medium text-left transition-colors",
                  data.sellTimeline === opt.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="h-4 w-4" /> Zurück
        </Button>
        <Button onClick={onNext} className="flex-1">
          Weiter <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
