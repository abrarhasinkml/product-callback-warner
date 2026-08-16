import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { I18nProvider } from "@/lib/i18n/context";
import { triggerIngestIfNeeded } from "@/lib/ingest/trigger";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Product Callback Warner",
  description:
    "Pr\u00fcfen Sie, ob Ihre gekauften Produkte zur\u00fcckgerufen wurden",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Trigger warning ingestion in the background when someone visits the website
  // This runs on the server and doesn't block the page load
  triggerIngestIfNeeded();

  return (
    <html lang="de" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <I18nProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
