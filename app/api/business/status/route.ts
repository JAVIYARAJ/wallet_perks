import { NextRequest, NextResponse } from 'next/server'
import { BusinessController } from '@/controllers/business.controller'

/**
 * GET /api/business/status?email=owner@example.com
 * GET /api/business/status?id=user_uuid
 * Node backend route for checking business application approval status
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email') || searchParams.get('id') || ''

  if (!email) {
    return NextResponse.json(
      { error: 'Missing required query parameter: email or id' },
      { status: 400 }
    )
  }

  return BusinessController.getBusinessStatus(email)
}
