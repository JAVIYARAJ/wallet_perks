import { NextRequest } from 'next/server'
import { AddressController } from '@/controllers/address.controller'

/**
 * GET /api/address/search?q=address_query&lat=30.2672&lon=-97.7431
 * Node backend route for address search with optional nearest-location bias
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  return AddressController.searchAddress(query, lat, lon)
}
