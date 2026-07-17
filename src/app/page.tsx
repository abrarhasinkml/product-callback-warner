"use client";

import { useState } from "react";
import ReceiptUpload from "@/components/ReceiptUpload";
import ManualEntry from "@/components/ManualEntry";
import ResultsView from "@/components/ResultsView";
import { CheckResult, Match, Product } from "@/lib/types";

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [hasSearched, setHasSearched] = useState(false);

  const handleResults = (data: CheckResult) => {
    setProducts(data.products);
    setMatches(data.matches);
    setHasSearched(true);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Callback Warner
          </h1>
          <p className="text-gray-600">
            Check if your purchased products have been recalled
          </p>
        </header>

        {!hasSearched ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex border-b mb-6">
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "upload"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Upload Receipt
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "manual"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Enter Manually
              </button>
            </div>

            {activeTab === "upload" ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Upload a photo of your receipt. We&apos;ll extract the products
                  and check them against current recalls.
                </p>
                <ReceiptUpload onUploadComplete={handleResults} />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Enter the products you purchased manually.
                </p>
                <ManualEntry onSubmit={handleResults} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <button
              onClick={() => {
                setHasSearched(false);
                setMatches([]);
                setProducts([]);
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Check different products
            </button>
            <ResultsView matches={matches} products={products} />
          </div>
        )}
      </div>
    </main>
  );
}
