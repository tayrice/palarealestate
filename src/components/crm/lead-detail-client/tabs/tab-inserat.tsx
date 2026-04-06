"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Copy, Sparkles, Building2 } from "lucide-react";

interface Props { lead: any; }

type Style = "premium" | "social" | "whatsapp";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  haus: "Haus", wohnung: "Wohnung", grundstueck: "Grundstück",
  mehrfamilienhaus: "Mehrfamilienhaus", gewerbe: "Gewerbeimmobilie", other: "Immobilie",
};

const CONDITION_LABELS: Record<string, string> = {
  neuwertig: "neuwertig", gut: "in gutem Zustand", gepflegt: "gepflegt",
  renovierungsbeduerftig: "renovierungsbedürftig", sanierungsbeduerftig: "sanierungsbedürftig",
};

function generateInserat(lead: any, style: Style, features: string[]): string {
  const type = PROPERTY_TYPE_LABELS[lead.propertyType] ?? "Immobilie";
  const area = lead.livingArea ? `${lead.livingArea} m²` : "";
  const rooms = lead.rooms ? `${lead.rooms} Zimmer` : "";
  const city = lead.city ?? "";
  const price = lead.priceExpectation
    ? lead.priceExpectation.toLocaleString("de-DE", { style: "currency", currency: "EUR" })
    : "";
  const condition = lead.condition ? CONDITION_LABELS[lead.condition] ?? "" : "";
  const yearBuilt = lead.yearBuilt ? `Baujahr ${lead.yearBuilt}` : "";
  const featureList = features.length > 0 ? features.join(" · ") : "";

  if (style === "premium") {
    return [
      `🏠 **${type} in ${city}${area ? ` – ${area}` : ""}**`,
      "",
      `${rooms ? rooms + " · " : ""}${area}${condition ? ` · ${condition}` : ""}${yearBuilt ? ` · ${yearBuilt}` : ""}`,
      "",
      featureList ? `✅ Ausstattung: ${featureList}` : "",
      "",
      price ? `💶 Kaufpreis: **${price}**` : "",
      "",
      "📞 Jetzt unverbindlich anfragen – wir freuen uns auf Ihre Kontaktaufnahme!",
    ].filter(Boolean).join("\n");
  }

  if (style === "social") {
    return [
      `🏡 ${type} in ${city} zu verkaufen!`,
      `${rooms ? rooms + " | " : ""}${area}${condition ? ` | ${condition}` : ""}`,
      featureList ? `✔️ ${featureList}` : "",
      price ? `💰 ${price}` : "",
      "",
      "👉 Interesse? Jetzt anfragen!",
      "#Immobilien #${city} #Immobilieverkaufen #PalaImmobilien",
    ].filter(Boolean).join("\n");
  }

  // whatsapp
  return [
    `*${type} in ${city}*`,
    `${area ? `📐 ${area}` : ""}${rooms ? ` | 🛏 ${rooms}` : ""}`,
    featureList ? `✅ ${featureList}` : "",
    price ? `💶 ${price}` : "",
    "",
    "Interesse? Schreiben Sie uns! 👇",
  ].filter(Boolean).join("\n");
}

export function TabInserat({ lead }: Props) {
  const { toast } = useToast();
  const [style, setStyle] = useState<Style>("premium");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(
    (lead.features ?? []).filter((f: any) => f.enabled).map((f: any) => f.label)
  );

  const text = generateInserat(lead, style, selectedFeatures);

  function toggleFeature(label: string) {
    setSelectedFeatures((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  }

  function copy(content: string) {
    navigator.clipboard.writeText(content);
    toast({ title: "In Zwischenablage kopiert" });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Style auswählen */}
      <div className="flex gap-3">
        {(["premium", "social", "whatsapp"] as Style[]).map((s) => (
          <button
            key={s}
            onClick={() => setStyle(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              style === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
            }`}
          >
            {s === "premium" ? "Premium" : s === "social" ? "Social Media" : "WhatsApp"}
          </button>
        ))}
      </div>

      {/* Features auswählen */}
      {lead.features?.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium mb-2 text-gray-700">Merkmale im Inserat</p>
          <div className="grid grid-cols-2 gap-2">
            {lead.features.filter((f: any) => f.enabled).map((f: any) => (
              <div key={f.featureKey} className="flex items-center gap-2">
                <Checkbox
                  id={`ins-${f.featureKey}`}
                  checked={selectedFeatures.includes(f.label)}
                  onCheckedChange={() => toggleFeature(f.label)}
                />
                <label htmlFor={`ins-${f.featureKey}`} className="text-sm cursor-pointer">{f.label}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vorschau */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" /> Inserat-Vorschau
          </span>
          <Button size="sm" variant="outline" onClick={() => copy(text)}>
            <Copy className="h-4 w-4" /> Kopieren
          </Button>
        </div>
        <pre className="text-sm whitespace-pre-wrap text-gray-800 bg-gray-50 rounded-lg p-3 font-sans">{text}</pre>
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => copy(text)}>
          <Copy className="h-4 w-4" /> mobile.de
        </Button>
        <Button variant="outline" size="sm" onClick={() => copy(text)}>
          <Copy className="h-4 w-4" /> AutoScout24
        </Button>
        <Button variant="outline" size="sm" onClick={() => copy(text)}>
          <Copy className="h-4 w-4" /> Social Media
        </Button>
      </div>
    </div>
  );
}
