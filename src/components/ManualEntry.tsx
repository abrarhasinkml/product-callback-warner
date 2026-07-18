"use client";

import { useState } from "react";
import { CheckResult } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

interface ManualEntryProps {
  onSubmit: (data: CheckResult) => void;
}

export default function ManualEntry({ onSubmit }: ManualEntryProps) {
  const { t } = useI18n();
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
        throw new Error(t.errorMinProduct);
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: validProducts }),
      });

      if (!response.ok) {
        throw new Error(t.errorSubmit);
      }

      const data = await response.json();
      onSubmit({ products: data.products ?? [], matches: data.matches ?? [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {products.map((product, index) => (
        <div
          key={index}
          className="bg-surface-900/50 rounded-xl p-4 space-y-2 relative"
        >
          <input
            type="text"
            placeholder={t.productName}
            value={product.name}
            onChange={(e) => updateProduct(index, "name", e.target.value)}
            className="w-full px-3 py-2 bg-surface-700 border border-surface-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-sm"
            required
          />
          <input
            type="text"
            placeholder={t.manufacturer}
            value={product.manufacturer}
            onChange={(e) =>
              updateProduct(index, "manufacturer", e.target.value)
            }
            className="w-full px-3 py-2 bg-surface-700 border border-surface-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-sm"
          />
          <input
            type="text"
            placeholder={t.lotNumber}
            value={product.lot_number}
            onChange={(e) =>
              updateProduct(index, "lot_number", e.target.value)
            }
            className="w-full px-3 py-2 bg-surface-700 border border-surface-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-sm"
          />
          {products.length > 1 && (
            <button
              type="button"
              onClick={() => removeProduct(index)}
              className="absolute top-2 right-2 text-slate-500 hover:text-red-400 text-xs transition-colors"
            >
              {t.remove}
            </button>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addProduct}
          className="px-4 py-2 text-sm text-amber-400 hover:text-amber-300 border border-surface-600 rounded-lg hover:border-amber-500/30 transition-colors"
        >
          {t.addProduct}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-amber-500 text-surface-900 rounded-lg font-medium text-sm hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? t.submitChecking : t.submitCheck}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  );
}
