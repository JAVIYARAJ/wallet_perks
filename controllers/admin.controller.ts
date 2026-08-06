import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Controller for Admin Operations (Business Applications Review & Management)
 */
export class AdminController {
  /**
   * Helper to get Supabase client
   */
  private static getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project-id')) {
      return null
    }

    return createSupabaseClient(supabaseUrl, supabaseServiceKey)
  }

  /**
   * GET /api/admin/businesses
   * Fetch all business applications with filtering & sorting
   */
  static async getBusinesses(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const statusFilter = searchParams.get('status') || 'all'
      const sortOrder = searchParams.get('sort') || 'desc' // 'desc' | 'asc'
      const searchQuery = searchParams.get('search') || ''

      const supabase = this.getSupabaseClient()

      if (!supabase) {
        // Fallback demo dataset if Supabase is not configured
        return NextResponse.json({
          success: true,
          businesses: [
            {
              id: 'demo-1',
              business_name: 'Northstar Coffee',
              legal_name: 'Northstar Coffee LLC',
              owner_name: 'Jordan Davis',
              email: 'coffee@northstar.co',
              phone: '+1 (555) 234-5678',
              industry: 'Coffee & Food',
              website: 'northstar.co',
              address: '742 Evergreen Terrace, Portland, OR',
              status: 'pending',
              created_at: new Date().toISOString(),
            },
            {
              id: 'demo-2',
              business_name: 'Morrow Goods',
              legal_name: 'Morrow Retail Corp',
              owner_name: 'Maya Chen',
              email: 'hello@morrowgoods.co',
              phone: '+1 (555) 876-5432',
              industry: 'Retail & Goods',
              website: 'morrowgoods.co',
              address: '100 Market St, San Francisco, CA',
              status: 'approved',
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
        })
      }

      let query = supabase.from('businesses').select('*')

      // Apply status filter if not 'all'
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      // Apply text search
      if (searchQuery) {
        query = query.or(`business_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,owner_name.ilike.%${searchQuery}%`)
      }

      // Apply sorting
      query = query.order('created_at', { ascending: sortOrder === 'asc' })

      const { data, error } = await query

      if (error) {
        console.error('Postgres Query Error on businesses:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        businesses: data || [],
      })
    } catch (error: any) {
      console.error('Failed to get admin businesses:', error)
      return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 })
    }
  }

  /**
   * PATCH /api/admin/businesses
   * Update a business application status ('approved' | 'rejected' | 'pending')
   */
  static async updateBusinessStatus(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const { id, status, rejection_reason } = body

      if (!id || !status) {
        return NextResponse.json({ error: 'Business ID and status are required.' }, { status: 400 })
      }

      if (!['approved', 'pending', 'rejected'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status. Must be approved, pending, or rejected.' }, { status: 400 })
      }

      const supabase = this.getSupabaseClient()

      if (!supabase) {
        // Trigger simulated/live Brevo email even in prototype mode
        try {
          const { sendEmailWithBrevo, buildMerchantApprovalEmailHtml, buildMerchantRejectionEmailHtml } = await import('@/lib/brevo-email')
          if (status === 'approved') {
            const html = buildMerchantApprovalEmailHtml({
              ownerName: 'Merchant Owner',
              businessName: 'Your Business',
            })
            await sendEmailWithBrevo({
              toEmail: 'merchant@northstar.co',
              toName: 'Merchant Owner',
              subject: `[WalletPerks] Congratulations! Your business has been Approved 🎉`,
              htmlContent: html,
            })
          } else if (status === 'rejected') {
            const html = buildMerchantRejectionEmailHtml({
              ownerName: 'Merchant Owner',
              businessName: 'Your Business',
              rejectionReason: rejection_reason || 'Application does not meet platform criteria.',
            })
            await sendEmailWithBrevo({
              toEmail: 'merchant@northstar.co',
              toName: 'Merchant Owner',
              subject: `[WalletPerks] Application Status Update - Business Application`,
              htmlContent: html,
            })
          }
        } catch (e) {
          console.error('Brevo status email error in prototype mode:', e)
        }

        return NextResponse.json({
          success: true,
          message: `Business status updated to ${status} (Prototype mode).`,
        })
      }

      // 1. Update business status and rejection_reason
      const updatePayload: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'rejected') {
        updatePayload.rejection_reason = rejection_reason || 'Application does not meet platform criteria.'
      } else {
        updatePayload.rejection_reason = null
      }

      const { data: updatedBiz, error: bizError } = await supabase
        .from('businesses')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

      if (bizError) {
        console.error('Error updating business status:', bizError.message)
        return NextResponse.json({ error: bizError.message }, { status: 500 })
      }

      // 2. If approved, update owner profile role to merchant
      if (status === 'approved' && updatedBiz?.owner_id) {
        await supabase
          .from('profiles')
          .update({ role: 'merchant', business_id: id })
          .eq('id', updatedBiz.owner_id)
      }

      // 3. Send email notification via Brevo to business owner on status change
      if (updatedBiz && updatedBiz.email) {
        try {
          const { sendEmailWithBrevo, buildMerchantApprovalEmailHtml, buildMerchantRejectionEmailHtml } = await import('@/lib/brevo-email')
          
          if (status === 'approved') {
            const html = buildMerchantApprovalEmailHtml({
              ownerName: updatedBiz.owner_name || 'Merchant Owner',
              businessName: updatedBiz.business_name || 'Business',
            })
            await sendEmailWithBrevo({
              toEmail: updatedBiz.email,
              toName: updatedBiz.owner_name || 'Merchant Owner',
              subject: `[WalletPerks] Congratulations! ${updatedBiz.business_name || 'Your business'} has been Approved 🎉`,
              htmlContent: html,
            })
          } else if (status === 'rejected') {
            const html = buildMerchantRejectionEmailHtml({
              ownerName: updatedBiz.owner_name || 'Merchant Owner',
              businessName: updatedBiz.business_name || 'Business',
              rejectionReason: updatedBiz.rejection_reason || rejection_reason,
            })
            await sendEmailWithBrevo({
              toEmail: updatedBiz.email,
              toName: updatedBiz.owner_name || 'Merchant Owner',
              subject: `[WalletPerks] Application Status Update - ${updatedBiz.business_name || 'Business Application'}`,
              htmlContent: html,
            })
          }
        } catch (emailErr) {
          console.error('Failed to dispatch status update email via Brevo:', emailErr)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Business status successfully updated to ${status}.`,
        business: updatedBiz,
      })
    } catch (error: any) {
      console.error('Failed to update business status:', error)
      return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 })
    }
  }

  /**
   * GET /api/admin/users
   * Fetch all user profiles with role filter, search, and business information
   */
  static async getUsers(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const roleFilter = searchParams.get('role') || 'all' // 'all' | 'admin' | 'merchant' | 'customer'
      const sortOrder = searchParams.get('sort') || 'desc'
      const searchQuery = searchParams.get('search') || ''

      const supabase = this.getSupabaseClient()

      if (!supabase) {
        return NextResponse.json({
          success: true,
          users: [
            {
              id: 'usr-1',
              email: 'walletadmin@mailinator.com',
              full_name: 'Wallet Admin',
              phone: '+1 555-0100',
              role: 'admin',
              created_at: new Date().toISOString(),
            },
            {
              id: 'usr-2',
              email: 'merchant@northstar.co',
              full_name: 'Jordan Davis',
              phone: '+1 555-0199',
              role: 'merchant',
              business_name: 'Northstar Coffee',
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
        })
      }

      let query = supabase.from('profiles').select('*')

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter)
      }

      if (searchQuery) {
        query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
      }

      query = query.order('created_at', { ascending: sortOrder === 'asc' })

      const { data: profiles, error } = await query

      if (error) {
        console.error('Error fetching users/profiles:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Fetch all businesses to map store associations cleanly without PostgREST join ambiguity
      const { data: businesses } = await supabase.from('businesses').select('id, owner_id, business_name, status')

      const bizByOwner = new Map((businesses || []).map((b) => [b.owner_id, b]))
      const bizById = new Map((businesses || []).map((b) => [b.id, b]))

      // Map business_name cleanly
      const users = (profiles || []).map((u: any) => {
        const matchedBiz = (u.business_id && bizById.get(u.business_id)) || bizByOwner.get(u.id)
        return {
          ...u,
          business_name: matchedBiz?.business_name || null,
          business_status: matchedBiz?.status || null,
        }
      })

      return NextResponse.json({
        success: true,
        users,
      })
    } catch (error: any) {
      console.error('Failed to get admin users:', error)
      return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 })
    }
  }

  /**
   * PATCH /api/admin/users
   * Update a user profile role ('admin' | 'merchant' | 'customer')
   */
  static async updateUserRole(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json()
      const { id, role } = body

      if (!id || !role) {
        return NextResponse.json({ error: 'User ID and role are required.' }, { status: 400 })
      }

      if (!['admin', 'merchant', 'customer'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Must be admin, merchant, or customer.' }, { status: 400 })
      }

      const supabase = this.getSupabaseClient()

      if (!supabase) {
        return NextResponse.json({
          success: true,
          message: `User role updated to ${role} (Prototype mode).`,
        })
      }

      const { data: updatedUser, error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating user role:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `User role successfully updated to ${role}.`,
        user: updatedUser,
      })
    } catch (error: any) {
      console.error('Failed to update user role:', error)
      return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 })
    }
  }
}
