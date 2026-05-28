export interface BenchmarkSegment {
  segment: string
  showRate: number
  contractRate: number
  avgSalesCycle: number
  avgDealSize: number
  winRate: number
}

export const mockBenchmarks: BenchmarkSegment[] = [
  { segment: 'SaaS — SMB', showRate: 72, contractRate: 18, avgSalesCycle: 21, avgDealSize: 18000, winRate: 22 },
  { segment: 'SaaS — Mid-Market', showRate: 68, contractRate: 24, avgSalesCycle: 45, avgDealSize: 65000, winRate: 28 },
  { segment: 'SaaS — Enterprise', showRate: 62, contractRate: 31, avgSalesCycle: 84, avgDealSize: 210000, winRate: 35 },
  { segment: 'Fintech', showRate: 65, contractRate: 22, avgSalesCycle: 56, avgDealSize: 95000, winRate: 26 },
  { segment: 'HealthTech', showRate: 58, contractRate: 19, avgSalesCycle: 72, avgDealSize: 78000, winRate: 21 },
  { segment: 'DevTools / API', showRate: 74, contractRate: 28, avgSalesCycle: 35, avgDealSize: 42000, winRate: 31 },
  { segment: 'E-commerce', showRate: 70, contractRate: 15, avgSalesCycle: 18, avgDealSize: 14000, winRate: 18 },
  { segment: 'AI / ML Infrastructure', showRate: 66, contractRate: 26, avgSalesCycle: 48, avgDealSize: 120000, winRate: 29 },
]

export const teamMetrics = {
  showRate: 68,
  contractRate: 24,
  avgSalesCycle: 42,
  avgDealSize: 89000,
  winRate: 28,
  callsAnalyzed: 236,
  dealsClosed: 18,
  pipelineValue: 2310000,
}
