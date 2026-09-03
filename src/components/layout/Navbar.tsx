"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { lang, t, toggleLang } = useI18n();
  const { data: session } = useSession();

  const navLinks = [
    { href: "/", label: t.navHome },
    { href: "/warnings", label: t.navWarnings },
  ];

  return (
    <nav className="bg-surface-800 border-b border-surface-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="warning">
              &#x26A0;
            </span>
            <span className="text-amber-400 font-bold text-xl tracking-tight">
              CallbackWarner
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-surface-700 text-amber-400"
                      : "text-slate-400 hover:text-slate-100 hover:bg-surface-700/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="px-3 py-2 rounded-lg text-xs font-medium border border-surface-600 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors touch-target"
              aria-label="Toggle language"
            >
              {lang === "de" ? "EN" : "DE"}
            </button>

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-surface-700 transition-colors touch-target"
                >
                  <span className="hidden sm:inline">{session.user?.name || session.user?.email}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface-800 border border-surface-700 rounded-lg shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-surface-700"
                    >
                      {t.navProfile}
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-surface-700"
                    >
                      {t.navLogout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors touch-target"
              >
                {t.navLogin}
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-surface-700 touch-target"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-surface-700">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors touch-target ${
                    isActive
                      ? "bg-surface-700 text-amber-400"
                      : "text-slate-400 hover:text-slate-100 hover:bg-surface-700/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {session ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-surface-700/50 transition-colors touch-target"
                >
                  {t.navProfile}
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-surface-700/50 transition-colors touch-target"
                >
                  {t.navLogout}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors touch-target"
              >
                {t.navLogin}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
