export interface PreCallBrief {
  id: string
  meetingTitle: string
  company: string
  contact: string
  scheduledAt: string
  repName: string
  lastCallSummary: string
  openCommitments: string[]
  recurringObjections: string[]
  winningPattern: string
  talkTimeRatio: { rep: number; prospect: number }
  dealValue: number
  stage: string
}

export const mockBriefs: PreCallBrief[] = [
  {
    id: 'brief-1',
    meetingTitle: 'Vertex Labs — CFO Follow-up',
    company: 'Vertex Labs',
    contact: 'Jordan Lee + CFO',
    scheduledAt: '2026-05-28T14:00:00Z',
    repName: 'Marcus Johnson',
    lastCallSummary:
      'Jordan liked the coaching surface and per-position scorecards. Main concern was pricing at $999/seat vs current $600. Marcus positioned as three-tool replacement with 30% total stack savings. Jordan requested ROI calculator for CFO.',
    openCommitments: ['Send ROI calculator', 'Schedule CFO call', 'Provide reference customers in similar vertical'],
    recurringObjections: ['Budget — pricing higher than current stack', 'Need SDR-specific scorecard view'],
    winningPattern:
      'Reference the 3-tool replacement angle. Teams that consolidate see 30% savings and eliminate integration maintenance.',
    talkTimeRatio: { rep: 55, prospect: 45 },
    dealValue: 120000,
    stage: 'demo',
  },
  {
    id: 'brief-2',
    meetingTitle: 'Orbital Data — Security Review',
    company: 'Orbital Data',
    contact: 'Rachel Kim + Security Team',
    scheduledAt: '2026-05-29T11:00:00Z',
    repName: 'David Park',
    lastCallSummary:
      'Deal stalled on SOC 2 requirement. Rachel is financial services — non-negotiable. David shared SOC 2 Type II timeline (Q3) and offered interim BAU with isolated Supabase region. Rachel agreed to security review call.',
    openCommitments: ['Schedule security review with James Liu', 'Share interim security architecture doc', 'Provide fintech customer references'],
    recurringObjections: ['Security — SOC 2 required', 'Data residency preferences'],
    winningPattern:
      'Lead with security posture, not product features. Two existing fintech customers under interim BAU. Emphasize audit trail and isolated regions.',
    talkTimeRatio: { rep: 48, prospect: 52 },
    dealValue: 210000,
    stage: 'negotiation',
  },
]
