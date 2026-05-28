export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getDashboardSnapshot } from '@/lib/agent/analyzer'
import { logger } from '@/lib/logger'

export async function GET(_req: NextRequest) {
  try {
    const snapshot = await getDashboardSnapshot()
    logger.info('api', 'Dashboard snapshot served')
    return NextResponse.json(snapshot)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    logger.error('api', 'Dashboard snapshot failed', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
