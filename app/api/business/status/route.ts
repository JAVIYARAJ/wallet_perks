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

/**
 * PATCH /api/business/status
 * Update operational merchant business profile details (Store Name, Phone, Address, Category, Website, Description)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    return BusinessController.updateBusinessProfile(body)
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
