"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";

export default function ProfilePage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
    }
  }, [session, status, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t.authUpdateError);
        return;
      }

      setSuccess(t.authUpdateSuccess);
    } catch {
      setError(t.authUpdateError);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      if (!response.ok) {
        setError(t.authDeleteError);
        return;
      }

      await signOut({ callbackUrl: "/" });
    } catch {
      setError(t.authDeleteError);
    }
  };

  if (status === "loading") {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-800 rounded w-48" />
          <div className="h-10 bg-surface-800 rounded" />
          <div className="h-10 bg-surface-800 rounded" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">{t.authProfile}</h1>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
            {t.authName}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-surface-700 border border-surface-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
            {t.authEmail}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-surface-700 border border-surface-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-emerald-400 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-amber-500 text-surface-900 rounded-lg font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? t.authUpdating : t.authUpdate}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-surface-700">
        <h2 className="text-lg font-semibold text-slate-100 mb-4">{t.authDangerZone}</h2>
        <button
          onClick={handleDelete}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            deleteConfirm
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-surface-700 text-red-400 hover:bg-surface-600"
          }`}
        >
          {deleteConfirm ? t.authConfirmDelete : t.authDeleteAccount}
        </button>
        {deleteConfirm && (
          <p className="mt-2 text-sm text-slate-400">{t.authDeleteWarning}</p>
        )}
      </div>
    </div>
  );
}
