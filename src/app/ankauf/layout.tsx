import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immobilie verkaufen – Pala Immobilien",
  description: "Kostenlose Immobilienbewertung und Ankauf durch Pala Immobilien",
};

export default function AnkaufLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {children}
    </div>
  );
}
