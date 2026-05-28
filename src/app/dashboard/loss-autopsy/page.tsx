'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skull, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, DollarSign, Shield, Clock, Swords, HelpCircle } from 'lucide-react'
import StageBadge from '@/components/StageBadge'
import type { Deal } from '@/lib/demo'

interface AutopsyCluster {
  category: string
  count: number
  deals: Deal[]
}

const categoryMeta: Record<string, { label: string; icon: typeof AlertTriangle; color: string; bg: string; border: string; counterMoves: string[] }> = {
  budget: {
    label: 'Budget Constraints',
    icon: DollarSign,
    color: 'text-rose-400',
    bg: 'bg-rose-950/30',
    border: 'border-rose-900',
    counterMoves: [
      'Send ROI calculator with line-item consolidation',
      'Offer phased rollout to spread costs across quarters',
      'Introduce payment terms flexibility (NET-60 / quarterly billing)',
      'Schedule CFO-level business case review',
    ],
  },
  competition: {
    label: 'Competitive Loss',
    icon: Swords,
    color: 'text-amber-400',
    bg: 'bg-amber-950/30',
    border: 'border-amber-900',
    counterMoves: [
      'Deploy differentiation battlecard vs. top 2 competitors',
      'Arrange reference call with customer who switched from rival',
      'Quantify hidden costs of competitor (implementation, support)',
      'Escalate to product for feature-gap roadmap commitment',
    ],
  },
  security: {
    label: 'Security / Compliance',
    icon: Shield,
    color: 'text-sky-400',
    bg: 'bg-sky-950/30',
    border: 'border-sky-900',
    counterMoves: [
      'Share SOC 2 Type II report and pen-test summary',
      'Offer isolated tenant / dedicated VPC deployment',
      'Schedule joint security review with CISO office',
      'Provide BAU with enhanced audit logging and data residency',
    ],
  },
  timing: {
    label: 'Timing / Freeze',
    icon: Clock,
    color: 'text-violet-400',
    bg: 'bg-violet-950/30',
    border: 'border-violet-900',
    counterMoves: [
      'Propose pilot program with success metrics tied to next budget cycle',
      'Lock in current pricing with future-start clause',
      'Map initiative to board-level OKR to create urgency',
      'Offer executive sponsor program for high-priority re-opens',
    ],
  },
  other: {
    label: 'Other / Unspecified',
    icon: HelpCircle,
    color: 'text-zinc-400',
    bg: 'bg-zinc-800/30',
    border: 'border-zinc-700',
    counterMoves: [
      'Run deep-discovery call with new stakeholder map',
      'Request loss interview with champion for honest feedback',
      'Re-engage in 90 days with product update narrative',
      'Flag for marketing nurture sequence and event invite',
    ],
  },
}

export default function LossAutopsyPage() {
  const [clusters, setClusters] = useState<AutopsyCluster[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analyze')
      .then(r => r.json())
      .then(d => {
        const lost = d.deals.filter((deal: Deal) => deal.stage === 'closed-lost')
        const grouped = new Map<string, Deal[]>()
        for (const deal of lost) {
          const category = deal.lastActivity?.includes('budget') ? 'budget'
            : deal.lastActivity?.includes('competition') || deal.lastActivity?.includes('competitor') ? 'competition'
            : deal.lastActivity?.includes('security') || deal.lastActivity?.includes('audit') ? 'security'
            : deal.lastActivity?.includes('timing') || deal.lastActivity?.includes('freeze') ? 'timing'
            : 'other'
          if (!grouped.has(category)) grouped.set(category, [])
          grouped.get(category)!.push(deal)
        }
        const result = Array.from(grouped.entries())
          .map(([category, deals]) => ({ category, count: deals.length, deals }))
          .sort((a, b) => b.count - a.count)
        setClusters(result)
        setLoading(false)
      })
  }, [])

  const totalLostValue = clusters.reduce((sum, c) => sum + c.deals.reduce((s, d) => s + d.value, 0), 0)
  const totalLostDeals = clusters.reduce((sum, c) => sum + c.count, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Skull className="w-6 h-6 text-brand-500" />
          Loss Autopsy
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Clustered root-cause analysis behind every closed-lost deal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Deals Lost</span>
          <div className="text-2xl font-bold text-white mt-1">{totalLostDeals}</div>
          <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Lost Pipeline Value</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">${(totalLostValue / 1000).toFixed(0)}k</div>
          <p className="text-xs text-zinc-500 mt-1">Avg ${totalLostDeals > 0 ? (totalLostValue / totalLostDeals / 1000).toFixed(0) : 0}k per loss</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Top Killer</span>
          <div className="text-2xl font-bold text-white mt-1">{clusters[0]?.category ? categoryMeta[clusters[0].category]?.label : '—'}</div>
          <p className="text-xs text-zinc-500 mt-1">{clusters[0]?.count ?? 0} deals ({totalLostDeals > 0 ? Math.round((clusters[0]?.count / totalLostDeals) * 100) : 0}%)</p>
        </motion.div>
      </div>

      <div className="space-y-4">
        {clusters.map((cluster, i) => {
          const meta = categoryMeta[cluster.category] || categoryMeta.other
          const Icon = meta.icon
          const isOpen = expanded === cluster.category
          return (
            <motion.div
              key={cluster.category}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`bg-zinc-900 border ${meta.border} rounded-xl overflow-hidden`}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : cluster.category)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg}`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <div>
                    <p className="font-medium">{meta.label}</p>
                    <p className="text-xs text-zinc-500">{cluster.count} deal{cluster.count !== 1 ? 's' : ''} • ${(cluster.deals.reduce((s, d) => s + d.value, 0) / 1000).toFixed(0)}k lost</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                    {cluster.count}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-zinc-800/50 pt-4 space-y-5">
                      {/* Deal cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cluster.deals.map(deal => (
                          <div key={deal.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{deal.company}</p>
                              <StageBadge stage={deal.stage} />
                            </div>
                            <p className="text-xs text-zinc-500 mt-0.5">{deal.contact} • {deal.repName}</p>
                            <p className="text-xs text-brand-400 font-medium mt-2">${(deal.value / 1000).toFixed(0)}k</p>
                            <p className="text-xs text-zinc-400 mt-2 italic">&ldquo;{deal.lastActivity}&rdquo;</p>
                          </div>
                        ))}
                      </div>

                      {/* Counter-moves */}
                      <div className={`rounded-lg border ${meta.border} ${meta.bg} p-4`}>
                        <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${meta.color}`}>
                          <Lightbulb className="w-4 h-4" />
                          Suggested Counter-Moves
                        </h3>
                        <ul className="space-y-2">
                          {meta.counterMoves.map((move, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${meta.color.replace('text-', 'bg-')}`} />
                              {move}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
