'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, DollarSign, AlertCircle } from 'lucide-react'
import StageBadge from '@/components/StageBadge'
import type { Deal } from '@/lib/demo'

const stages = ['lead', 'discovery', 'demo', 'proposal', 'negotiation', 'closed-won', 'closed-lost']

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])

  useEffect(() => {
    fetch('/api/analyze')
      .then(r => r.json())
      .then(d => setDeals(d.deals || []))
  }, [])

  const stageValue = (stage: string) =>
    deals.filter(d => d.stage === stage).reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-500" />
          Pipeline
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Deals auto-updated from call analysis. Drag to override.
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {stages.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage)
          const value = stageValue(stage)
          return (
            <div key={stage} className="min-w-[260px] flex-1">
              <div className="flex items-center justify-between mb-3">
                <StageBadge stage={stage} />
                <span className="text-xs text-zinc-500">{stageDeals.length} • ${(value / 1000).toFixed(0)}k</span>
              </div>
              <div className="space-y-2">
                {stageDeals.map((deal, i) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors"
                  >
                    <p className="text-sm font-medium">{deal.company}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{deal.contact}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-brand-400 font-medium flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {(deal.value / 1000).toFixed(0)}k
                      </span>
                      <span className="text-xs text-zinc-600">{deal.daysInStage}d</span>
                    </div>
                    {deal.probability < 30 && deal.stage !== 'closed-won' && deal.stage !== 'closed-lost' && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                        <AlertCircle className="w-3 h-3" />
                        Low probability
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
