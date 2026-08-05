import { NextRequest, NextResponse } from 'next/server'
import { BusinessController } from '@/controllers/business.controller'

/**
 * POST /api/business/register
 * Node backend endpoint for merchant registration & business creation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return BusinessController.registerBusiness(body)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid JSON request payload.' },
      { status: 400 }
    )
  }
}
