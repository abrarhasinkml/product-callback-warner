import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { I18nProvider } from "@/lib/i18n/context";

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
