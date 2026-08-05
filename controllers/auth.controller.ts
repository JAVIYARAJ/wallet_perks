import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export type LoginPayload = {
  email: string
  password?: string
}

/**
 * Controller for Authentication & Login API
 */
export class AuthController {
  /**
   * Login user with email & password, returning session & business status
   */
  static async login(payload: LoginPayload): Promise<NextResponse> {
    const { email, password } = payload

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@loyalty.local'

    // Admin shortcut / prototype mode when Supabase is not fully configured
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
      const isAdmin = email.toLowerCase() === adminEmail.toLowerCase()
      return NextResponse.json({
        success: true,
        user: { email, role: isAdmin ? 'admin' : 'merchant' },
        business: isAdmin ? null : { status: 'pending', businessName: 'Prototype Store' },
        message: 'Logged in (Prototype Mode)',
      })
    }

    try {
      const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

      // 1. Authenticate with Supabase Auth if password is provided
      let userData: any = null
      let sessionData: any = null

      if (password) {
        const { data: authResult, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          console.error('Supabase Login Error:', authError.message)
          return NextResponse.json({ error: authError.message }, { status: 401 })
        }

        userData = authResult.user
        sessionData = authResult.session
      }

      // 2. Query profile for role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .maybeSingle()

      const userRole = profile?.role || (email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'customer')
      const isAdmin = userRole === 'admin'

      // 3. Fetch business application status for this user
      let business: any = null
      if (!isAdmin) {
        const { data: bizData } = await supabase
          .from('businesses')
          .select('*')
          .or(`email.eq.${email},owner_id.eq.${userData?.id || ''}`)
          .order('created_at', { ascending: false })
          .limit(1)

        business = bizData && bizData.length > 0 ? bizData[0] : null
      }

      return NextResponse.json({
        success: true,
        user: {
          id: userData?.id,
          email: userData?.email || email,
          fullName: userData?.user_metadata?.full_name || '',
          role: userRole,
          isAdmin: isAdmin,
        },
        session: sessionData,
        business: business
          ? {
              id: business.id,
              businessName: business.business_name,
              legalName: business.legal_name,
              ownerName: business.owner_name,
              email: business.email,
              address: business.address,
              status: business.status, // 'pending' | 'approved' | 'rejected'
            }
          : null,
      })
    } catch (error: any) {
      console.error('Failed to login:', error)
      return NextResponse.json(
        { error: error.message || 'Internal server error logging in.' },
        { status: 500 }
      )
    }
  }
}
