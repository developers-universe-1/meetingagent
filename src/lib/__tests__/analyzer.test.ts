import { getDashboardSnapshot, analyzePipelineStream, getLossAutopsy } from '@/lib/agent/analyzer'

describe('Analyzer', () => {
  it('returns a dashboard snapshot', async () => {
    const snapshot = await getDashboardSnapshot()
    expect(snapshot.calls).toBeDefined()
    expect(snapshot.calls.length).toBeGreaterThan(0)
    expect(snapshot.deals).toBeDefined()
    expect(snapshot.reps).toBeDefined()
    expect(snapshot.benchmarks).toBeDefined()
    expect(snapshot.followUps).toBeDefined()
    expect(snapshot.briefs).toBeDefined()
    expect(snapshot.metrics).toBeDefined()
  })

  it('streams analysis progress', async () => {
    const chunks: any[] = []
    for await (const chunk of analyzePipelineStream()) {
      chunks.push(chunk)
      if (chunk.stage === 'complete') break
    }
    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks[0].stage).toBe('ingest')
    expect(chunks[chunks.length - 1].stage).toBe('complete')
  })

  it('clusters lost deals by objection category', () => {
    const autopsy = getLossAutopsy()
    expect(Array.isArray(autopsy)).toBe(true)
    for (const entry of autopsy) {
      expect(entry.category).toBeDefined()
      expect(entry.count).toBeGreaterThan(0)
      expect(entry.deals.length).toBe(entry.count)
    }
  })
})
