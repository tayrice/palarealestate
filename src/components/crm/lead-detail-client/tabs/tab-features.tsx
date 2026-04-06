"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

interface Props {
  lead: any;
  canEdit: boolean;
  onRefresh: () => void;
}

const PROPERTY_FEATURES = [
  { category: "Ausstattung", features: [
    { key: "einbaukueche", label: "Einbauküche" },
    { key: "keller", label: "Keller" },
    { key: "dachboden", label: "Dachboden" },
    { key: "garage", label: "Garage" },
    { key: "stellplatz", label: "Stellplatz" },
    { key: "aufzug", label: "Aufzug" },
    { key: "barrierefrei", label: "Barrierefrei" },
    { key: "rollstuhlgerecht", label: "Rollstuhlgerecht" },
  ]},
  { category: "Außenbereich", features: [
    { key: "garten", label: "Garten" },
    { key: "terrasse", label: "Terrasse" },
    { key: "balkon", label: "Balkon" },
    { key: "loggia", label: "Loggia" },
    { key: "pool", label: "Pool / Schwimmbad" },
    { key: "sauna", label: "Sauna" },
  ]},
  { category: "Heizung & Energie", features: [
    { key: "zentralheizung", label: "Zentralheizung" },
    { key: "fussbodenheizung", label: "Fußbodenheizung" },
    { key: "fernwaerme", label: "Fernwärme" },
    { key: "pelletheizung", label: "Pelletheizung" },
    { key: "wärmepumpe", label: "Wärmepumpe" },
    { key: "solar", label: "Solaranlage" },
    { key: "photovoltaik", label: "Photovoltaik" },
  ]},
  { category: "Sicherheit", features: [
    { key: "alarmanlage", label: "Alarmanlage" },
    { key: "videoüberwachung", label: "Videoüberwachung" },
    { key: "gegensprechanlage", label: "Gegensprechanlage" },
    { key: "schliessanlage", label: "Schließanlage" },
  ]},
];

export function TabFeatures({ lead, canEdit, onRefresh }: Props) {
  const { toast } = useToast();
  const [features, setFeatures] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    (lead.features ?? []).forEach((f: any) => { map[f.featureKey] = f.enabled; });
    return map;
  });

  const enabledCount = Object.values(features).filter(Boolean).length;
  const allFeatures = PROPERTY_FEATURES.flatMap((c) => c.features);

  async function toggle(key: string, label: string, enabled: boolean) {
    setFeatures((prev) => ({ ...prev, [key]: enabled }));
    await fetch(`/api/leads/${lead.id}/features`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureKey: key, label, enabled }),
    });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{enabledCount} Merkmale ausgewählt</div>
        {enabledCount < 8 && (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Empfehlung: Mindestens 8 Hauptmerkmale für das Inserat
          </div>
        )}
      </div>

      {PROPERTY_FEATURES.map((cat) => (
        <div key={cat.category} className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">{cat.category}</h3>
          <div className="grid grid-cols-2 gap-2">
            {cat.features.map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <Checkbox
                  id={f.key}
                  checked={!!features[f.key]}
                  onCheckedChange={(c) => toggle(f.key, f.label, !!c)}
                  disabled={!canEdit}
                />
                <label htmlFor={f.key} className="text-sm text-gray-700 cursor-pointer">{f.label}</label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
