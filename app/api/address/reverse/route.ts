import { NextRequest } from 'next/server'
import { AddressController } from '@/controllers/address.controller'

/**
 * GET /api/address/reverse?lat=30.2672&lon=-97.7431
 * Reverse geocode latitude and longitude coordinates to a street address
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get('lat') || ''
  const lon = searchParams.get('lon') || ''

  return AddressController.reverseGeocode(lat, lon)
}
