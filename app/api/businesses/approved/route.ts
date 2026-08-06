import { NextRequest } from 'next/server'
import { BusinessController } from '@/controllers/business.controller'

/**
 * GET /api/businesses/approved
 * Fetch all registered businesses that have been approved
 */
export async function GET(request: NextRequest) {
  return BusinessController.getApprovedBusinesses(request)
}
