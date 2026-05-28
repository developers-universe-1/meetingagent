'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone,
  BarChart3,
  Mail,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  Timer,
  Target,
  HeartPulse,
} from 'lucide-react'
import MetricCard from '@/components/MetricCard'
import SentimentBadge from '@/components/SentimentBadge'
import StageBadge from '@/components/StageBadge'
import type { DashboardSnapshot } from '@/lib/agent/analyzer'

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analyze')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
      </div>
    )
  }

  const activeDeals = data.deals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost')
  const wonDeals = data.deals.filter(d => d.stage === 'closed-won')
  const totalWon = wonDeals.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Real-time pipeline intelligence from {data.calls.length} analyzed calls
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Pipeline Value" value={`$${(data.metrics.pipelineValue / 1000).toFixed(0)}k`} subtext={`${activeDeals.length} active deals`} icon={DollarSign} color="text-brand-400" delay={0} />
        <MetricCard label="Calls Analyzed" value={String(data.metrics.callsAnalyzed)} subtext="Last 7 days" icon={Phone} color="text-emerald-400" delay={0.1} />
        <MetricCard label="Win Rate" value={`${data.metrics.winRate}%`} subtext="Year to date" icon={BarChart3} color="text-sky-400" delay={0.2} />
        <MetricCard label="Deals Closed" value={String(data.metrics.dealsClosed)} subtext={`$${(totalWon / 1000).toFixed(0)}k won`} icon={TrendingUp} color="text-violet-400" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(() => {
          const callsWithObjections = data.calls.filter(c => c.objection !== null)
          const resolvedObjections = callsWithObjections.filter(c => c.sentiment !== 'negative')
          const objectionResolutionRate = callsWithObjections.length > 0
            ? Math.round((resolvedObjections.length / callsWithObjections.length) * 100)
            : 0

          const staleThreshold = 10
          const totalValue = activeDeals.reduce((s, d) => s + d.value, 0)
          const weightedProb = totalValue > 0
            ? activeDeals.reduce((s, d) => s + (d.probability * d.value), 0) / totalValue
            : 0
          const staleDeals = activeDeals.filter(d => d.daysInStage > staleThreshold).length
          const stalePenalty = staleDeals * 8
          const distributionBonus = new Set(activeDeals.map(d => d.stage)).size * 5
          const healthScore = Math.min(100, Math.round(weightedProb + distributionBonus - stalePenalty + 20))

          return (
            <>
              <MetricCard label="Avg Deal Velocity" value={`${data.metrics.avgSalesCycle}d`} subtext="From first call to close" icon={Timer} color="text-amber-400" delay={0.35} />
              <MetricCard label="Objection Resolution Rate" value={`${objectionResolutionRate}%`} subtext={`${resolvedObjections.length} of ${callsWithObjections.length} objections cleared`} icon={Target} color="text-rose-400" delay={0.4} />
              <MetricCard label="Pipeline Health Score" value={`${healthScore}`} subtext={healthScore >= 80 ? 'Strong — low stale deal ratio' : healthScore >= 60 ? 'Moderate — review stale deals' : 'At risk — too many stalled deals'} icon={HeartPulse} color={healthScore >= 80 ? 'text-emerald-400' : healthScore >= 60 ? 'text-amber-400' : 'text-rose-400'} delay={0.45} />
            </>
          )
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Calls */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-400" />
              Recent Calls
            </h2>
            <a href="/dashboard/calls" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {data.calls.slice(0, 4).map(call => (
              <div key={call.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{call.title}</p>
                  <p className="text-xs text-zinc-500">{call.repName} • {Math.floor(call.duration / 60)}m</p>
                </div>
                <SentimentBadge sentiment={call.sentiment} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Active Pipeline */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-400" />
              Active Pipeline
            </h2>
            <a href="/dashboard/pipeline" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5">
              View all <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="space-y-3">
            {activeDeals.slice(0, 4).map(deal => (
              <div key={deal.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{deal.company}</p>
                  <p className="text-xs text-zinc-500">${(deal.value / 1000).toFixed(0)}k • {deal.repName}</p>
                </div>
                <StageBadge stage={deal.stage} />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Rep */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-brand-400" />
            Top Performer
          </h2>
          {data.reps.sort((a, b) => b.score - a.score)[0] && (
            <div>
              <p className="text-lg font-bold">{data.reps[0].name}</p>
              <p className="text-sm text-zinc-500">{data.reps[0].title}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xl font-bold text-emerald-400">{data.reps[0].score}</p>
                  <p className="text-xs text-zinc-500">Coaching Score</p>
                </div>
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <p className="text-xl font-bold text-brand-400">{data.reps[0].closeRate}%</p>
                  <p className="text-xs text-zinc-500">Close Rate</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Follow-ups */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-brand-400" />
            AI Follow-ups
          </h2>
          <div className="space-y-3">
            {data.followUps.slice(0, 3).map(fu => (
              <div key={fu.id} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                <div>
                  <p className="text-sm font-medium truncate max-w-[180px]">{fu.subject}</p>
                  <p className="text-xs text-zinc-500">{fu.company}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  fu.status === 'sent' ? 'bg-sky-950/50 text-sky-400 border-sky-900' :
                  fu.status === 'replied' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900' :
                  'bg-amber-950/50 text-amber-400 border-amber-900'
                }`}>
                  {fu.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Health */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-brand-400" />
            Pipeline Health
          </h2>
          <div className="space-y-4">
            {['discovery', 'demo', 'proposal', 'negotiation'].map(stage => {
              const count = data.deals.filter(d => d.stage === stage).length
              const total = activeDeals.length
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400 capitalize">{stage}</span>
                    <span className="text-zinc-500">{count} deals</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
