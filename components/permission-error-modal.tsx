'use client'

import React from 'react'
import { ShieldAlert, X, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface PermissionErrorDetail {
  error?: string
  message?: string
  code?: string
  details?: {
    path?: string
    requiredRole?: string
    currentRole?: string
    action?: string
  }
}

interface PermissionErrorModalProps {
  isOpen: boolean
  onClose: () => void
  errorDetail?: PermissionErrorDetail | null
}

export function PermissionErrorModal({
  isOpen,
  onClose,
  errorDetail,
}: PermissionErrorModalProps) {
  if (!isOpen) return null

  const requiredRole = errorDetail?.details?.requiredRole || 'admin'
  const currentRole = errorDetail?.details?.currentRole || 'merchant'
  const requestedPath = errorDetail?.details?.path || 'API Endpoint'
  const displayMessage =
    errorDetail?.message ||
    'Access Denied: You do not have the required administrative permissions to perform actions on this endpoint.'

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-red-600">
                <Lock className="w-3 h-3" /> Error 403 · Forbidden
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Permission Denied</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-4 text-xs">
          <p className="text-slate-600 leading-relaxed font-medium">
            {displayMessage}
          </p>

          {/* Breakdown Box */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 font-mono flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Target Endpoint:</span>
              <strong className="text-slate-900 truncate font-semibold max-w-[180px]">{requestedPath}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Required Role:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold uppercase text-[10px]">
                {requiredRole}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Your Current Role:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold uppercase text-[10px]">
                {currentRole}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] font-medium leading-relaxed">
            💡 <strong>Security Notice:</strong> Role access policies prevent unauthorized account modifications. Please contact your platform administrator if you require higher access privileges.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <Button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Acknowledge & Close
          </Button>
        </div>
      </div>
    </div>
  )
}
