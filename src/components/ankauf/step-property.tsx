"use client";

import { useState } from "react";
import type { AnkaufFormData } from "@/app/ankauf/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PROPERTY_TYPE_OPTIONS, CONDITION_OPTIONS, ENERGY_CLASS_OPTIONS } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  data: AnkaufFormData;
  update: (d: Partial<AnkaufFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepProperty({ data, update, onNext, onBack }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!data.propertyType) e.propertyType = "Bitte Immobilienart wählen";
    if (!data.address.trim()) e.address = "Adresse ist Pflicht";
    if (!data.city.trim()) e.city = "Stadt ist Pflicht";
    if (!data.livingArea) e.livingArea = "Wohnfläche ist Pflicht";
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onNext();
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Angaben zum Objekt</h2>
        <p className="text-gray-500">Mit * markierte Felder sind Pflichtangaben</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Immobilienart */}
        <div className="space-y-2">
          <Label>Immobilienart *</Label>
          <Select value={data.propertyType} onValueChange={(v) => { update({ propertyType: v }); setErrors((e) => ({ ...e, propertyType: "" })); }}>
            <SelectTrigger className={errors.propertyType ? "border-red-400" : ""}>
              <SelectValue placeholder="Bitte wählen..." />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.propertyType && <p className="text-xs text-red-500">{errors.propertyType}</p>}
        </div>

        {/* Adresse */}
        <div className="space-y-2">
          <Label htmlFor="address">Straße und Hausnummer *</Label>
          <Input
            id="address"
            placeholder="z. B. Musterstraße 12"
            value={data.address}
            onChange={(e) => { update({ address: e.target.value }); setErrors((err) => ({ ...err, address: "" })); }}
            className={errors.address ? "border-red-400" : ""}
          />
          {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
        </div>

        {/* PLZ + Stadt */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="zip">PLZ</Label>
            <Input
              id="zip"
              placeholder="12345"
              value={data.zip}
              onChange={(e) => update({ zip: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Stadt *</Label>
            <Input
              id="city"
              placeholder="Stadt"
              value={data.city}
              onChange={(e) => { update({ city: e.target.value }); setErrors((err) => ({ ...err, city: "" })); }}
              className={errors.city ? "border-red-400" : ""}
            />
            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
          </div>
        </div>

        {/* Wohnfläche + Grundstücksfläche */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="livingArea">Wohnfläche (m²) *</Label>
            <Input
              id="livingArea"
              type="number"
              placeholder="z. B. 120"
              value={data.livingArea}
              onChange={(e) => { update({ livingArea: e.target.value }); setErrors((err) => ({ ...err, livingArea: "" })); }}
              className={errors.livingArea ? "border-red-400" : ""}
            />
            {errors.livingArea && <p className="text-xs text-red-500">{errors.livingArea}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="plotArea">Grundstücksfläche (m²)</Label>
            <Input
              id="plotArea"
              type="number"
              placeholder="z. B. 500"
              value={data.plotArea}
              onChange={(e) => update({ plotArea: e.target.value })}
            />
          </div>
        </div>

        {/* Zimmer + Badezimmer */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rooms">Zimmeranzahl</Label>
            <Input
              id="rooms"
              placeholder="z. B. 4 oder 3.5"
              value={data.rooms}
              onChange={(e) => update({ rooms: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Badezimmer</Label>
            <Input
              id="bathrooms"
              type="number"
              placeholder="z. B. 2"
              value={data.bathrooms}
              onChange={(e) => update({ bathrooms: e.target.value })}
            />
          </div>
        </div>

        {/* Baujahr + Etage */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yearBuilt">Baujahr</Label>
            <Input
              id="yearBuilt"
              placeholder="z. B. 1995"
              value={data.yearBuilt}
              onChange={(e) => update({ yearBuilt: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor">Etage</Label>
            <Input
              id="floor"
              type="number"
              placeholder="z. B. 2"
              value={data.floor}
              onChange={(e) => update({ floor: e.target.value })}
            />
          </div>
        </div>

        {/* Zustand + Energieklasse */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Zustand</Label>
            <Select value={data.condition} onValueChange={(v) => update({ condition: v })}>
              <SelectTrigger><SelectValue placeholder="Bitte wählen..." /></SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Energieklasse</Label>
            <Select value={data.energyClass} onValueChange={(v) => update({ energyClass: v })}>
              <SelectTrigger><SelectValue placeholder="Bitte wählen..." /></SelectTrigger>
              <SelectContent>
                {ENERGY_CLASS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Garage */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="hasGarage"
            checked={data.hasGarage}
            onCheckedChange={(c) => update({ hasGarage: !!c })}
          />
          <Label htmlFor="hasGarage">Garage / Stellplatz vorhanden</Label>
        </div>

        {/* Notizen */}
        <div className="space-y-2">
          <Label htmlFor="propertyNotes">Weitere Angaben zum Objekt</Label>
          <Textarea
            id="propertyNotes"
            placeholder="z. B. Besonderheiten, Renovierungen, Informationen zum Grundstück..."
            value={data.propertyNotes}
            onChange={(e) => update({ propertyNotes: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="h-4 w-4" /> Zurück
        </Button>
        <Button onClick={handleNext} className="flex-1">
          Weiter <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
