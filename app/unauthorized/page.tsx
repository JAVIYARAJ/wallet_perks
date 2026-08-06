'use client'

import React, { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ShieldAlert, ArrowLeft, Lock, KeyRound, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

function UnauthorizedContent() {
  const searchParams = useSearchParams()
  const requiredRole = searchParams.get('required') || 'admin'
  const currentRole = searchParams.get('current') || 'merchant'
  const requestedPath = searchParams.get('path') || '/admin'
  const customMessage = searchParams.get('message')

  return (
    <main className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 relative font-sans overflow-hidden">
      {/* Background Decorative Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Clean Card */}
      <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-xl shadow-indigo-100/40 z-10 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Shield Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-6 shadow-inner relative">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Permission Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-extrabold uppercase tracking-wider mb-3">
          <Lock className="w-3.5 h-3.5" /> Error 403 · Access Denied
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Permission Required
        </h1>

        <p className="text-slate-600 text-sm leading-relaxed max-w-sm mb-6">
          {customMessage || (
            <>
              You do not have the required role permissions to access{' '}
              <strong className="text-slate-900 font-mono font-bold">{requestedPath}</strong>.
            </>
          )}
        </p>

        {/* Security Audit Breakdown Box */}
        <div className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 text-xs flex flex-col gap-2 mb-8 text-left font-mono">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-500">Authorization Info</span>
            <span className="text-[10px] text-red-600 font-bold uppercase">Restricted</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Requested Path:</span>
            <strong className="text-slate-900 font-semibold truncate max-w-[200px]">{requestedPath}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Required Role:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold uppercase text-[10px]">
              {requiredRole}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Your Current Role:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold uppercase text-[10px]">
              {currentRole}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          {currentRole === 'merchant' ? (
            <Link href="/merchant-dashboard" className="w-full sm:w-1/2">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Merchant Portal
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard" className="w-full sm:w-1/2">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md transition-all cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Customer Portal
              </Button>
            </Link>
          )}

          <Link href="/login" className="w-full sm:w-1/2">
            <button className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-indigo-600" /> Switch Account
            </button>
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-[11px] text-slate-400 mt-8 text-center z-10 font-medium">
        WalletPerks Loyalty Platform · Security Authorization Guard
      </footer>
    </main>
  )
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50/70 text-slate-900 flex items-center justify-center p-4">
        <div className="text-xs font-semibold text-slate-500">Loading access verification...</div>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  )
}
