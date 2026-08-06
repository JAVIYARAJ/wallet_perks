import { NextResponse } from 'next/server'

export type AddressSuggestion = {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
  city?: string
  state?: string
  pincode?: string
  distance?: number
}

/**
 * Controller for Address & Location Search using TomTom Search API & OpenStreetMap Nominatim API
 * (Supports proximity / nearest location bias and Reverse Geocoding - Zero Mock Data)
 */
export class AddressController {
  /**
   * Search address suggestions via TomTom Fuzzy Search or OpenStreetMap Nominatim API
   * with optional proximity bias (lat & lon) to rank nearby addresses first.
   */
  static async searchAddress(
    query: string,
    lat?: string | null,
    lon?: string | null
  ): Promise<NextResponse> {
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const apiKey = process.env.TOMTOM_API_KEY || process.env.GOOGLE_MAPS_API_KEY

    // 1. Try TomTom Search API if key is configured
    if (apiKey && !apiKey.includes('your-') && !apiKey.includes('here')) {
      try {
        let tomtomUrl = `https://api.tomtom.com/search/2/search/${encodeURIComponent(
          query
        )}.json?key=${apiKey}&typeahead=true&limit=10&language=en-US&countrySet=IN`

        if (lat && lon) {
          tomtomUrl += `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radius=100000`
        }

        const response = await fetch(tomtomUrl)

        if (response.ok) {
          const data = await response.json()
          let rawResults = data.results || []

          if (lat && lon) {
            rawResults = [...rawResults].sort((a, b) => (a.dist || 0) - (b.dist || 0))
          }

          const suggestions: AddressSuggestion[] = rawResults.slice(0, 7).map((item: any, index: number) => {
            const address = item.address || {}
            const poiName = item.poi?.name
            const mainText = poiName || address.streetName || address.freeformAddress || item.id
            const secondaryText = [
              address.municipalitySubdivision,
              address.municipality,
              address.countrySubdivision,
              address.postalCode,
              address.countryCodeISO3,
            ]
              .filter(Boolean)
              .join(', ')

            const fullAddress = address.freeformAddress || `${mainText}, ${secondaryText}`

            return {
              placeId: item.id || `tt-${index}`,
              description: fullAddress,
              mainText: mainText,
              secondaryText: secondaryText || fullAddress,
              city: address.municipality || address.municipalitySubdivision || '',
              state: address.countrySubdivision || address.countrySubdivisionName || '',
              pincode: address.postalCode || '',
              distance: item.dist,
            }
          })

          if (suggestions.length > 0) {
            return NextResponse.json({
              suggestions,
              provider: 'tomtom',
              hasLocationBias: Boolean(lat && lon),
            })
          }
        }
      } catch (error: any) {
        console.error('TomTom API Search Error:', error)
      }
    }

    // 2. Real-World Live Search via OpenStreetMap Nominatim API (No mock data)
    try {
      let nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&countrycodes=in&limit=7`
      if (lat && lon) {
        const minLon = Number(lon) - 1
        const maxLon = Number(lon) + 1
        const maxLat = Number(lat) + 1
        const minLat = Number(lat) - 1
        nomUrl += `&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=0`
      }

      const res = await fetch(nomUrl, {
        headers: {
          'User-Agent': 'WalletPerks/1.0 (contact@walletperks.com)',
        },
      })

      if (!res.ok) {
        return NextResponse.json({ suggestions: [] })
      }

      const data = await res.json()
      const suggestions: AddressSuggestion[] = (data || []).map((item: any, idx: number) => {
        const addr = item.address || {}
        const mainText = addr.amenity || addr.building || addr.road || addr.suburb || item.display_name.split(',')[0]
        const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || ''
        const state = addr.state || ''
        const pincode = addr.postcode || ''

        return {
          placeId: item.place_id ? String(item.place_id) : `osm-${idx}`,
          description: item.display_name,
          mainText: mainText,
          secondaryText: [addr.suburb, city, state, pincode, addr.country].filter(Boolean).join(', '),
          city,
          state,
          pincode,
        }
      })

      return NextResponse.json({
        suggestions,
        provider: 'openstreetmap-nominatim',
        hasLocationBias: Boolean(lat && lon),
      })
    } catch (error: any) {
      console.error('OpenStreetMap Nominatim search error:', error)
      return NextResponse.json({ suggestions: [] })
    }
  }

  /**
   * Reverse Geocode coordinates (lat & lon) to a human-readable street address
   */
  static async reverseGeocode(lat: string, lon: string): Promise<NextResponse> {
    if (!lat || !lon) {
      return NextResponse.json({ error: 'Missing lat or lon parameters' }, { status: 400 })
    }

    const apiKey = process.env.TOMTOM_API_KEY || process.env.GOOGLE_MAPS_API_KEY

    if (apiKey && !apiKey.includes('your-') && !apiKey.includes('here')) {
      try {
        const reverseUrl = `https://api.tomtom.com/search/2/reverseGeocode/${encodeURIComponent(
          lat
        )},${encodeURIComponent(lon)}.json?key=${apiKey}&language=en-US`

        const response = await fetch(reverseUrl)

        if (response.ok) {
          const data = await response.json()
          const addresses = data.addresses || []
          const firstMatch = addresses[0]?.address

          if (firstMatch) {
            const freeform = firstMatch.freeformAddress
            return NextResponse.json({
              address: freeform,
              city: firstMatch.municipality || '',
              state: firstMatch.countrySubdivision || '',
              pincode: firstMatch.postalCode || '',
              lat: Number(lat),
              lon: Number(lon),
              provider: 'tomtom',
            })
          }
        }
      } catch (err) {
        console.error('TomTom reverse geocode error:', err)
      }
    }

    // Real-World Live Reverse Geocode via OpenStreetMap Nominatim API (No mock data)
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
      const res = await fetch(nomUrl, {
        headers: {
          'User-Agent': 'WalletPerks/1.0 (contact@walletperks.com)',
        },
      })

      if (res.ok) {
        const data = await res.json()
        const addr = data.address || {}
        const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || ''
        const state = addr.state || ''
        const pincode = addr.postcode || ''

        return NextResponse.json({
          address: data.display_name || `${lat}, ${lon}`,
          city,
          state,
          pincode,
          lat: Number(lat),
          lon: Number(lon),
          provider: 'openstreetmap-nominatim',
        })
      }
    } catch (err) {
      console.error('OpenStreetMap Nominatim reverse geocode error:', err)
    }

    return NextResponse.json({
      address: `Coordinates (${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)})`,
      lat: Number(lat),
      lon: Number(lon),
      provider: 'coordinates',
    })
  }
}
