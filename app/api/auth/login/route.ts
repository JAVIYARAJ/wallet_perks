import { NextRequest, NextResponse } from 'next/server'
import { AuthController } from '@/controllers/auth.controller'

/**
 * POST /api/auth/login
 * Node backend route for user authentication & status resolution
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return AuthController.login(body)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid JSON request payload.' },
      { status: 400 }
    )
  }
}
