'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Clock, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import SentimentBadge from '@/components/SentimentBadge'
import StageBadge from '@/components/StageBadge'
import type { CallAnalysis } from '@/lib/demo'

export default function CallsPage() {
  const [calls, setCalls] = useState<CallAnalysis[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/analyze')
      .then(r => r.json())
      .then(d => setCalls(d.calls || []))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Phone className="w-6 h-6 text-brand-500" />
          Call Intelligence
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Every recording analyzed for sentiment, objections, and next steps.
        </p>
      </div>

      <div className="space-y-3">
        {calls.map((call, i) => (
          <motion.div
            key={call.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
          >
            <button
              onClick={() => setExpanded(expanded === call.id ? null : call.id)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="bg-zinc-800 w-10 h-10 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="font-medium">{call.title}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {Math.floor(call.duration / 60)}m {call.duration % 60}s
                    <span className="text-zinc-700">|</span>
                    {call.repName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <SentimentBadge sentiment={call.sentiment} />
                <StageBadge stage={call.stage} />
                {call.objection && (
                  <span className="text-xs bg-rose-950/50 text-rose-400 px-2 py-0.5 rounded-full border border-rose-900 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {call.objectionCategory}
                  </span>
                )}
                {expanded === call.id ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
              </div>
            </button>

            <AnimatePresence>
              {expanded === call.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-zinc-800/50 pt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <p className="text-xs text-zinc-500">Talk Ratio</p>
                        <p className="text-sm font-medium mt-0.5">Rep {call.talkRatio.rep}% / Prospect {call.talkRatio.prospect}%</p>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <p className="text-xs text-zinc-500">Deal Value</p>
                        <p className="text-sm font-medium mt-0.5">{call.dealValue ? `$${(call.dealValue / 1000).toFixed(0)}k` : '—'}</p>
                      </div>
                      <div className="bg-zinc-800/30 rounded-lg p-3">
                        <p className="text-xs text-zinc-500">Next Steps</p>
                        <p className="text-sm font-medium mt-0.5">{call.nextSteps}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">Transcript</p>
                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-mono">
                        {call.transcript}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
