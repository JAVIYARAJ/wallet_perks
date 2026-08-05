import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export type IndustryItem = {
  id: string
  slug: string
  label: string
  iconName: string
  description?: string
  displayOrder: number
}

// Fallback seed industries if Supabase Postgres table is empty or offline
const FALLBACK_INDUSTRIES: IndustryItem[] = [
  { id: '1', slug: 'coffee-cafe', label: 'Coffee & Cafe', iconName: 'Coffee', description: 'Cafes, specialty coffee shops, and bakeries', displayOrder: 1 },
  { id: '2', slug: 'retail-boutique', label: 'Retail & Boutique', iconName: 'ShoppingBag', description: 'Clothing boutiques, gift shops, and specialty retail', displayOrder: 2 },
  { id: '3', slug: 'fitness-studio', label: 'Fitness & Studio', iconName: 'Dumbbell', description: 'Gyms, yoga studios, and fitness centers', displayOrder: 3 },
  { id: '4', slug: 'salon-spa', label: 'Salon & Spa', iconName: 'Scissors', description: 'Hair salons, barbershops, nail & day spas', displayOrder: 4 },
  { id: '5', slug: 'restaurant-bar', label: 'Restaurant & Bar', iconName: 'Utensils', description: 'Casual dining, bars, food trucks, and bistros', displayOrder: 5 },
]

/**
 * Controller for Business Categories & Supported Industries API
 */
export class IndustryController {
  /**
   * Fetch active business categories directly from Supabase Postgres database (public.industries)
   */
  static async getIndustries(): Promise<NextResponse> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Fallback if environment variables are placeholder
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
      return NextResponse.json({
        industries: FALLBACK_INDUSTRIES,
        source: 'fallback-seed (Missing Supabase env credentials)',
      })
    }

    try {
      // Connect to Supabase Postgres database directly on server
      const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

      console.log('Executing SQL SELECT query on database table: public.industries...')

      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Database query error on public.industries:', error.message)
        return NextResponse.json({
          industries: FALLBACK_INDUSTRIES,
          source: 'fallback-seed (Postgres Query Error)',
          error: error.message,
        })
      }

      if (!data || data.length === 0) {
        console.warn('Table public.industries exists but contains no rows yet.')
        return NextResponse.json({
          industries: FALLBACK_INDUSTRIES,
          source: 'fallback-seed (Empty DB Table)',
        })
      }

      // Format data retrieved directly from database table
      const formattedIndustries: IndustryItem[] = data.map((item: any) => ({
        id: item.id,
        slug: item.slug,
        label: item.label,
        iconName: item.icon_name,
        description: item.description,
        displayOrder: item.display_order,
      }))

      return NextResponse.json({
        industries: formattedIndustries,
        source: 'supabase-postgres-database',
        count: formattedIndustries.length,
      })
    } catch (error: any) {
      console.error('Failed to query public.industries from database:', error)
      return NextResponse.json({
        industries: FALLBACK_INDUSTRIES,
        source: 'fallback-error',
        error: error.message,
      })
    }
  }
}
