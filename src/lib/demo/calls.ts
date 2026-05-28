export interface CallAnalysis {
  id: string
  title: string
  duration: number
  sentiment: 'positive' | 'neutral' | 'negative'
  stage: 'discovery' | 'demo' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  objection: string | null
  objectionCategory: string | null
  nextSteps: string
  dealValue: number | null
  repName: string
  transcript: string
  talkRatio: { rep: number; prospect: number }
  createdAt: string
}

export const mockCalls: CallAnalysis[] = [
  {
    id: 'call-1',
    title: 'Acme Corp — Discovery Call',
    duration: 1845,
    sentiment: 'positive',
    stage: 'discovery',
    objection: null,
    objectionCategory: null,
    nextSteps: 'Schedule demo with VP Engineering next Tuesday',
    dealValue: 48000,
    repName: 'Sarah Chen',
    transcript:
      "Sarah: Thanks for taking the time, Alex. I'd love to understand how your team handles pipeline visibility today.\n\nAlex: Honestly, it's a mess. We have calls in Gong, notes in Salesforce, and follow-ups in Slack. Nothing talks to each other.\n\nSarah: That fragmentation is exactly what we solve. Our agent reads every call, updates the CRM automatically, and drafts follow-ups before you leave the room.\n\nAlex: Wait — it drafts follow-ups automatically? From the call content?\n\nSarah: Yes. It extracts commitments, next steps, and even surfaces the objection patterns that stall your deals. Would it help to see a live example?\n\nAlex: Absolutely. Let's book a demo.",
    talkRatio: { rep: 42, prospect: 58 },
    createdAt: '2026-05-27T09:00:00Z',
  },
  {
    id: 'call-2',
    title: 'Vertex Labs — Demo Call',
    duration: 2340,
    sentiment: 'neutral',
    stage: 'demo',
    objection: 'Pricing is 40% higher than our current stack.',
    objectionCategory: 'budget',
    nextSteps: 'Send ROI calculator and schedule follow-up with CFO',
    dealValue: 120000,
    repName: 'Marcus Johnson',
    transcript:
      "Marcus: Let's walk through how the coaching surface works. Every rep gets a scorecard based on real call data — not manager gut feel.\n\nJordan: I like the benchmarking. Can we segment by role? Our SDRs and closers need different scorecards.\n\nMarcus: Exactly. You get per-position views: intro callers, SDRs, and closers. Each with their own benchmarks.\n\nJordan: This looks solid. My concern is pricing. You're quoting $999 per seat. Our current stack runs about $600.\n\nMarcus: Understood. What you're paying for today is three separate tools — recorder, CRM automation, and coaching. We replace all three. Most teams see a 30% reduction in total stack cost. I can send you an ROI calculator that breaks it down by line item.\n\nJordan: That would help. Loop in our CFO when you send it.",
    talkRatio: { rep: 55, prospect: 45 },
    createdAt: '2026-05-26T14:30:00Z',
  },
  {
    id: 'call-3',
    title: 'Nebula Systems — Proposal Review',
    duration: 1560,
    sentiment: 'positive',
    stage: 'proposal',
    objection: null,
    objectionCategory: null,
    nextSteps: 'Legal review of DPA, target close by June 15',
    dealValue: 85000,
    repName: 'Sarah Chen',
    transcript:
      "Sarah: I wanted to check in on the proposal we sent last week. Any questions from the team?\n\nPriya: Actually, we've been impressed. The pre-call brief alone saved our reps about two hours last week.\n\nSarah: That's great to hear. The brief pulls from prior call analysis — so there's no extra AI cost per render. It just surfaces what's already been computed.\n\nPriya: Smart. Legal is reviewing the DPA now. If that's clean, we're looking at a June 15 start date.\n\nSarah: Perfect. I'll have our team prep the onboarding deck.",
    talkRatio: { rep: 38, prospect: 62 },
    createdAt: '2026-05-25T11:00:00Z',
  },
  {
    id: 'call-4',
    title: 'Orbital Data — Negotiation',
    duration: 1920,
    sentiment: 'negative',
    stage: 'negotiation',
    objection: 'Need SOC 2 certification before we can sign.',
    objectionCategory: 'security',
    nextSteps: 'Share SOC 2 Type II report and schedule security review',
    dealValue: 210000,
    repName: 'David Park',
    transcript:
      "David: I know we're in the final stretch. What's blocking the signature?\n\nRachel: Security team flagged that you don't have SOC 2 yet. We're a financial services company — that's non-negotiable.\n\nDavid: Completely understand. We're actually in audit right now. SOC 2 Type II is expected by end of Q3. In the meantime, we can offer a BAU with enhanced logging and your own isolated Supabase region.\n\nRachel: That might work. Can we schedule a security review call with your team?\n\nDavid: Absolutely. I'll have our security lead reach out today.",
    talkRatio: { rep: 48, prospect: 52 },
    createdAt: '2026-05-24T16:00:00Z',
  },
  {
    id: 'call-5',
    title: 'Pulse Health — Discovery',
    duration: 1260,
    sentiment: 'neutral',
    stage: 'discovery',
    objection: 'We already have Gong for call recording.',
    objectionCategory: 'competition',
    nextSteps: 'Position as Gong complement, not replacement. Schedule product walkthrough.',
    dealValue: 65000,
    repName: 'Aisha Patel',
    transcript:
      "Aisha: I saw you're using Gong for call recording. That's a great foundation.\n\nChris: Yeah, we've had it for two years. It records and transcribes, but the follow-up work is still manual.\n\nAisha: Exactly the gap we fill. We plug into Gong — read the transcripts — and then do the work: update Salesforce, draft follow-ups, brief the next meeting. Gong captures. We execute.\n\nChris: So you don't replace Gong?\n\nAisha: We enhance it. Think of us as the action layer on top of the capture layer.\n\nChris: That's a different pitch. I'm open to seeing it.",
    talkRatio: { rep: 45, prospect: 55 },
    createdAt: '2026-05-23T10:00:00Z',
  },
  {
    id: 'call-6',
    title: 'Kinetic AI — Closed Won',
    duration: 900,
    sentiment: 'positive',
    stage: 'closed-won',
    objection: null,
    objectionCategory: null,
    nextSteps: 'Kickoff call scheduled for June 2',
    dealValue: 156000,
    repName: 'Marcus Johnson',
    transcript:
      "Marcus: Hey Ryan — wanted to personally share that we're thrilled to have Kinetic AI on board.\n\nRyan: Same here. The auto-follow-up feature sold our CEO. He was tired of deals dying in the inbox.\n\nMarcus: That's our number one win story. The agent drafts, sends from your address, and pauses the moment a prospect replies. No more dead air.\n\nRyan: Let's kick off June 2. I want my team enabled before the quarter starts.\n\nMarcus: Already blocked on our calendar. See you then.",
    talkRatio: { rep: 50, prospect: 50 },
    createdAt: '2026-05-22T13:00:00Z',
  },
]

export const objectionCategories = [
  'budget',
  'authority',
  'need',
  'timing',
  'security',
  'competition',
  'integration',
] as const

export type ObjectionCategory = (typeof objectionCategories)[number]
