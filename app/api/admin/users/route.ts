import { NextRequest } from 'next/server'
import { AdminController } from '@/controllers/admin.controller'

export async function GET(request: NextRequest) {
  return AdminController.getUsers(request)
}

export async function PATCH(request: NextRequest) {
  return AdminController.updateUserRole(request)
}
