import { NextRequest, NextResponse } from 'next/server'
import { BranchController } from '@/controllers/branch.controller'

/**
 * PUT /api/businesses/branches/[branchId]
 * Update a specific store branch outlet by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const { branchId } = await params
    const body = await request.json()
    return BranchController.updateBranch(branchId, body)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invalid request body' }, { status: 400 })
  }
}

/**
 * DELETE /api/businesses/branches/[branchId]
 * Delete a specific store branch outlet by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  try {
    const { branchId } = await params
    return BranchController.deleteBranch(branchId)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 })
  }
}
