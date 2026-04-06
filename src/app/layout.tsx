import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pala Ankaufstation + CRM",
  description: "Online Ankaufstation und CRM System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <body className={`${geist.className} h-full bg-gray-50 antialiased`}>
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
