"use client";

import { useRef } from "react";
import type { AnkaufFormData } from "@/app/ankauf/page";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Upload, X, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  data: AnkaufFormData;
  update: (d: Partial<AnkaufFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SLOTS = [
  { key: "aussenansicht", label: "Außenansicht" },
  { key: "wohnzimmer", label: "Wohnzimmer" },
  { key: "kueche", label: "Küche" },
  { key: "schlafzimmer", label: "Schlafzimmer" },
  { key: "bad", label: "Bad" },
  { key: "grundriss", label: "Grundriss" },
  { key: "garten", label: "Garten / Außenbereich" },
  { key: "schaden", label: "Schäden / Mängel" },
];

export function StepPhotos({ data, update, onNext, onBack }: Props) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const hasMinPhotos = data.photos.length >= 4;

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.urls) {
        update({ photos: [...data.photos, ...json.urls] });
      }
    } catch {
      toast({ title: "Upload fehlgeschlagen", description: "Bitte erneut versuchen.", variant: "destructive" });
    }
  }

  function removePhoto(url: string) {
    update({ photos: data.photos.filter((p) => p !== url) });
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Fotos hochladen</h2>
        <p className="text-gray-500">Mehr Fotos = bessere Bewertung. Empfehlung: mindestens 6 Fotos</p>
      </div>

      {/* Upload Zone */}
      <div
        className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="font-medium text-gray-700">Fotos hochladen</p>
        <p className="text-sm text-gray-400 mt-1">Klicken oder Fotos hier hineinziehen</p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP – max. 10 MB pro Foto</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Fotovorschau */}
      {data.photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {data.photos.map((url, i) => (
            <div key={i} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(url)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empfohlene Slots */}
      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Empfohlene Aufnahmen</p>
        <div className="grid grid-cols-2 gap-2">
          {SLOTS.map((slot) => (
            <div key={slot.key} className="flex items-center gap-2 text-sm text-gray-600">
              <ImageIcon className="h-4 w-4 text-gray-400 shrink-0" />
              {slot.label}
            </div>
          ))}
        </div>
      </div>

      {!hasMinPhotos && data.photos.length > 0 && (
        <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
          Empfehlung: Mindestens 4 Fotos für eine genaue Bewertung.
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="h-4 w-4" /> Zurück
        </Button>
        <Button onClick={onNext} className="flex-1">
          {data.photos.length === 0 ? "Überspringen" : "Weiter"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
