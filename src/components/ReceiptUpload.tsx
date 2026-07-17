"use client";

import { useState } from "react";
import { CheckResult } from "@/lib/types";

interface ReceiptUploadProps {
  onUploadComplete: (data: CheckResult) => void;
}

export default function ReceiptUpload({ onUploadComplete }: ReceiptUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      const response = await fetch("/api/receipts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onUploadComplete({
        products: data.products ?? [],
        matches: data.matches ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="receipt-upload"
      />
      <label
        htmlFor="receipt-upload"
        className="cursor-pointer text-blue-600 hover:text-blue-800"
      >
        {isUploading ? "Processing..." : "Upload Receipt Image"}
      </label>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
