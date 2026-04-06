"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Steps
import { StepStart } from "@/components/ankauf/step-start";
import { StepProperty } from "@/components/ankauf/step-property";
import { StepPhotos } from "@/components/ankauf/step-photos";
import { StepPrice } from "@/components/ankauf/step-price";
import { StepContact } from "@/components/ankauf/step-contact";
import { StepProgress } from "@/components/ankauf/step-progress";

export type AnkaufFormData = {
  // Step 1
  source: "ankaufstation" | "besichtigung" | "website" | "other";
  intent: string;
  // Step 2
  propertyType: string;
  address: string;
  city: string;
  zip: string;
  yearBuilt: string;
  livingArea: string;
  plotArea: string;
  rooms: string;
  bathrooms: string;
  floor: string;
  totalFloors: string;
  condition: string;
  energyClass: string;
  hasGarage: boolean;
  propertyNotes: string;
  // Step 3
  photos: string[];
  // Step 4
  priceExpectation: string;
  sellTimeline: string;
  // Step 5
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  whatsappOptIn: boolean;
  dsgvoAccepted: boolean;
};

const defaultData: AnkaufFormData = {
  source: "ankaufstation",
  intent: "",
  propertyType: "",
  address: "",
  city: "",
  zip: "",
  yearBuilt: "",
  livingArea: "",
  plotArea: "",
  rooms: "",
  bathrooms: "",
  floor: "",
  totalFloors: "",
  condition: "",
  energyClass: "",
  hasGarage: false,
  propertyNotes: "",
  photos: [],
  priceExpectation: "",
  sellTimeline: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  whatsappOptIn: false,
  dsgvoAccepted: false,
};

const STEPS = ["Start", "Objekt", "Fotos", "Preis", "Kontakt"];

export default function AnkaufPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<AnkaufFormData>(defaultData);
  const [loading, setLoading] = useState(false);

  function update(partial: Partial<AnkaufFormData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    setLoading(true);
    try {
      const payload = {
        ...data,
        livingArea: data.livingArea ? Number(data.livingArea) : undefined,
        plotArea: data.plotArea ? Number(data.plotArea) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        floor: data.floor ? Number(data.floor) : undefined,
        totalFloors: data.totalFloors ? Number(data.totalFloors) : undefined,
        priceExpectation: data.priceExpectation ? Number(data.priceExpectation) : undefined,
      };

      const res = await fetch("/api/ankauf/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        router.push(`/ankauf/danke?ref=${json.refNumber}`);
      } else {
        toast({ title: "Fehler", description: "Bitte prüfen Sie Ihre Eingaben.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Fehler", description: "Verbindungsfehler. Bitte erneut versuchen.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Pala Immobilien</span>
          </div>
          <span className="text-sm text-gray-500">Kostenlos & unverbindlich</span>
        </div>
      </header>

      {/* Progress */}
      {step > 0 && (
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-2xl mx-auto">
            <StepProgress currentStep={step} steps={STEPS} />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {step === 0 && <StepStart data={data} update={update} onNext={next} />}
          {step === 1 && <StepProperty data={data} update={update} onNext={next} onBack={back} />}
          {step === 2 && <StepPhotos data={data} update={update} onNext={next} onBack={back} />}
          {step === 3 && <StepPrice data={data} update={update} onNext={next} onBack={back} />}
          {step === 4 && <StepContact data={data} update={update} onSubmit={submit} onBack={back} loading={loading} />}
        </div>
      </main>
    </div>
  );
}
