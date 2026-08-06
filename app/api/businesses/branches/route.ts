import { NextRequest, NextResponse } from 'next/server'
import { BranchController } from '@/controllers/branch.controller'

/**
 * GET /api/businesses/branches?businessId=...
 * Fetch real database store branches for a specific business
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const businessId = searchParams.get('businessId') || ''
  const email = searchParams.get('email') || ''
  return BranchController.getBranches(businessId, email)
}

/**
 * POST /api/businesses/branches
 * Create a new store branch outlet in business_branches database table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return BranchController.createBranch(body)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invalid request body' }, { status: 400 })
  }
}

/**
 * PUT /api/businesses/branches?branchId=...
 * Update an existing store branch outlet
 */
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const body = await request.json()
    const branchId = searchParams.get('branchId') || body.branchId || body.id
    return BranchController.updateBranch(branchId, body)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invalid request body' }, { status: 400 })
  }
}

/**
 * DELETE /api/businesses/branches?branchId=...
 * Delete a store branch outlet
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const branchId = searchParams.get('branchId') || ''
  return BranchController.deleteBranch(branchId)
}
