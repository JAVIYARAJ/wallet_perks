'use client'

import Link from 'next/link'
import { ArrowLeft, Compass, Home, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col items-center justify-center p-4 relative font-sans">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main 404 Glass Card */}
      <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-xl shadow-indigo-100/40 z-10 text-center flex flex-col items-center">
        {/* 404 Badge & Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-6 shadow-inner">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-extrabold uppercase tracking-wider mb-3">
          Error 404
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Page Not Found
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed max-w-sm mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The link might be broken or the page may have been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link href="/" className="w-full sm:w-1/2">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all">
              <Home className="w-4 h-4 mr-1.5" /> Back to Home
            </Button>
          </Link>

          <a
            href="mailto:support@loyalty.local?subject=Broken%20Link%20Report"
            className="w-full sm:w-1/2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" /> Contact Support
          </a>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-[11px] text-slate-400 mt-8 text-center z-10">
        WalletPerks Loyalty Platform
      </footer>
    </main>
  )
}
