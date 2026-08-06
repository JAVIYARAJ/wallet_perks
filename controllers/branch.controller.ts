import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Controller for Managing Business Branch Outlets (CRUD Operations)
 */
export class BranchController {
  private static getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseKey = serviceRoleKey || supabaseAnonKey

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Database environment variables are not configured.')
    }
    return createSupabaseClient(supabaseUrl, supabaseKey)
  }

  /**
   * GET: Fetch all store branches for a business (by businessId or email)
   */
  static async getBranches(businessId?: string | null, email?: string | null): Promise<NextResponse> {
    if (!businessId && !email) {
      return NextResponse.json({ error: 'businessId or email parameter is required' }, { status: 400 })
    }

    try {
      const supabase = this.getSupabaseClient()
      let targetBusinessId = businessId

      if (!targetBusinessId && email) {
        const { data: biz } = await supabase
          .from('businesses')
          .select('id')
          .eq('email', email)
          .single()

        if (biz?.id) {
          targetBusinessId = biz.id
        }
      }

      if (!targetBusinessId) {
        return NextResponse.json({ success: true, branches: [] })
      }

      const { data, error } = await supabase
        .from('business_branches')
        .select('*')
        .eq('business_id', targetBusinessId)
        .order('is_main_branch', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) throw error

      return NextResponse.json({
        success: true,
        branches: data || [],
      })
    } catch (error: any) {
      console.error('Error in BranchController.getBranches:', error)
      return NextResponse.json({ error: error.message || 'Failed to fetch branches' }, { status: 500 })
    }
  }

  /**
   * POST: Create a new store branch outlet
   */
  static async createBranch(body: any): Promise<NextResponse> {
    const {
      businessId,
      branchName,
      branchCode,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      latitude,
      longitude,
      managerName,
      managerPhone,
      isMainBranch,
    } = body

    if (!businessId || !branchName || !address) {
      return NextResponse.json(
        { error: 'businessId, branchName, and address are required' },
        { status: 400 }
      )
    }

    let finalBranchCode = branchCode ? String(branchCode).trim().toUpperCase() : null
    if (!finalBranchCode && branchName) {
      const clean = branchName.replace(/[^a-zA-Z0-9\s]/g, '').trim()
      const words = clean.split(/\s+/).filter(Boolean)
      const prefix = words.length >= 2
        ? words.map((w: string) => w[0]).join('').toUpperCase().slice(0, 4)
        : (words[0] || 'BR').slice(0, 3).toUpperCase()
      finalBranchCode = `${prefix}-${Math.floor(100 + Math.random() * 900)}`
    }

    try {
      const supabase = this.getSupabaseClient()
      const { data, error } = await supabase
        .from('business_branches')
        .insert({
          business_id: businessId,
          branch_name: branchName,
          branch_code: finalBranchCode,
          address,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          phone: phone || null,
          email: email || null,
          latitude: latitude || null,
          longitude: longitude || null,
          manager_name: managerName || null,
          manager_phone: managerPhone || null,
          is_main_branch: Boolean(isMainBranch),
          is_active: true,
        })
        .select('*')
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'New branch outlet created successfully.',
        branch: data,
      })
    } catch (error: any) {
      console.error('Error in BranchController.createBranch:', error)
      return NextResponse.json({ error: error.message || 'Failed to create branch' }, { status: 500 })
    }
  }

  /**
   * PUT: Update an existing store branch outlet
   */
  static async updateBranch(branchId: string, body: any): Promise<NextResponse> {
    if (!branchId) {
      return NextResponse.json({ error: 'branchId parameter is required' }, { status: 400 })
    }

    const {
      branchName,
      branchCode,
      address,
      city,
      state,
      pincode,
      phone,
      email,
      latitude,
      longitude,
      managerName,
      managerPhone,
      isMainBranch,
      isActive,
    } = body

    try {
      const supabase = this.getSupabaseClient()

      const updateData: Record<string, any> = {}
      if (branchName !== undefined) updateData.branch_name = branchName
      if (branchCode !== undefined) updateData.branch_code = branchCode
      if (address !== undefined) updateData.address = address
      if (city !== undefined) updateData.city = city
      if (state !== undefined) updateData.state = state
      if (pincode !== undefined) updateData.pincode = pincode
      if (phone !== undefined) updateData.phone = phone
      if (email !== undefined) updateData.email = email
      if (latitude !== undefined) updateData.latitude = latitude
      if (longitude !== undefined) updateData.longitude = longitude
      if (managerName !== undefined) updateData.manager_name = managerName
      if (managerPhone !== undefined) updateData.manager_phone = managerPhone
      if (isActive !== undefined) updateData.is_active = Boolean(isActive)

      // Handle changing Main HQ branch
      if (isMainBranch !== undefined && Boolean(isMainBranch) === true) {
        // Fetch current branch business_id
        const { data: currentBranch } = await supabase
          .from('business_branches')
          .select('business_id')
          .eq('id', branchId)
          .single()

        if (currentBranch?.business_id) {
          // Unset is_main_branch for all branches under this business
          await supabase
            .from('business_branches')
            .update({ is_main_branch: false })
            .eq('business_id', currentBranch.business_id)
        }
        updateData.is_main_branch = true
      } else if (isMainBranch !== undefined && Boolean(isMainBranch) === false) {
        updateData.is_main_branch = false
      }

      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('business_branches')
        .update(updateData)
        .eq('id', branchId)
        .select('*')
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Branch outlet updated successfully.',
        branch: data,
      })
    } catch (error: any) {
      console.error('Error in BranchController.updateBranch:', error)
      return NextResponse.json({ error: error.message || 'Failed to update branch' }, { status: 500 })
    }
  }

  /**
   * DELETE: Remove a store branch outlet (Prevents deleting Main HQ branch)
   */
  static async deleteBranch(branchId: string): Promise<NextResponse> {
    if (!branchId) {
      return NextResponse.json({ error: 'branchId parameter is required' }, { status: 400 })
    }

    try {
      const supabase = this.getSupabaseClient()

      // Check if branch is main HQ
      const { data: existingBranch } = await supabase
        .from('business_branches')
        .select('is_main_branch')
        .eq('id', branchId)
        .single()

      if (existingBranch?.is_main_branch) {
        return NextResponse.json(
          { error: 'Cannot delete the Main HQ branch outlet.' },
          { status: 400 }
        )
      }

      const { error } = await supabase
        .from('business_branches')
        .delete()
        .eq('id', branchId)

      if (error) throw error

      return NextResponse.json({
        success: true,
        message: 'Store branch outlet deleted successfully.',
      })
    } catch (error: any) {
      console.error('Error in BranchController.deleteBranch:', error)
      return NextResponse.json({ error: error.message || 'Failed to delete branch' }, { status: 500 })
    }
  }
}
