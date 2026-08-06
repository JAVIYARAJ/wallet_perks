import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export type RegisterBusinessPayload = {
  businessName: string
  legalName?: string
  ownerName: string
  email: string
  password?: string
  phone?: string
  industry: string
  website?: string
  address: string
  latitude?: number | null
  longitude?: number | null
  lat?: number | null
  lon?: number | null
  description: string
  gstin?: string
  pan?: string
}

/**
 * Controller for Merchant & Business Application Registration & Status Checks
 */
export class BusinessController {
  /**
   * Register new merchant user and insert business profile with coordinates into Supabase Postgres (public.businesses)
   */
  static async registerBusiness(payload: RegisterBusinessPayload): Promise<NextResponse> {
    const {
      businessName,
      legalName,
      ownerName,
      email,
      password,
      phone,
      industry,
      website,
      address,
      latitude,
      longitude,
      lat,
      lon,
      description,
      gstin,
      pan,
    } = payload

    // 1. Validation
    if (!businessName || !ownerName || !email || !address || !industry) {
      return NextResponse.json(
        { error: 'Missing required business registration fields.' },
        { status: 400 }
      )
    }

    const finalLat = latitude ?? lat ?? null
    const finalLon = longitude ?? lon ?? null

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Fallback response if Supabase credentials are placeholders
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
      console.log('Supabase env credentials placeholder - running in prototype mode for business registration:', businessName, { finalLat, finalLon })
      return NextResponse.json({
        success: true,
        message: 'Business application submitted successfully (Prototype Mode)',
        businessId: 'proto-biz-123',
        status: 'pending',
        lat: finalLat,
        lon: finalLon,
      })
    }

    try {
      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey || supabaseAnonKey)

      let ownerId: string | null = null

      // 2. Sign up user account with Supabase Auth if password provided
      if (password && password.length >= 8) {
        console.log('Signing up merchant user with Supabase Auth:', email)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: ownerName,
              phone: phone || '',
              role: 'merchant',
            },
          },
        })

        if (authError) {
          console.error('Supabase Auth SignUp Error:', authError.message)
          return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        ownerId = authData.user?.id || null
      }

      // 3. Insert Business record with coordinates into public.businesses table in Postgres
      console.log('Inserting business record with coordinates into public.businesses:', businessName, { finalLat, finalLon })
      const { data: businessData, error: bizError } = await supabase
        .from('businesses')
        .insert({
          owner_id: ownerId,
          business_name: businessName,
          legal_name: legalName || businessName,
          owner_name: ownerName,
          email: email,
          phone: phone || null,
          industry: industry,
          website: website || null,
          address: address,
          latitude: finalLat,
          longitude: finalLon,
          description: description || null,
          gstin: gstin ? gstin.trim().toUpperCase() : null,
          pan: pan ? pan.trim().toUpperCase() : null,
          status: 'pending',
        })
        .select('id, status')
        .single()

      if (bizError) {
        console.error('Postgres Insert Error on public.businesses:', bizError.message)
        return NextResponse.json(
          { error: `Database Error: ${bizError.message}` },
          { status: 500 }
        )
      }

      const businessId = businessData?.id

      // 4. Create primary main branch in public.business_branches table
      if (businessId) {
        try {
          await supabase.from('business_branches').insert({
            business_id: businessId,
            branch_name: `${businessName} (Main HQ)`,
            branch_code: 'HQ-01',
            address: address,
            phone: phone || null,
            email: email,
            latitude: finalLat,
            longitude: finalLon,
            is_main_branch: true,
            is_active: true,
          })
        } catch (branchErr) {
          console.error('Failed to create main branch record:', branchErr)
        }
      }

      // 5. Update profile with business_id if ownerId is available
      if (ownerId && businessId) {
        await supabase
          .from('profiles')
          .update({
            business_id: businessId,
            role: 'merchant',
            phone: phone || null,
          })
          .eq('id', ownerId)
      }

      // 5. Send Merchant Application Under Review email via Brevo
      try {
        const { sendEmailWithBrevo, buildMerchantRegistrationEmailHtml } = await import('@/lib/brevo-email')
        const emailHtml = buildMerchantRegistrationEmailHtml({
          ownerName,
          businessName,
          legalName,
          industry,
          address,
          email,
          phone,
          gstin,
          pan,
        })
        await sendEmailWithBrevo({
          toEmail: email,
          toName: ownerName,
          subject: `[WalletPerks] Application Received - ${businessName} is Under Review`,
          htmlContent: emailHtml,
        })
      } catch (emailErr) {
        console.error('Failed to dispatch Brevo merchant registration email:', emailErr)
      }

      return NextResponse.json({
        success: true,
        message: 'Business application submitted for review.',
        businessId: businessId,
        status: businessData?.status || 'pending',
      })
    } catch (error: any) {
      console.error('Failed to register business:', error)
      return NextResponse.json(
        { error: error.message || 'Internal server error registering business.' },
        { status: 500 }
      )
    }
  }

  /**
   * Get Business Application Status & Info by Email or User ID
   */
  static async getBusinessStatus(emailOrUserId: string): Promise<NextResponse> {
    if (!emailOrUserId) {
      return NextResponse.json({ error: 'Missing email or user ID' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@loyalty.local'
    const isAdminEmail = emailOrUserId.toLowerCase() === adminEmail.toLowerCase()

    // Fallback if environment variables are placeholder
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
      if (isAdminEmail) {
        return NextResponse.json({
          hasBusiness: false,
          role: 'admin',
          isAdmin: true,
          status: 'admin',
        })
      }
      return NextResponse.json({
        hasBusiness: true,
        status: 'pending',
        role: 'merchant',
        business: {
          id: 'proto-biz-123',
          businessName: 'Prototype Coffee Spot',
          ownerName: 'Merchant Owner',
          email: emailOrUserId,
          status: 'pending',
        },
      })
    }

    try {
      const supabase = createSupabaseClient(supabaseUrl, serviceRoleKey || supabaseAnonKey)

      // 1. Check if user profile has role = 'admin' or email matches admin
      let profileData: { role: string } | null = null

      const { data: pByEmail } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', emailOrUserId)
        .maybeSingle()

      if (pByEmail) {
        profileData = pByEmail
      } else if (emailOrUserId.includes('-')) {
        const { data: pById } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', emailOrUserId)
          .maybeSingle()
        profileData = pById
      }

      const userRole = profileData?.role || (isAdminEmail ? 'admin' : 'customer')

      if (userRole === 'admin' || isAdminEmail) {
        return NextResponse.json({
          hasBusiness: false,
          role: 'admin',
          isAdmin: true,
          status: 'admin',
        })
      }

      // 2. Query business by email or owner_id
      let bizData: any[] | null = null
      let bizError: any = null

      const { data: bByEmail, error: errEmail } = await supabase
        .from('businesses')
        .select('*')
        .eq('email', emailOrUserId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (errEmail) {
        console.error('Error querying business by email:', errEmail.message)
      }

      if (bByEmail && bByEmail.length > 0) {
        bizData = bByEmail
      } else {
        const { data: bById, error: errId } = await supabase
          .from('businesses')
          .select('*')
          .eq('owner_id', emailOrUserId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (errId) bizError = errId
        if (bById && bById.length > 0) {
          bizData = bById
        }
      }

      if (bizError) {
        console.error('Error fetching business status:', bizError.message)
        return NextResponse.json({ error: bizError.message }, { status: 500 })
      }

      if (!bizData || bizData.length === 0) {
        return NextResponse.json({
          hasBusiness: false,
          role: userRole,
          status: 'none',
          message: 'No registered business found for this account.',
        })
      }

      const biz = bizData[0]

      return NextResponse.json({
        hasBusiness: true,
        status: biz.status || 'pending', // 'pending' | 'approved' | 'rejected'
        business: {
          id: biz.id,
          businessName: biz.business_name,
          legalName: biz.legal_name,
          ownerName: biz.owner_name,
          email: biz.email,
          phone: biz.phone,
          industry: biz.industry,
          address: biz.address,
          latitude: biz.latitude,
          longitude: biz.longitude,
          status: biz.status,
          rejectionReason: biz.rejection_reason,
          gstin: biz.gstin,
          pan: biz.pan,
          createdAt: biz.created_at,
        },
      })
    } catch (error: any) {
      console.error('Failed to get business status:', error)
      return NextResponse.json(
        { error: 'Internal server error checking business status.' },
        { status: 500 }
      )
    }
  }

  /**
   * Update operational business profile information for approved merchants
   */
  static async updateBusinessProfile(payload: {
    email: string
    businessName?: string
    ownerName?: string
    phone?: string
    industry?: string
    website?: string
    address?: string
    description?: string
    latitude?: number
    longitude?: number
  }): Promise<NextResponse> {
    const { email, businessName, ownerName, phone, industry, website, address, description, latitude, longitude } = payload

    if (!email) {
      return NextResponse.json({ error: 'Merchant email is required.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const supabaseKey = serviceRoleKey || supabaseAnonKey
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ success: true, message: 'Updated profile in prototype mode.' })
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

    const updateFields: Record<string, any> = {}
    if (businessName !== undefined) updateFields.business_name = businessName
    if (ownerName !== undefined) updateFields.owner_name = ownerName
    if (phone !== undefined) updateFields.phone = phone
    if (industry !== undefined) updateFields.industry = industry
    if (website !== undefined) updateFields.website = website
    if (address !== undefined) updateFields.address = address
    if (description !== undefined) updateFields.description = description
    if (latitude !== undefined) updateFields.latitude = latitude
    if (longitude !== undefined) updateFields.longitude = longitude

    const { data, error } = await supabase
      .from('businesses')
      .update(updateFields)
      .eq('email', email)
      .select('*')
      .single()

    if (error) {
      console.error('Failed to update business profile:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Business profile updated successfully.',
      business: data,
    })
  }

  /**
   * GET /api/businesses/approved
   * Fetch all approved registered businesses with optional industry filter
   */
  static async getApprovedBusinesses(request?: Request): Promise<NextResponse> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const supabaseKey = serviceRoleKey || supabaseAnonKey

      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
        return NextResponse.json({
          success: true,
          count: 0,
          businesses: [],
        })
      }

      const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

      let query = supabase
        .from('businesses')
        .select('id, business_name, legal_name, owner_name, email, phone, industry, website, address, description, latitude, longitude, created_at, status')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (request) {
        const { searchParams } = new URL(request.url)
        const industry = searchParams.get('industry')
        if (industry && industry !== 'all') {
          query = query.ilike('industry', `%${industry}%`)
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Failed to fetch approved businesses:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Format DB column names to camelCase response
      const formatted = (data || []).map((biz) => ({
        id: biz.id,
        businessName: biz.business_name,
        legalName: biz.legal_name,
        ownerName: biz.owner_name,
        email: biz.email,
        phone: biz.phone,
        industry: biz.industry,
        website: biz.website,
        address: biz.address,
        description: biz.description,
        latitude: biz.latitude,
        longitude: biz.longitude,
        createdAt: biz.created_at,
        status: biz.status,
      }))

      return NextResponse.json({
        success: true,
        count: formatted.length,
        businesses: formatted,
      })
    } catch (error: any) {
      console.error('Error fetching approved businesses:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
