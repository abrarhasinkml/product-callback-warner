import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Callback Warner",
  description: "Check if your purchased products have been recalled",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
