"use client";

import { useState, useRef } from "react";
import { CheckResult } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";
import { runClientOcr, OcrProgress } from "@/lib/ocr/client";

interface ReceiptUploadProps {
  onUploadComplete: (data: CheckResult) => void;
}

export default function ReceiptUpload({
  onUploadComplete,
}: ReceiptUploadProps) {
  const { t } = useI18n();
  const [isUploading, setIsUploading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    setOcrProgress(null);

    try {
      // Run OCR client-side first
      let ocrText = "";
      try {
        setOcrProgress({ status: "recognizing text", progress: 0 });
        const result = await runClientOcr(file, (progress) => {
          setOcrProgress(progress);
        });
        ocrText = result.text;
        setOcrProgress({ status: "complete", progress: 1 });
      } catch (ocrError) {
        console.error("Client OCR failed, sending without text:", ocrError);
        // Continue without OCR text — server will attempt fallback
      }

      // Send file + extracted text to API
      const formData = new FormData();
      formData.append("receipt", file);
      if (ocrText) {
        formData.append("text", ocrText);
      }

      setOcrProgress(null);

      const response = await fetch("/api/receipts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t.receiptError);
      }

      const data = await response.json();
      if (data.ocr_warning) {
        setError(data.ocr_warning);
      }
      onUploadComplete({
        products: data.products ?? [],
        matches: data.matches ?? [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.receiptError);
    } finally {
      setIsUploading(false);
      setOcrProgress(null);
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

  const getOcrStatusText = (): string => {
    if (!ocrProgress) return t.receiptProcessing;
    if (ocrProgress.status === "recognizing text") {
      return `Extracting text... ${Math.round(ocrProgress.progress * 100)}%`;
    }
    if (ocrProgress.status === "complete") return "Text extracted, checking products...";
    return ocrProgress.status;
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 sm:p-12 text-center cursor-pointer transition-all touch-manipulation touch-target ${
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
              <p className="text-sm text-slate-400">{getOcrStatusText()}</p>
              {ocrProgress && ocrProgress.progress > 0 && ocrProgress.progress < 1 && (
                <div className="w-48 h-1.5 bg-slate-700 rounded-full mx-auto overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${ocrProgress.progress * 100}%` }}
                  />
                </div>
              )}
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

      {/* Camera capture button - visible on mobile */}
      <div className="sm:hidden">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
          id="receipt-camera"
        />
        <label
          htmlFor="receipt-camera"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-surface-700 hover:bg-surface-600 rounded-xl text-slate-300 font-medium cursor-pointer transition-colors touch-target"
        >
          <span>&#x1F4F7;</span>
          <span>{t.receiptTakePhoto || "Take Photo"}</span>
        </label>
      </div>
    </div>
  );
}
