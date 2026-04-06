"use client";

import { useState } from "react";
import type { AnkaufFormData } from "@/app/ankauf/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Loader2, Shield } from "lucide-react";

interface Props {
  data: AnkaufFormData;
  update: (d: Partial<AnkaufFormData>) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

export function StepContact({ data, update, onSubmit, onBack, loading }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!data.customerName.trim()) e.customerName = "Name ist Pflicht";
    if (!data.customerPhone.trim()) e.customerPhone = "Telefonnummer ist Pflicht";
    if (!data.dsgvoAccepted) e.dsgvo = "Bitte stimmen Sie der Datenschutzerklärung zu";
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    await onSubmit();
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Ihre Kontaktdaten</h2>
        <p className="text-gray-500">Damit wir uns bei Ihnen melden können</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="customerName">Vollständiger Name *</Label>
          <Input
            id="customerName"
            placeholder="Vor- und Nachname"
            value={data.customerName}
            onChange={(e) => { update({ customerName: e.target.value }); setErrors((err) => ({ ...err, customerName: "" })); }}
            className={errors.customerName ? "border-red-400" : ""}
          />
          {errors.customerName && <p className="text-xs text-red-500">{errors.customerName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Telefonnummer *</Label>
          <Input
            id="customerPhone"
            type="tel"
            placeholder="+49 123 456789"
            value={data.customerPhone}
            onChange={(e) => { update({ customerPhone: e.target.value }); setErrors((err) => ({ ...err, customerPhone: "" })); }}
            className={errors.customerPhone ? "border-red-400" : ""}
          />
          {errors.customerPhone && <p className="text-xs text-red-500">{errors.customerPhone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">E-Mail-Adresse (optional)</Label>
          <Input
            id="customerEmail"
            type="email"
            placeholder="ihre@email.de"
            value={data.customerEmail}
            onChange={(e) => update({ customerEmail: e.target.value })}
          />
        </div>

        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
          <Checkbox
            id="whatsapp"
            checked={data.whatsappOptIn}
            onCheckedChange={(c) => update({ whatsappOptIn: !!c })}
            className="mt-0.5"
          />
          <div>
            <Label htmlFor="whatsapp" className="text-green-800 font-medium">WhatsApp-Benachrichtigung</Label>
            <p className="text-xs text-green-700 mt-0.5">
              Ich möchte Updates und Rückmeldungen per WhatsApp erhalten
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <Checkbox
              id="dsgvo"
              checked={data.dsgvoAccepted}
              onCheckedChange={(c) => { update({ dsgvoAccepted: !!c }); setErrors((err) => ({ ...err, dsgvo: "" })); }}
              className="mt-0.5"
            />
            <Label htmlFor="dsgvo" className="text-sm leading-relaxed">
              Ich stimme der{" "}
              <a href="/datenschutz" target="_blank" className="text-blue-600 underline">Datenschutzerklärung</a>
              {" "}zu und willige in die Verarbeitung meiner Daten für die Kontaktaufnahme ein. *
            </Label>
          </div>
          {errors.dsgvo && <p className="text-xs text-red-500">{errors.dsgvo}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
        <Shield className="h-4 w-4 text-gray-400 shrink-0" />
        Ihre Daten werden sicher übertragen und nur für die Kontaktaufnahme verwendet.
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={loading}>
          <ChevronLeft className="h-4 w-4" /> Zurück
        </Button>
        <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Anfrage absenden
        </Button>
      </div>
    </div>
  );
}
