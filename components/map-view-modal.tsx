'use client'

import { useEffect, useRef } from 'react'
import { MapPin, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapViewModalProps {
  isOpen: boolean
  onClose: () => void
  businessName: string
  address: string
  latitude?: number | null
  longitude?: number | null
}

export function MapViewModal({
  isOpen,
  onClose,
  businessName,
  address,
  latitude,
  longitude,
}: MapViewModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  // Default fallback center (Austin, TX) if lat/lon missing
  const defaultLat = 30.2672
  const defaultLon = -97.7431

  const activeLat = latitude ?? defaultLat
  const activeLon = longitude ?? defaultLon

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return

    const loadLeaflet = async () => {
      if (!(window as any).L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        await new Promise((resolve) => {
          if (document.getElementById('leaflet-js')) {
            return resolve(true)
          }
          const script = document.createElement('script')
          script.id = 'leaflet-js'
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = () => resolve(true)
          document.body.appendChild(script)
        })
      }

      const L = (window as any).L
      if (!L || !mapContainerRef.current) return

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      const map = L.map(mapContainerRef.current).setView([activeLat, activeLon], 15)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Create Custom Popup Marker
      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding: 4px;">
          <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${businessName}</strong>
          <span style="font-size: 11px; color: #64748b;">${address}</span>
        </div>
      `

      L.marker([activeLat, activeLon])
        .addTo(map)
        .bindPopup(popupContent)
        .openPopup()
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isOpen, activeLat, activeLon, businessName, address])

  if (!isOpen) return null

  // Google Maps external direction link
  const googleMapsUrl = latitude && longitude
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{businessName} Location</h3>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs">{address}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Display Container */}
        <div className="relative w-full h-80 bg-slate-100 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="text-xs">
            {latitude && longitude ? (
              <span className="text-slate-500 font-medium">
                Geocode: <strong className="font-mono text-slate-800">{latitude.toFixed(5)}, {longitude.toFixed(5)}</strong>
              </span>
            ) : (
              <span className="text-amber-600 text-[11px] font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Approximated location from address
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition-colors"
            >
              Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button
              onClick={onClose}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
