import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function DankeContent({ searchParams }: { searchParams: Record<string, string> }) {
  const ref = searchParams.ref ?? "–";
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vielen Dank!</h1>
          <p className="text-gray-600">
            Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze bei Ihnen.
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 text-left">
          <div className="text-sm text-gray-500 mb-1">Ihre Vorgangsnummer</div>
          <div className="text-xl font-bold text-blue-700 font-mono">{ref}</div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
            <Phone className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="text-sm text-gray-600">Wir melden uns innerhalb von 60 Minuten telefonisch</div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
            <MessageCircle className="h-5 w-5 text-green-600 shrink-0" />
            <div className="text-sm text-gray-600">Sie erhalten eine WhatsApp-Bestätigung (sofern angegeben)</div>
          </div>
        </div>
        <Link href="/ankauf">
          <Button variant="outline" className="w-full">Weitere Immobilie anfragen</Button>
        </Link>
      </div>
    </div>
  );
}

export default async function DankePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  return (
    <Suspense>
      <DankeContent searchParams={params} />
    </Suspense>
  );
}
