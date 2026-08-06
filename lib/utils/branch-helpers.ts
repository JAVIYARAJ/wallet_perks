export function extractLocationFromAddress(address: string): { city: string; state: string; pincode: string } {
  if (!address) return { city: '', state: '', pincode: '' }

  const pinMatch = address.match(/\b([0-9]{5,6})\b/)
  const pincode = pinMatch ? pinMatch[1] : ''

  const parts = address.split(',').map((p) => p.trim()).filter(Boolean)

  let city = ''
  let state = ''

  if (parts.length >= 3) {
    city = parts[parts.length - 3] || ''
    const statePart = parts[parts.length - 2] || ''
    state = statePart.replace(/[0-9]{5,6}/g, '').trim()
  } else if (parts.length === 2) {
    city = parts[0]
    state = parts[1].replace(/[0-9]{5,6}/g, '').trim()
  }

  return { city, state, pincode }
}

export function generateBranchCode(branchName: string, existingBranches: any[] = []): string {
  if (!branchName || !branchName.trim()) return ''

  const clean = branchName.replace(/[^a-zA-Z0-9\s]/g, '').trim()
  const words = clean.split(/\s+/).filter(Boolean)

  let prefix = ''
  if (words.length >= 2) {
    prefix = words.map((w) => w[0]).join('').toUpperCase().slice(0, 4)
  } else if (words.length === 1) {
    prefix = words[0].slice(0, 3).toUpperCase()
  } else {
    prefix = 'BR'
  }

  if (prefix.length < 2) prefix = (prefix + 'X').toUpperCase()

  const existingCodes = new Set(existingBranches.map((b) => (b.branch_code || '').toUpperCase()))

  let code = ''
  let counter = 1
  do {
    const numStr = String(counter).padStart(2, '0')
    code = `${prefix}-${numStr}`
    counter++
  } while (existingCodes.has(code) && counter < 1000)

  return code
}
