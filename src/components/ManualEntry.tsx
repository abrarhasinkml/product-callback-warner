"use client";

import { useState } from "react";
import { CheckResult } from "@/lib/types";

interface ManualEntryProps {
  onSubmit: (data: CheckResult) => void;
}

export default function ManualEntry({ onSubmit }: ManualEntryProps) {
  const [products, setProducts] = useState<
    Array<{ name: string; manufacturer: string; lot_number: string }>
  >([{ name: "", manufacturer: "", lot_number: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProduct = () => {
    setProducts([...products, { name: "", manufacturer: "", lot_number: "" }]);
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: string, value: string) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const validProducts = products.filter((p) => p.name.trim().length > 0);
      if (validProducts.length === 0) {
        throw new Error("Please enter at least one product name");
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: validProducts }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit products");
      }

      const data = await response.json();
      onSubmit({ products: data.products ?? [], matches: data.matches ?? [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {products.map((product, index) => (
        <div key={index} className="flex gap-2 items-start">
          <div className="flex-1 space-y-2">
            <input
              type="text"
              placeholder="Product name *"
              value={product.name}
              onChange={(e) => updateProduct(index, "name", e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Manufacturer (optional)"
              value={product.manufacturer}
              onChange={(e) =>
                updateProduct(index, "manufacturer", e.target.value)
              }
              className="w-full px-3 py-2 border rounded"
            />
            <input
              type="text"
              placeholder="Lot/Charge number (optional)"
              value={product.lot_number}
              onChange={(e) => updateProduct(index, "lot_number", e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          {products.length > 1 && (
            <button
              type="button"
              onClick={() => removeProduct(index)}
              className="px-3 py-2 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={addProduct}
          className="px-4 py-2 text-blue-600 hover:text-blue-800"
        >
          + Add Product
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Checking..." : "Check for Recalls"}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
