import { logger } from '@/lib/logger'
import { AgentError } from '@/lib/errors'
import { analysisCache } from '@/lib/cache'
import {
  mockCalls,
  mockDeals,
  mockReps,
  mockBenchmarks,
  mockFollowUps,
  mockBriefs,
  teamMetrics,
  type CallAnalysis,
  type Deal,
  type RepScorecard,
  type BenchmarkSegment,
  type FollowUp,
  type PreCallBrief,
} from '@/lib/demo'

export interface DashboardSnapshot {
  calls: CallAnalysis[]
  deals: Deal[]
  reps: RepScorecard[]
  benchmarks: BenchmarkSegment[]
  followUps: FollowUp[]
  briefs: PreCallBrief[]
  metrics: typeof teamMetrics
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const cacheKey = 'dashboard:v1'
  const cached = analysisCache.get(cacheKey) as DashboardSnapshot | undefined
  if (cached) {
    logger.debug('analyzer', 'Dashboard cache hit')
    return cached
  }

  logger.info('analyzer', 'Building dashboard snapshot from mock data')

  const snapshot: DashboardSnapshot = {
    calls: mockCalls,
    deals: mockDeals,
    reps: mockReps,
    benchmarks: mockBenchmarks,
    followUps: mockFollowUps,
    briefs: mockBriefs,
    metrics: teamMetrics,
  }

  analysisCache.set(cacheKey, snapshot, 60 * 1000)
  return snapshot
}

export interface AnalysisProgress {
  stage: string
  message: string
  progress: number
  data?: Partial<DashboardSnapshot>
}

export async function* analyzePipelineStream(): AsyncGenerator<AnalysisProgress> {
  logger.info('analyzer', 'Starting pipeline analysis stream')

  try {
    yield { stage: 'ingest', message: 'Ingesting call recordings from connected sources', progress: 10 }
    await delay(400)

    yield { stage: 'ingest', message: `Ingested ${mockCalls.length} calls in the last 7 days`, progress: 25, data: { calls: mockCalls } }
    await delay(400)

    yield { stage: 'analyze', message: 'Running sentiment and objection classification', progress: 40, data: { calls: mockCalls } }
    await delay(500)

    yield { stage: 'analyze', message: 'Identified 4 objection categories across active deals', progress: 55, data: { calls: mockCalls, deals: mockDeals } }
    await delay(400)

    yield { stage: 'enrich', message: 'Updating pipeline stages from call content', progress: 70, data: { deals: mockDeals } }
    await delay(400)

    yield { stage: 'enrich', message: 'Generating rep scorecards and coaching insights', progress: 85, data: { reps: mockReps } }
    await delay(400)

    const snapshot = await getDashboardSnapshot()
    yield { stage: 'complete', message: 'Analysis complete — dashboard refreshed', progress: 100, data: snapshot }

    logger.info('analyzer', 'Pipeline analysis stream complete')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    logger.error('analyzer', 'Analysis stream failed', { error: message })
    throw new AgentError('Pipeline analysis failed', 'analyze', err)
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getLossAutopsy(): { category: string; count: number; deals: Deal[] }[] {
  const lost = mockDeals.filter(d => d.stage === 'closed-lost')
  const grouped = new Map<string, Deal[]>()

  for (const deal of lost) {
    const category = deal.lastActivity?.includes('budget') ? 'budget'
      : deal.lastActivity?.includes('competition') ? 'competition'
      : deal.lastActivity?.includes('security') ? 'security'
      : deal.lastActivity?.includes('timing') ? 'timing'
      : 'other'

    if (!grouped.has(category)) grouped.set(category, [])
    grouped.get(category)!.push(deal)
  }

  return Array.from(grouped.entries())
    .map(([category, deals]) => ({ category, count: deals.length, deals }))
    .sort((a, b) => b.count - a.count)
}
