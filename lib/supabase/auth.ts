import { createClient } from '@/lib/supabase/client'

export type UserRole = 'merchant' | 'customer' | 'admin'

/**
 * Register a new user (Merchant or Mobile Customer) with Supabase Auth.
 * The Postgres trigger on_auth_user_created will automatically create 
 * the matching row in public.profiles with the specified role.
 */
export async function signUpUser({
  email,
  password,
  fullName,
  role = 'customer',
}: {
  email: string
  password: string
  fullName: string
  role?: UserRole
}) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role, // 'merchant' for coffee shop owners, 'customer' for mobile app users
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign in existing user with email and password
 */
export async function signInUser({
  email,
  password,
}: {
  email: string
  password: string
}) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get current authenticated user session
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Get current user profile (including role) from public.profiles
 */
export async function getCurrentUserProfile() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return profile
}
