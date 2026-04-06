"use client";

import type { AnkaufFormData } from "@/app/ankauf/page";
import { Button } from "@/components/ui/button";
import { Building2, BarChart3, Phone } from "lucide-react";

interface Props {
  data: AnkaufFormData;
  update: (d: Partial<AnkaufFormData>) => void;
  onNext: () => void;
}

const options = [
  {
    value: "verkauf",
    icon: Building2,
    title: "Immobilie verkaufen",
    description: "Wir kaufen Ihre Immobilie – schnell, fair und diskret.",
  },
  {
    value: "bewertung",
    icon: BarChart3,
    title: "Kostenlose Bewertung",
    description: "Erfahren Sie den aktuellen Marktwert Ihrer Immobilie.",
  },
  {
    value: "rueckruf",
    icon: Phone,
    title: "Rückruf-Termin",
    description: "Wir rufen Sie zum gewünschten Zeitpunkt zurück.",
  },
];

export function StepStart({ data, update, onNext }: Props) {
  function select(value: string) {
    update({ intent: value });
    onNext();
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Was kann ich für Sie tun?</h1>
        <p className="text-gray-500">Wählen Sie aus, wie wir Ihnen helfen können</p>
      </div>
      <div className="grid gap-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              className="flex items-center gap-4 p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{opt.title}</div>
                <div className="text-sm text-gray-500 mt-0.5">{opt.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
