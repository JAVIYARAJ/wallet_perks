'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Check, X, Navigation, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapLocationPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (address: string, lat: number, lon: number) => void
  initialAddress?: string
}

export function MapLocationPicker({
  isOpen,
  onClose,
  onSelectLocation,
  initialAddress = '',
}: MapLocationPickerProps) {
  const [lat, setLat] = useState<number>(30.2672) // Default: Austin, TX
  const [lon, setLon] = useState<number>(-97.7431)
  const [addressText, setAddressText] = useState(initialAddress)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  // Try getting user's current GPS position when opening modal
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLat = pos.coords.latitude
          const newLon = pos.coords.longitude
          setLat(newLat)
          setLon(newLon)
          fetchAddressFromCoords(newLat, newLon)
          setIsLocating(false)
        },
        () => setIsLocating(false),
        { timeout: 6000 }
      )
    }
  }, [isOpen])

  // Initialize Native Leaflet Interactive Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return

    // Dynamically inject Leaflet CSS & JS if not already present
    const loadLeaflet = async () => {
      if (!(window as any).L) {
        // Load CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link')
          link.id = 'leaflet-css'
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          document.head.appendChild(link)
        }

        // Load JS
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

      // Clean up old instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // Initialize map
      const map = L.map(mapContainerRef.current).setView([lat, lon], 14)
      mapInstanceRef.current = map

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Create Draggable Marker
      const marker = L.marker([lat, lon], { draggable: true }).addTo(map)
      markerRef.current = marker

      // Click anywhere on map to move marker & select address
      map.on('click', (e: any) => {
        const clickedLat = Number(e.latlng.lat.toFixed(5))
        const clickedLon = Number(e.latlng.lng.toFixed(5))
        setLat(clickedLat)
        setLon(clickedLon)
        marker.setLatLng([clickedLat, clickedLon])
        fetchAddressFromCoords(clickedLat, clickedLon)
      })

      // Drag marker to adjust location
      marker.on('dragend', () => {
        const position = marker.getLatLng()
        const draggedLat = Number(position.lat.toFixed(5))
        const draggedLon = Number(position.lng.toFixed(5))
        setLat(draggedLat)
        setLon(draggedLon)
        fetchAddressFromCoords(draggedLat, draggedLon)
      })
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isOpen])

  // Update marker position when lat/lon change programmatically
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lon], mapInstanceRef.current.getZoom())
      markerRef.current.setLatLng([lat, lon])
    }
  }, [lat, lon])

  const fetchAddressFromCoords = async (latitude: number, longitude: number) => {
    setIsGeocoding(true)
    try {
      const res = await fetch(`/api/address/reverse?lat=${latitude}&lon=${longitude}`)
      const data = await res.json()
      if (data.address) {
        setAddressText(data.address)
      }
    } catch (e) {
      console.error('Failed to reverse geocode location:', e)
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleConfirm = () => {
    onSelectLocation(addressText || `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`, lat, lon)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Click Map to Select Location</h3>
              <p className="text-[11px] text-slate-500">Click anywhere on the map or drag the pin marker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Native Interactive Map Container */}
        <div className="relative w-full h-72 bg-slate-100 overflow-hidden">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
          
          {/* Hint Overlay */}
          <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg backdrop-blur-md shadow-md z-10 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Click map or drag pin to update
          </div>
        </div>

        {/* Selected Address Info Bar */}
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100">
            <div className="flex items-start gap-2.5 min-w-0">
              <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <small className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Selected Store Address</small>
                <p className="text-xs font-semibold text-slate-900 leading-snug truncate">
                  {isGeocoding ? (
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      <Loader2 className="w-3 h-3 animate-spin" /> Fetching address...
                    </span>
                  ) : (
                    addressText || `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
                  )}
                </p>
                <small className="text-[10px] text-slate-500 mt-0.5">
                  Lat: {lat.toFixed(5)} • Lon: {lon.toFixed(5)}
                </small>
              </div>
            </div>

            {isLocating && (
              <span className="flex items-center gap-1 text-[10px] text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 flex-shrink-0 font-medium">
                <Navigation className="w-3 h-3 animate-spin" /> Detecting GPS...
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isGeocoding}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5"
            >
              Use Selected Address <Check className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
