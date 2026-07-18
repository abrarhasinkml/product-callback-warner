"use client";

import { useState, useRef } from "react";
import { CheckResult } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

interface ReceiptUploadProps {
  onUploadComplete: (data: CheckResult) => void;
}

export default function ReceiptUpload({
  onUploadComplete,
}: ReceiptUploadProps) {
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
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
        throw new Error(t.receiptError);
      }

      const data = await response.json();
      onUploadComplete({
        products: data.products ?? [],
        matches: data.matches ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.receiptError);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
        dragOver
          ? "border-amber-400 bg-amber-400/5"
          : "border-surface-600 hover:border-amber-500/50 hover:bg-surface-700/30"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="receipt-upload"
      />
      <div className="space-y-3">
        <div className="text-4xl opacity-50">&#x1F4F7;</div>
        {isUploading ? (
          <div className="space-y-2">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-400">{t.receiptProcessing}</p>
          </div>
        ) : (
          <>
            <p className="text-slate-300 font-medium">{t.receiptDrop}</p>
            <p className="text-xs text-slate-500">{t.receiptClick}</p>
          </>
        )}
      </div>
      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
    </div>
  );
}
