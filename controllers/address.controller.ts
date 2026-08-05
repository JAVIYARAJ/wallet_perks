import { NextResponse } from 'next/server'

export type AddressSuggestion = {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
  distance?: number
}

/**
 * Controller for Address & Location Search using TomTom Search API
 * (Supports proximity / nearest location bias and Reverse Geocoding)
 */
export class AddressController {
  /**
   * Search address suggestions via TomTom Fuzzy Search & Autocomplete API
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

    // Fallback: Smart Mock Suggestions if API key is not configured yet
    if (!apiKey || apiKey.includes('your-') || apiKey.includes('here')) {
      const mockSuggestions: AddressSuggestion[] = [
        {
          placeId: 'tomtom-mock-1',
          description: `${query} Main Street, Suite 100, New York, NY 10001`,
          mainText: `${query} Main Street (Nearby)`,
          secondaryText: 'Suite 100, New York, NY 10001, USA',
        },
        {
          placeId: 'tomtom-mock-2',
          description: `${query} Broadway Ave, San Francisco, CA 94102`,
          mainText: `${query} Broadway Ave`,
          secondaryText: 'San Francisco, CA 94102, USA',
        },
        {
          placeId: 'tomtom-mock-3',
          description: `${query} Commerce Way, Austin, TX 78701`,
          mainText: `${query} Commerce Way`,
          secondaryText: 'Austin, TX 78701, USA',
        },
      ]

      return NextResponse.json({
        suggestions: mockSuggestions,
        provider: 'tomtom-mock',
      })
    }

    try {
      let tomtomUrl = `https://api.tomtom.com/search/2/search/${encodeURIComponent(
        query
      )}.json?key=${apiKey}&typeahead=true&limit=7&language=en-US`

      if (lat && lon) {
        tomtomUrl += `&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&radius=100000`
      }

      const response = await fetch(tomtomUrl)

      if (!response.ok) {
        console.error('TomTom API HTTP Error:', response.status, response.statusText)
        return NextResponse.json(
          { error: `TomTom API Error: ${response.statusText}` },
          { status: response.status }
        )
      }

      const data = await response.json()

      const suggestions: AddressSuggestion[] = (data.results || []).map(
        (item: any, index: number) => {
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
            distance: item.dist,
          }
        }
      )

      return NextResponse.json({
        suggestions,
        provider: 'tomtom',
        hasLocationBias: Boolean(lat && lon),
      })
    } catch (error: any) {
      console.error('Failed to fetch address from TomTom Search API:', error)
      return NextResponse.json(
        { error: 'Internal server error while searching address with TomTom.' },
        { status: 500 }
      )
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

    // Fallback: Smart Mock Address if API key is not configured yet
    if (!apiKey || apiKey.includes('your-') || apiKey.includes('here')) {
      return NextResponse.json({
        address: `Selected Map Location (${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)}), Austin, TX`,
        lat: Number(lat),
        lon: Number(lon),
        provider: 'tomtom-mock',
      })
    }

    try {
      const reverseUrl = `https://api.tomtom.com/search/2/reverseGeocode/${encodeURIComponent(
        lat
      )},${encodeURIComponent(lon)}.json?key=${apiKey}&language=en-US`

      const response = await fetch(reverseUrl)

      if (!response.ok) {
        return NextResponse.json(
          { error: `TomTom Reverse Geocode Error: ${response.statusText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      const addresses = data.addresses || []

      if (addresses.length === 0) {
        return NextResponse.json({
          address: `Coordinates (${Number(lat).toFixed(4)}, ${Number(lon).toFixed(4)})`,
          lat: Number(lat),
          lon: Number(lon),
        })
      }

      const resultAddress = addresses[0].address?.freeformAddress || `Location (${lat}, ${lon})`

      return NextResponse.json({
        address: resultAddress,
        lat: Number(lat),
        lon: Number(lon),
        provider: 'tomtom',
      })
    } catch (error: any) {
      console.error('Failed to reverse geocode:', error)
      return NextResponse.json(
        { error: 'Internal server error while reverse geocoding coordinates.' },
        { status: 500 }
      )
    }
  }
}
