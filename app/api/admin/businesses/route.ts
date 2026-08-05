import { NextRequest } from 'next/server'
import { AdminController } from '@/controllers/admin.controller'

/**
 * GET /api/admin/businesses
 * Fetch business applications with status filter & date sorting
 */
export async function GET(request: NextRequest) {
  return AdminController.getBusinesses(request)
}

/**
 * PATCH /api/admin/businesses
 * Update business application status ('approved' | 'rejected' | 'pending')
 */
export async function PATCH(request: NextRequest) {
  return AdminController.updateBusinessStatus(request)
}
