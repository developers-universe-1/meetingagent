export interface RepScorecard {
  id: string
  name: string
  title: string
  callsHandled: number
  avgTalkRatio: number
  objectionRate: number
  closeRate: number
  avgDealSize: number
  pipelineValue: number
  score: number
  weeklyTrend: number[]
  strengths: string[]
  gaps: string[]
}

export const mockReps: RepScorecard[] = [
  {
    id: 'rep-1',
    name: 'Sarah Chen',
    title: 'Account Executive',
    callsHandled: 47,
    avgTalkRatio: 42,
    objectionRate: 18,
    closeRate: 28,
    avgDealSize: 92000,
    pipelineValue: 480000,
    score: 92,
    weeklyTrend: [84, 86, 87, 89, 90, 91, 92],
    strengths: ['Discovery questioning', 'Building rapport', 'Follow-up discipline'],
    gaps: ['Handling price objections', 'Multi-threading deals'],
  },
  {
    id: 'rep-2',
    name: 'Marcus Johnson',
    title: 'Senior AE',
    callsHandled: 62,
    avgTalkRatio: 55,
    objectionRate: 24,
    closeRate: 22,
    avgDealSize: 145000,
    pipelineValue: 620000,
    score: 88,
    weeklyTrend: [82, 83, 84, 85, 86, 87, 88],
    strengths: ['Product demo delivery', 'Technical depth', 'Executive presence'],
    gaps: ['Talks too much on calls', 'Letting prospects drive timing'],
  },
  {
    id: 'rep-3',
    name: 'David Park',
    title: 'Enterprise AE',
    callsHandled: 38,
    avgTalkRatio: 48,
    objectionRate: 32,
    closeRate: 35,
    avgDealSize: 210000,
    pipelineValue: 890000,
    score: 94,
    weeklyTrend: [88, 89, 90, 91, 92, 93, 94],
    strengths: ['Complex deal navigation', 'Security/compliance conversations', 'C-level engagement'],
    gaps: ['Speed to first meeting', 'SDR collaboration'],
  },
  {
    id: 'rep-4',
    name: 'Aisha Patel',
    title: 'SDR Team Lead',
    callsHandled: 89,
    avgTalkRatio: 35,
    objectionRate: 12,
    closeRate: 15,
    avgDealSize: 45000,
    pipelineValue: 320000,
    score: 85,
    weeklyTrend: [78, 79, 80, 81, 82, 83, 85],
    strengths: ['High activity volume', 'Consistent outbound', 'Objection handling'],
    gaps: ['Discovery depth', 'Closing asks', 'Talk ratio balance'],
  },
]
