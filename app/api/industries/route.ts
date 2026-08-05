import { IndustryController } from '@/controllers/industry.controller'

/**
 * GET /api/industries
 * Node backend route for fetching supported business categories & industries
 */
export async function GET() {
  return IndustryController.getIndustries()
}
